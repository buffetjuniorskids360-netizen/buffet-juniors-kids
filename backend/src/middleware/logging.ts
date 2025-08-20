import pino from 'pino';
import type { Request, Response, NextFunction } from 'express';

// Configurar logger com Pino
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
});

// Middleware de logging para requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Gerar correlation ID para rastrear requests
  const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Adicionar correlation ID ao request e response
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Log do request
  logger.info({
    correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req.user as any)?.id,
  }, 'Incoming request');
  
  // Interceptar o fim da response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: (req.user as any)?.id,
    }, 'Request completed');
  });
  
  next();
};

// Middleware de tratamento de erros com logging
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    correlationId: req.correlationId,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    method: req.method,
    url: req.url,
    userId: (req.user as any)?.id,
  }, 'Request error');
  
  next(error);
};

// Extender interface Request para incluir correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}