const mongoose = require('mongoose');

// Validate ObjectId
const validateObjectId = (field) => (req, res, next) => {
  const value = req.body[field] || req.params[field];
  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ 
      success: false,
      error: `${field} không hợp lệ` 
    });
  }
  next();
};

// Validate payment method
const validatePaymentMethod = (req, res, next) => {
  const { paymentMethod } = req.body;
  const validMethods = ['Cash', 'Momo'];
  
  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      error: 'paymentMethod là bắt buộc'
    });
  }
  
  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: `paymentMethod phải là một trong: ${validMethods.join(', ')}`
    });
  }
  
  next();
};

// Validate discount code format
const validateDiscountCode = (req, res, next) => {
  const { discountCode } = req.body;
  
  if (discountCode && typeof discountCode !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'discountCode phải là chuỗi'
    });
  }
  
  if (discountCode && discountCode.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'discountCode không được để trống'
    });
  }
  
  if (discountCode && discountCode.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'discountCode không được quá 50 ký tự'
    });
  }
  
  next();
};

// Validate notes length
const validateNotes = (req, res, next) => {
  const { notes } = req.body;
  
  if (notes && typeof notes !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'notes phải là chuỗi'
    });
  }
  
  if (notes && notes.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'notes không được quá 500 ký tự'
    });
  }
  
  next();
};

// Validate required fields for creating payment
const validateCreatePayment = (req, res, next) => {
  const { reservationId, paymentMethod } = req.body;
  
  if (!reservationId) {
    return res.status(400).json({
      success: false,
      error: 'reservationId là bắt buộc'
    });
  }
  
  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      error: 'paymentMethod là bắt buộc'
    });
  }
  
  next();
};

// Validate payment ID parameter
const validatePaymentId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Payment ID không hợp lệ'
    });
  }
  
  next();
};

// Validate reservation ID parameter
const validateReservationId = (req, res, next) => {
  const { reservationId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res.status(400).json({
      success: false,
      error: 'Reservation ID không hợp lệ'
    });
  }
  
  next();
};

// Validate update payment fields
const validateUpdatePayment = (req, res, next) => {
  const allowedFields = ['status', 'notes', 'transactionInfo'];
  const updateFields = Object.keys(req.body);
  
  const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
  
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Không được cập nhật các trường: ${invalidFields.join(', ')}`
    });
  }
  
  next();
};

// Validate payment status
const validatePaymentStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded'];
  
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `status phải là một trong: ${validStatuses.join(', ')}`
    });
  }
  
  next();
};

module.exports = {
  validateObjectId,
  validatePaymentMethod,
  validateDiscountCode,
  validateNotes,
  validateCreatePayment,
  validatePaymentId,
  validateReservationId,
  validateUpdatePayment,
  validatePaymentStatus
};
