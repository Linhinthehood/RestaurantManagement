const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

// Import raw-body for handling multipart requests
const getRawBody = require('raw-body');

// Import raw-body for handling multipart requests
const getRawBody = require('raw-body');

const app = express();
const PORT = 3000;

app.use(cors());

// Proxy configuration với timeout và error handling
const proxyOptions = {
  changeOrigin: true,
  timeout: 30000, // 30 seconds timeout
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    console.error("Proxy Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Service temporarily unavailable",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} -> ${
        proxyReq.path
      }`
    );

    // Forward Authorization header
    if (req.headers.authorization) {
      proxyReq.setHeader("Authorization", req.headers.authorization);
    }

    // Log request headers
    console.log('Request Headers:', proxyReq.getHeaders());
    
    // Handle body for POST/PUT requests (only for JSON requests)
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && 
        req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
    
    // For multipart/form-data, forward the raw body
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data') && req.rawBody) {
      console.log('Forwarding multipart body, length:', req.rawBody.length);
      proxyReq.write(req.rawBody);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} -> ${
        proxyRes.statusCode
      }`
    );
  },
};

// Parse JSON body for all routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Handle multipart/form-data for file uploads
app.use(async (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    try {
      // Get raw body for multipart requests
      const rawBody = await getRawBody(req, {
        length: req.headers['content-length'],
        limit: '10mb'
      });
      
      // Store raw body for proxy to use
      req.rawBody = rawBody;
      console.log('Multipart request body captured, length:', rawBody.length);
      next();
    } catch (err) {
      console.error('Error reading multipart body:', err);
      next(err);
    }
  } else {
    next();
  }
});

// Handle multipart/form-data for file uploads
app.use(async (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    try {
      // Get raw body for multipart requests
      const rawBody = await getRawBody(req, {
        length: req.headers['content-length'],
        limit: '10mb'
      });
      
      // Store raw body for proxy to use
      req.rawBody = rawBody;
      console.log('Multipart request body captured, length:', rawBody.length);
      next();
    } catch (err) {
      console.error('Error reading multipart body:', err);
      next(err);
    }
  } else {
    next();
  }
});

// Proxy routes với cấu hình được cải thiện
app.use(
  "/api/auth",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://user-service:3001",
    pathRewrite: { "^/api/auth": "/api/auth" },
  })
);

app.use(
  "/api/v1/reservations",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://reservation-service:3002",
    pathRewrite: { "^/api/v1/reservations": "/api/v1/reservations" },
  })
);

app.use(
  "/api/v1/customers",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://reservation-service:3002",
    pathRewrite: { "^/api/v1/customers": "/api/v1/customers" },
  })
);

app.use(
  "/api/foods",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://food-service:3003",
    pathRewrite: { "^/api/foods": "/api/foods" },
  })
);

app.use(
  "/api/categories",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://food-service:3003",
    pathRewrite: { "^/api/categories": "/api/categories" },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://order-service:3004",
    pathRewrite: { "^/api/orders": "/api/orders" },
  })
);

app.use(
  "/api/order-items",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://order-service:3004",
    pathRewrite: { "^/api/order-items": "/api/order-items" },
  })
);

app.use(
  "/api/v1/tables",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://table-service:3005",
    pathRewrite: { "^/api/v1/tables": "/api/v1/tables" },
  })
);

app.use(
  "/api/payments",
  createProxyMiddleware({
    ...proxyOptions,
    target: "http://payment-service:3006",
    pathRewrite: { "^/api/payments": "/api/payments" },
  })
);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is running!",
    timestamp: new Date().toISOString(),
    services: {
      "user-service": "http://user-service:3001",
      "reservation-service": "http://reservation-service:3002",
      "food-service": "http://food-service:3003",
      "order-service": "http://order-service:3004",
      "table-service": "http://table-service:3005",
      "payment-service": "http://payment-service:3006",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/`);
});
