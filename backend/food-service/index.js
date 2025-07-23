const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDB();

const categoryRoutes = require('./routes/categoryRoutes');
const foodRoutes = require('./routes/foodRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);

// Route mẫu
// app.get('/', (req, res) => {
//   res.json({ message: 'Food Service is running!' });
// });

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Food Service đang chạy tại http://localhost:${PORT}`);
}); 