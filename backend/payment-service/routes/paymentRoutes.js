const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { 
  protect, 
  requirePaymentAccess, 
  requirePaymentCreation, 
  requirePaymentManagement 
} = require('../middlewares/authMiddleware');
const {
  validateCreatePayment,
  validateOrderCompletedForPayment,
  validatePaymentId,
  validateReservationId,
  validatePaymentMethod,
  validateDiscountId,
  validatePaymentStatus
} = require('../middlewares/paymentValidation');

// Tạo payment mới
router.post('/', 
  protect, 
  requirePaymentCreation,
  validateCreatePayment,
  validatePaymentMethod,
  validateDiscountId,
  validateOrderCompletedForPayment,
  paymentController.createPayment
);

// Lấy tất cả payments
router.get('/', 
  protect, 
  requirePaymentAccess,
  paymentController.getAllPayments
);

// Lấy payment theo ID
router.get('/:id', 
  protect, 
  requirePaymentAccess,
  validatePaymentId,
  paymentController.getPaymentById
);

// Lấy payments theo reservationId
router.get('/by-reservation/:reservationId', 
  protect, 
  requirePaymentAccess,
  validateReservationId,
  paymentController.getPaymentsByReservationId
);

// Cập nhật trạng thái payment
router.patch('/:id/status', 
  protect, 
  requirePaymentManagement,
  validatePaymentId,
  validatePaymentStatus,
  paymentController.updatePaymentStatus
);

// Xóa payment
router.delete('/:id', 
  protect, 
  requirePaymentManagement,
  validatePaymentId,
  paymentController.deletePayment
);

module.exports = router;
