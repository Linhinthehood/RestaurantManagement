const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDB();

// Route mẫu
app.get('/', (req, res) => {
  res.json({ message: 'Payment Service is running!' });
});

app.use('/api/payments', paymentRoutes);

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Payment Service đang chạy tại http://localhost:${PORT}`);
}); 