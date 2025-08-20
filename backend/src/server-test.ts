import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Backend está funcionando!',
  });
});

// Test auth endpoint
app.post('/api/auth/test', (req, res) => {
  res.json({
    message: 'Endpoint de teste funcionando',
    receivedData: req.body,
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Test auth: http://localhost:${port}/api/auth/test`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});