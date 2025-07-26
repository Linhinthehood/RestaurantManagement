import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDB } from './config/db.js';
import authRouter from './routes/authRouter.js';

// Load environment variables
dotenv.config();

// Connect to database
connectToDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Restaurant Management User Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Service is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/auth`);
});