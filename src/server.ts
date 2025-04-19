import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction, Application, RequestHandler } from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import logger, { requestLogger, errorLogger } from '@/utils/logger';
import { SearchResult } from '@/types/global';

// Create Express application with explicit type
const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://your-production-domain.com'
  ],
  methods: ['GET', 'POST']
}));

// Context middleware with proper typing
app.use((req: Request, res: Response, next: NextFunction) => {
  // Extend Request type via declaration merging (defined in types/express.d.ts)
  req.context = {
    startTime: Date.now(),
    ip: req.ip || 'unknown-ip',
    userAgent: req.get('User-Agent') || ''
  };
  next();
});

// Request logging
app.use(requestLogger);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many requests' });
  }
});
app.use('/chat', limiter);

// Search functionality implementation
const detectSearchIntent = (message: string): boolean => {
  const searchKeywords = ['search for', 'find', 'look up', 'current info on', 'latest about'];
  return new RegExp(searchKeywords.join('|'), 'i').test(message);
};

const performSearch = async (query: string): Promise<SearchResult[]> => {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SerpAPI key missing');

  const response = await axios.get('https://serpapi.com/search', {
    params: { q: query, api_key: apiKey },
    timeout: 10000
  });

  return response.data.organic_results || [];
};

const formatSearchResults = (results: SearchResult[]): string => {
  if (!results.length) return 'No relevant results found.';
  return results.slice(0, 3)
    .map((result, index) => `${index + 1}. ${result.title}\n   ${result.link}\n   ${result.snippet}`)
    .join('\n');
};

// Chat handler implementation
const handleOpenRouterRequest = async (userMessage: string) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OpenRouter API key missing');

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.HTTP_REFERER || 'http://localhost:3000',
          'X-Title': 'Quest Support Chatbot'
        },
        timeout: 10000
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Unexpected response structure');
    }

    return { 
      reply: response.data.choices[0].message.content, 
      isSearch: false 
    };
  } catch (error: any) {
    logger.error('OpenRouter API Failure', error);
    throw new Error(error.response?.data?.error?.message || 'Chat service error');
  }
};

// Chat endpoint with proper typing
app.post('/chat', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userMessage = req.body?.message?.trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'Message required' });
    }

    if (detectSearchIntent(userMessage)) {
      const searchResults = await performSearch(userMessage);
      const formattedResults = formatSearchResults(searchResults);
      return res.json({ reply: formattedResults, isSearch: true });
    }

    const { reply } = await handleOpenRouterRequest(userMessage);
    return res.json({ reply, isSearch: false });

  } catch (error: any) {
    next(error);
  }
}) as RequestHandler);

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  errorLogger(error, req, res, next);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// Server startup validation
const startServer = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    logger.error('FATAL: Missing OpenRouter API key');
    process.exit(1);
  }

  if (!process.env.SERPAPI_KEY) {
    logger.warn('Search functionality disabled - missing SerpAPI key');
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.debug('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    });
  });
};

// Start the server
startServer();