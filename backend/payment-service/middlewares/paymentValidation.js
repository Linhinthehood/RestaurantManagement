const mongoose = require('mongoose');
const ExternalService = require('../services/externalService');

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

// Validate discount ID
const validateDiscountId = (req, res, next) => {
  const { discountId } = req.body;
  
  if (discountId && !mongoose.Types.ObjectId.isValid(discountId)) {
    return res.status(400).json({
      success: false,
      error: 'discountId không hợp lệ'
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

// Validate order status phải là "Completed" trước khi tạo payment
const validateOrderCompletedForPayment = async (req, res, next) => {
  const { reservationId } = req.body;
  
  try {
    // Lấy orders theo reservationId
    const ordersResponse = await ExternalService.getOrdersByReservationId(reservationId, req.headers.authorization);
    
    if (!ordersResponse || !ordersResponse.data || ordersResponse.data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không tìm thấy order nào cho reservation này'
      });
    }
    
    // Kiểm tra order đầu tiên có trạng thái "Completed" không
    const order = ordersResponse.data[0];
    if (order.orderStatus !== 'Completed') {
      return res.status(400).json({
        success: false,
        error: `Chỉ có thể tạo payment cho order có trạng thái "Completed". Trạng thái hiện tại: ${order.orderStatus}`
      });
    }
    
    next();
  } catch (error) {
    console.error('Error validating order status for payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi khi kiểm tra trạng thái order'
    });
  }
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

// Validate payment status
const validatePaymentStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Completed', 'Cancelled'];
  
  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'status là bắt buộc'
    });
  }
  
  if (!validStatuses.includes(status)) {
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
  validateDiscountId,
  validateCreatePayment,
  validateOrderCompletedForPayment,
  validatePaymentId,
  validateReservationId,
  validatePaymentStatus
};
