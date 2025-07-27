const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDB();

// Sử dụng routes cho Order và OrderItem
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/order-items', require('./routes/orderItemRoutes'));

// Route mẫu
app.get('/', (req, res) => {
  res.json({ message: 'Order Service is running!' });
});

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Order Service đang chạy tại http://localhost:${PORT}`);
}); 