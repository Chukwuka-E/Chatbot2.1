import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare module 'express' {
  interface Request {
    context: {
      startTime: number;
      ip: string;
      userAgent?: string;
    };
    ip: string;
  }

  interface Response {
    on(event: string, listener: (...args: any[]) => void): this;
  }
}