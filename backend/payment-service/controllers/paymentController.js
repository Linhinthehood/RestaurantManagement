const Payment = require('../models/Payment');
const axios = require('axios');

// Tạo mới payment dựa trên reservationId
exports.createPayment = async (req, res) => {
  try {
    const { reservationId, paymentMethod } = req.body;
    if (!reservationId || !paymentMethod) {
      return res.status(400).json({ error: 'reservationId và paymentMethod là bắt buộc' });
    }
    // Gọi order-service để lấy danh sách order theo reservationId
    const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
    const response = await axios.get(`${orderServiceUrl}/api/orders/by-reservation/${reservationId}`);
    const orders = response.data;
    if (!orders || orders.length === 0) {
      return res.status(400).json({ error: 'Không có order nào cho reservationId này' });
    }
    // Kiểm tra tất cả order phải Completed
    const allCompleted = orders.every(order => order.orderStatus === 'Completed');
    if (!allCompleted) {
      return res.status(400).json({ error: 'Tất cả order phải ở trạng thái Completed trước khi thanh toán' });
    }
    // Tổng hợp tổng tiền
    const totalAmount = orders.reduce((sum, order) => {
      let price = order.totalPrice;
      if (price && typeof price === 'object' && price.$numberDecimal) {
        price = Number(price.$numberDecimal);
      } else {
        price = Number(price);
      }
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    // Tạo payment
    const payment = new Payment({
      orderId: orders.map(order => order._id),
      paymentMethod,
      totalAmount,
      createdAt: new Date()
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(400).json({ error: err.response.data.error });
    }
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả payment
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy payment theo id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 