const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Tạo mới payment
router.post('/', paymentController.createPayment);
// Lấy tất cả payment
router.get('/', paymentController.getAllPayments);
// Lấy payment theo id
router.get('/:id', paymentController.getPaymentById);
// Cập nhật payment
router.put('/:id', paymentController.updatePayment);
// Xóa payment
router.delete('/:id', paymentController.deletePayment);

module.exports = router; 