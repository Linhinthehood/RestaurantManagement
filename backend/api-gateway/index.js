const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
// app.use(express.json()); // Không nên dùng cho toàn bộ app gateway, chỉ dùng ở backend service

// Log mọi request vào gateway
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Proxy cho Food Service
app.use('/api/foods', createProxyMiddleware({
  target: 'http://food-service:3003',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('[Proxy Error][Food Service]', err.message);
    res.status(500).json({ error: 'Proxy error to Food Service', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[ProxyReq][Food] ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ProxyRes][Food] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
  },
}));
app.use('/api/categories', createProxyMiddleware({
  target: config.services.food.url,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('[Proxy Error][Food Service]', err.message);
    res.status(500).json({ error: 'Proxy error to Food Service', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[ProxyReq][Category] ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ProxyRes][Category] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
  },
}));

// Proxy cho Order Service
app.use('/api/orders', createProxyMiddleware({
  target: config.services.order.url,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '/api/orders' },
  onError: (err, req, res) => {
    console.error('[Proxy Error][Order Service]', err.message);
    res.status(500).json({ error: 'Proxy error to Order Service', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[ProxyReq][Order] ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ProxyRes][Order] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
  },
}));
app.use('/api/order-items', createProxyMiddleware({
  target: config.services.order.url,
  changeOrigin: true,
  pathRewrite: { '^/api/order-items': '/api/order-items' },
  onError: (err, req, res) => {
    console.error('[Proxy Error][Order Service]', err.message);
    res.status(500).json({ error: 'Proxy error to Order Service', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[ProxyReq][OrderItem] ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ProxyRes][OrderItem] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
  },
}));
app.use('/mock', createProxyMiddleware({
  target: config.services.order.url,
  changeOrigin: true,
  pathRewrite: { '^/mock': '/mock' },
  onError: (err, req, res) => {
    console.error('[Proxy Error][Order Service]', err.message);
    res.status(500).json({ error: 'Proxy error to Order Service', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[ProxyReq][Mock] ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ProxyRes][Mock] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
  },
}));

// Proxy cho Payment Service
app.use('/api/payments', createProxyMiddleware({
  target: config.services.payment.url,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '/api/payments' },
  onError: (err, req, res) => {
    console.error('[Proxy Error][Payment Service]', err.message);
    res.status(500).json({ error: 'Proxy error to Payment Service', message: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[ProxyReq][Payment] ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ProxyRes][Payment] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
  },
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Gateway Error]', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.env === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`API Gateway is running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Food Service URL: ${config.services.food.url}`);
  console.log(`Order Service URL: ${config.services.order.url}`);
  console.log(`Payment Service URL: ${config.services.payment.url}`);
}); 