const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

// Import raw-body for handling multipart requests
const getRawBody = require('raw-body');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment variables
    const allowedOrigins = [
      // Production frontend URLs from environment
      process.env.STAFF_FRONTEND_URL,
      process.env.CUSTOMER_FRONTEND_URL,
      // Development URLs (always allowed)
      'http://localhost:4000',
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Service URLs configuration
const serviceUrls = {
  userService: process.env.USER_SERVICE_URL,
  reservationService: process.env.RESERVATION_SERVICE_URL,
  foodService: process.env.FOOD_SERVICE_URL,
  orderService: process.env.ORDER_SERVICE_URL,
  tableService: process.env.TABLE_SERVICE_URL,
  paymentService: process.env.PAYMENT_SERVICE_URL
};

// Log service configuration
console.log('🚀 API Gateway Configuration:');
console.log('Service URLs:', serviceUrls);

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

// Proxy routes với cấu hình được cải thiện
app.use(
  "/api/auth",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.userService,
    pathRewrite: { "^/api/auth": "/api/auth" },
  })
);

app.use(
  "/api/v1/reservations",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.reservationService,
    pathRewrite: { "^/api/v1/reservations": "/api/v1/reservations" },
  })
);

app.use(
  "/api/v1/customers",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.reservationService,
    pathRewrite: { "^/api/v1/customers": "/api/v1/customers" },
  })
);

app.use(
  "/api/foods",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.foodService,
    pathRewrite: { "^/api/foods": "/api/foods" },
  })
);

app.use(
  "/api/categories",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.foodService,
    pathRewrite: { "^/api/categories": "/api/categories" },
  })
);

app.use(
  "/api/orders",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.orderService,
    pathRewrite: { "^/api/orders": "/api/orders" },
  })
);

app.use(
  "/api/order-items",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.orderService,
    pathRewrite: { "^/api/order-items": "/api/order-items" },
  })
);

app.use(
  "/api/v1/tables",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.tableService,
    pathRewrite: { "^/api/v1/tables": "/api/v1/tables" },
  })
);

app.use(
  "/api/payments",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.paymentService,
    pathRewrite: { "^/api/payments": "/api/payments" },
  })
);

app.use(
  "/api/discounts",
  createProxyMiddleware({
    ...proxyOptions,
    target: serviceUrls.paymentService,
    pathRewrite: { "^/api/discounts": "/api/discounts" },
  })
);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    services: {
      "user-service": serviceUrls.userService,
      "reservation-service": serviceUrls.reservationService,
      "food-service": serviceUrls.foodService,
      "order-service": serviceUrls.orderService,
      "table-service": serviceUrls.tableService,
      "payment-service": serviceUrls.paymentService,
    },
  });
});

// Additional health check endpoint for Render
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  console.log(`🏥 Health check (Render): http://localhost:${PORT}/healthz`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
