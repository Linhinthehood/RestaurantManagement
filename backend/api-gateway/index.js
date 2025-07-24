const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Proxy config
app.use('/api/users', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true, pathRewrite: { '^/api/users': '/api/users' } }));
app.use('/api/reservations', createProxyMiddleware({ target: 'http://reservation-service:3002', changeOrigin: true, pathRewrite: { '^/api/reservations': '/api/reservations' } }));
app.use('/api/foods', createProxyMiddleware({ target: 'http://food-service:3003', changeOrigin: true, pathRewrite: { '^/api/foods': '/api/foods' } }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://order-service:3004', changeOrigin: true, pathRewrite: { '^/api/orders': '/api/orders' } }));
app.use('/api/tables', createProxyMiddleware({ target: 'http://table-service:3005', changeOrigin: true, pathRewrite: { '^/api/tables': '/api/tables' } }));
app.use('/api/payments', createProxyMiddleware({ target: 'http://payment-service:3006', changeOrigin: true, pathRewrite: { '^/api/payments': '/api/payments' } }));

app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running!' });
});

app.listen(PORT, () => {
  console.log(`API Gateway đang chạy tại http://localhost:${PORT}`);
}); 