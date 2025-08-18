const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import routes
const routes = require('./routes');

// Mount API routes
app.use('/api', routes);

// Basic route để test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Payment Service is running!',
    timestamp: new Date().toISOString(),
    api: '/api'
  });
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
