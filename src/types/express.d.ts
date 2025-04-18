// src/types/express.d.ts
import type { Request, Response, NextFunction, Application } from 'express';

declare global {
  namespace Express {
    // Enhanced Request type
    interface Request {
      context: {
        startTime: number;
        ip: string;
        userAgent: string;
      };
    }

    // Enhanced Application type
    interface Application {
      use: (
        middleware: (
          req: Request,
          res: Response,
          next: NextFunction
        ) => void
      ) => this;
    }
  }
}

// Export merged interfaces
export interface ContextEnhancedRequest extends Request {
  context: {
    startTime: number;
    ip: string;
    userAgent: string;
  };
}

export interface EnhancedApplication extends Application {}