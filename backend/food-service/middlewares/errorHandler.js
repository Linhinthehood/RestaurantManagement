// Middleware xử lý lỗi chung
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Lỗi validation của Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      error: 'Dữ liệu không hợp lệ',
      details: errors
    });
  }

  // Lỗi duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} đã tồn tại trong hệ thống`
    });
  }

  // Lỗi Cast Error (ObjectId không hợp lệ)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID không hợp lệ'
    });
  }

  // Lỗi mặc định
  res.status(500).json({
    error: 'Lỗi server nội bộ',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Đã xảy ra lỗi'
  });
};

// Middleware xử lý 404
const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'API endpoint không tồn tại'
  });
};

module.exports = {
  errorHandler,
  notFound
}; 