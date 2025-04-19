import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    context?: {
      startTime: number;
      ip: string;
      userAgent?: string;
    };
  }
}

declare module 'express' {
  export interface Application {
    use(middleware: (req: Request, res: Response, next: NextFunction) => void): this;
    use(path: string, middleware: (req: Request, res: Response, next: NextFunction) => void): this;
    use(errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void): this;
  }
}