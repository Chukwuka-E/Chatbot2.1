import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ======================
// Middleware Setup
// ======================
const allowedOrigins = [
  'https://chatbot-cwg0.onrender.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req: Request) => req.ip || 'default-key',
});
app.use('/chat', limiter);

// Security Middleware
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 'loopback');
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers.host?.startsWith('localhost')) return next();
    
    if (!req.secure) {
      if (!req.headers.host || req.headers.host.includes(':')) {
         res.status(400).json({ error: 'Invalid request' });
      }
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
});

// Path validation middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (/[:*?]/.test(req.path)) {
     res.status(400).json({ error: 'Invalid URL pattern' });
  }
  next();
});

// ======================
// Logging Configuration
// ======================
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => 
      `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'server.log') 
    })
  ]
});

// ======================
// Core Application Logic
// ======================
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ======================
// Helper Functions
// ======================
const detectSearchIntent = (message: string): boolean => {
  const searchKeywords = ['search for', 'find', 'look up', 'current info on', 'latest about'];
  return new RegExp(searchKeywords.join('|'), 'i').test(message);
};

const performSearch = async (query: string) => {
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) throw new Error('SerpAPI key missing');
  
  const response = await axios.get('https://serpapi.com/search', {
    params: { q: query, api_key: serpApiKey },
    timeout: 10000
  });
  
  return response.data.organic_results || [];
};

const formatSearchResults = (results: any[]) => {
  if (results.length === 0) return 'No relevant search results found.';
  
  return `Here's what I found:\n${results.slice(0, 3).map((result, i) => 
    `${i + 1}. ${result.title}\n   ${result.link}\n   ${result.snippet}`
  ).join('\n')}`;
};

// ======================
// API Routes
// ======================
app.post('/chat', async (req: Request, res: Response) => {
  try {
    const userMessage: string = req.body?.message;
    if (!userMessage) {
      res.status(400).json({ error: 'Message required' });
      return;
    }

    if (detectSearchIntent(userMessage)) {
      const searchResults = await performSearch(userMessage);
      const formattedResults = formatSearchResults(searchResults);
       res.json({ 
        reply: formattedResults,
        isSearch: true
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error('OpenRouter API key missing');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

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
          'HTTP-Referer': 'https://chatbot-cwg0.onrender.com',
          'X-Title': 'Quest Support Chatbot'
        },
        timeout: 10000
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Invalid OpenRouter response structure');

    res.json({ 
      reply: reply,
      isSearch: false
    });

  } catch (error: any) {
    logger.error(`Chat Error: ${error.message}`);
    res.status(500).json({
      error: error.response?.data?.error?.message || 'Chat service unavailable'
    });
  }
});

// ======================
// Server Initialization
// ======================
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ Server running on port ${PORT}`);
});