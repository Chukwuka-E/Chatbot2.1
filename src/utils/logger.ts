// src/utils/logger.ts
import type { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Environment type moved here for self-containment
type Environment = 'development' | 'production' | 'test';

const NODE_ENV = (process.env.NODE_ENV as Environment) || 'development';

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

// Main logger instance
const logger = winston.createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    NODE_ENV === 'development' 
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.File({ 
      filename: 'logs/errors.log', 
      level: 'error',
      handleRejections: true
    })
  ]
});

// Enhanced request typing
interface ContextRequest extends Request {
  context: {
    startTime: number;
    ip: string;
    userAgent: string;
  };
}

export const requestLogger = (
  req: ContextRequest,
  res: Response,
  next: NextFunction
) => {
  req.context = {
    startTime: Date.now(),
    ip: req.ip || 'unknown-ip',
    userAgent: req.get('User-Agent') || ''
  };

  res.on('finish', () => {
    const duration = Date.now() - req.context.startTime;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - ${req.ip}`
    );
  });

  next();
};

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  next(error);
};

// Named export instead of default
export { logger };