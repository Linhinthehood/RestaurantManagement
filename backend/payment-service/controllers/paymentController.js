const Payment = require('../models/Payment');
const Discount = require('../models/Discount');
const ExternalService = require('../services/externalService');

// Tạo payment mới
exports.createPayment = async (req, res) => {
  try {
    const { reservationId, paymentMethod, discountId } = req.body;
    
    // Lấy thông tin user từ token
    const userProfile = await ExternalService.getUserProfile(req.headers.authorization);
    if (!userProfile || !userProfile.data || !userProfile.data.user) {
      return res.status(401).json({
        success: false,
        message: 'Không thể xác thực người dùng'
      });
    }
    const createdBy = userProfile.data.user._id;

    // Kiểm tra reservation tồn tại
    const reservation = await ExternalService.getReservationById(reservationId, req.headers.authorization);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation không tồn tại'
      });
    }

    // Lấy orders theo reservationId
    const ordersResponse = await ExternalService.getOrdersByReservationId(reservationId, req.headers.authorization);
    if (!ordersResponse || !ordersResponse.data || ordersResponse.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy order nào cho reservation này'
      });
    }

    // Lấy order đầu tiên (giả sử mỗi reservation chỉ có 1 order)
    const order = ordersResponse.data[0];
    
    // Kiểm tra và parse totalPrice từ Decimal128
    let originalAmount;
    if (order.totalPrice && typeof order.totalPrice === 'object' && order.totalPrice.$numberDecimal) {
      // Nếu là Decimal128 object
      originalAmount = parseFloat(order.totalPrice.$numberDecimal);
    } else if (order.totalPrice) {
      // Nếu là string hoặc number
      originalAmount = parseFloat(order.totalPrice);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Order không có totalPrice hợp lệ'
      });
    }
    
    if (isNaN(originalAmount) || originalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Order totalPrice không hợp lệ'
      });
    }
    
    // Parse deposit amount từ Decimal128
    let depositAmount;
    if (reservation.deposit && typeof reservation.deposit === 'object' && reservation.deposit.$numberDecimal) {
      depositAmount = parseFloat(reservation.deposit.$numberDecimal);
    } else {
      depositAmount = parseFloat(reservation.deposit || 0);
    }
    
    if (isNaN(depositAmount)) {
      depositAmount = 0;
    }
    
    console.log('Order data:', order);
    console.log('Order totalPrice:', order.totalPrice);
    console.log('Original amount:', originalAmount);
    console.log('Deposit amount:', depositAmount);

    // Xử lý mã giảm giá nếu có
    let discountAmount = 0;
    if (discountId) {
      const discount = await Discount.findById(discountId);
      if (discount && discount.isValid) {
        discountAmount = (originalAmount * discount.discountPercentage) / 100;
        
        // Cập nhật số lần sử dụng
        discount.usedCount += 1;
        await discount.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
        });
      }
    }

    // Tính thuế VAT (10%)
    const taxAmount = (originalAmount * 10) / 100;

    // Tính số tiền cuối cùng
    const finalAmount = originalAmount + taxAmount - discountAmount - depositAmount;
    
    console.log('Tax amount:', taxAmount);
    console.log('Discount amount:', discountAmount);
    console.log('Final amount:', finalAmount);

    // Tạo payment mới
    const payment = new Payment({
      reservationId,
      paymentMethod,
      originalAmount,
      discountId: discountId || null,
      finalAmount,
      createdBy,
      status: 'Pending'
    });

    await payment.save();

    // Enrich payment với thông tin đầy đủ
    const enrichedPayment = await enrichPayment(payment, req);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: enrichedPayment
    });

  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy thông tin payment theo ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const enrichedPayment = await enrichPayment(payment, req);

    res.json({
      success: true,
      message: 'Payment retrieved successfully',
      data: enrichedPayment
    });

  } catch (err) {
    console.error('Error getting payment by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy tất cả payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    
    const enrichedPayments = await Promise.all(
      payments.map(payment => enrichPayment(payment, req))
    );

    res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: enrichedPayments
    });

  } catch (err) {
    console.error('Error getting all payments:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy payments theo reservationId
exports.getPaymentsByReservationId = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const payments = await Payment.find({ reservationId }).sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy payment nào cho reservation này'
      });
    }

    const enrichedPayments = await Promise.all(
      payments.map(payment => enrichPayment(payment, req))
    );

    res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: enrichedPayments
    });

  } catch (err) {
    console.error('Error getting payments by reservation ID:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Cập nhật trạng thái payment
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status phải là một trong: ${validStatuses.join(', ')}`
      });
    }

    // Tìm payment trước
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Cập nhật status và gọi save() để trigger middleware
    payment.status = status;
    await payment.save();

    const enrichedPayment = await enrichPayment(payment, req);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: enrichedPayment
    });

  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Xóa payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await Payment.findByIdAndDelete(id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Hàm enrich payment với thông tin đầy đủ
async function enrichPayment(payment, req) {
  try {
    // Lấy thông tin reservation
    const reservation = await ExternalService.getReservationById(payment.reservationId, req.headers.authorization);
    
    // Lấy thông tin user tạo payment
    const user = await ExternalService.getUserById(payment.createdBy, req.headers.authorization);

    // Lấy thông tin discount nếu có
    let discount = null;
    if (payment.discountId) {
      discount = await Discount.findById(payment.discountId);
    }

    // Tính toán các giá trị động từ Decimal128
    let originalAmount;
    if (payment.originalAmount && typeof payment.originalAmount === 'object' && payment.originalAmount.$numberDecimal) {
      originalAmount = parseFloat(payment.originalAmount.$numberDecimal);
    } else {
      originalAmount = parseFloat(payment.originalAmount || 0);
    }
    
    const taxAmount = (originalAmount * 10) / 100; // VAT 10%
    const discountAmount = discount ? (originalAmount * discount.discountPercentage / 100) : 0;
    
    // Parse deposit amount từ Decimal128
    let depositAmount;
    if (reservation?.deposit && typeof reservation.deposit === 'object' && reservation.deposit.$numberDecimal) {
      depositAmount = parseFloat(reservation.deposit.$numberDecimal);
    } else {
      depositAmount = parseFloat(reservation?.deposit || 0);
    }
    
    console.log('Enrich - Original amount:', originalAmount);
    console.log('Enrich - Tax amount:', taxAmount);
    console.log('Enrich - Discount amount:', discountAmount);
    console.log('Enrich - Deposit amount:', depositAmount);

    return {
      ...payment.toObject(),
      reservation: reservation?.reservation || reservation,
      createdByUser: user?.data?.user || user,
      discount: discount,
      // Các giá trị tính toán động
      taxAmount,
      discountAmount,
      depositAmount,
      // Virtual fields
      totalDiscount: discountAmount,
      totalFees: taxAmount + depositAmount,
      canCancel: payment.status === 'Pending'
    };
  } catch (error) {
    console.error('Error enriching payment:', error.message);
    return payment.toObject();
  }
}
