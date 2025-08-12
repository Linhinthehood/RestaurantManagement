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
  validatePaymentId,
  validateReservationId,
  validatePaymentMethod,
  validateDiscountCode,
  validateNotes,
  validateUpdatePayment,
  validatePaymentStatus
} = require('../middlewares/paymentValidation');

// Tạo payment mới
router.post('/', 
  protect, 
  requirePaymentCreation,
  validateCreatePayment,
  validatePaymentMethod,
  validateDiscountCode,
  validateNotes,
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

module.exports = router;
