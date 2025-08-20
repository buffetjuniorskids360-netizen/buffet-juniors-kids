import express from 'express';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from './middleware/auth.js';
import { requestLogger, errorLogger, logger } from './middleware/logging.js';
import { testConnection } from './db/connection.js';

// Routes
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import eventRoutes from './routes/events.js';
import paymentRoutes from './routes/payments.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Helmet for security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - aceitar múltiplas portas do Vite
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    /^http:\/\/localhost:\d+$/ // Aceita qualquer porta localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Muitas tentativas',
    message: 'Tente novamente em 15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Session configuration
const PgSession = ConnectPgSimple(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  name: 'buffet.sid',
  secret: process.env.SESSION_SECRET || (() => {
    throw new Error('SESSION_SECRET environment variable is required in production');
  })(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  etag: true,
  lastModified: true,
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `Rota ${req.method} ${req.originalUrl} não existe`,
  });
});

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = (error as any).status || 500;
  
  res.status(status).json({
    error: status === 500 ? 'Erro interno do servidor' : error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      correlationId: req.correlationId,
    }),
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Import port utilities
    const { findAvailablePort, setupGracefulShutdown } = await import('./utils/port.js');
    
    // Find available port
    const availablePort = await findAvailablePort(parseInt(port.toString()));
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Continuing without DB...');
      // Continue without DB for initial testing
    } else {
      console.log('✅ Database connected successfully');
    }
    
    const server = app.listen(availablePort, () => {
      console.log(`\n🚀 Backend Server Running!`);
      console.log(`📡 Port: ${availablePort}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📊 Health: http://localhost:${availablePort}/health`);
      console.log(`🔐 Auth: http://localhost:${availablePort}/api/auth`);
      console.log(`\n✨ Ready for connections!\n`);
      
      logger.info({
        port: availablePort,
        environment: process.env.NODE_ENV || 'development',
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
      }, 'Server started successfully');
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();