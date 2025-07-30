const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());

// Proxy configuration với timeout và error handling
const proxyOptions = {
  changeOrigin: true,
  timeout: 30000, // 30 seconds timeout
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${proxyReq.path}`);
    
    // Log request headers
    console.log('Request Headers:', proxyReq.getHeaders());
    
    // Handle body for POST/PUT requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
  }
};

// Parse JSON body for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Proxy routes với cấu hình được cải thiện
app.use('/api/auth', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://user-service:3001',
  pathRewrite: { '^/api/auth': '/api/auth' }
}));

app.use('/api/v1/reservations', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://reservation-service:3002',
  pathRewrite: { '^/api/v1/reservations': '/api/v1/reservations' }
}));

app.use('/api/v1/customers', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://reservation-service:3002',
  pathRewrite: { '^/api/v1/customers': '/api/v1/customers' }
}));

app.use('/api/foods', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://food-service:3003',
  pathRewrite: { '^/api/foods': '/api/foods' }
}));

app.use('/api/orders', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://order-service:3004',
  pathRewrite: { '^/api/orders': '/api/orders' }
}));

app.use('/api/v1/tables', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://table-service:3005',
  pathRewrite: { '^/api/v1/tables': '/api/v1/tables' }
}));

app.use('/api/payments', createProxyMiddleware({ 
  ...proxyOptions,
  target: 'http://payment-service:3006',
  pathRewrite: { '^/api/payments': '/api/payments' }
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gateway is running!',
    timestamp: new Date().toISOString(),
    services: {
      'user-service': 'http://user-service:3001',
      'reservation-service': 'http://reservation-service:3002',
      'food-service': 'http://food-service:3003',
      'order-service': 'http://order-service:3004',
      'table-service': 'http://table-service:3005',
      'payment-service': 'http://payment-service:3006'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
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

app.listen(PORT, () => {
  console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/`);
}); 