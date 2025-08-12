const Payment = require('../models/Payment');
const Discount = require('../models/Discount');
const ExternalService = require('../services/externalService');

// Tạo payment mới
exports.createPayment = async (req, res) => {
  try {
    const { reservationId, paymentMethod, discountId, notes } = req.body;
    
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
    const orderId = order._id;

    // Tính toán số tiền
    let originalAmount = parseFloat(order.totalPrice);
    let discountAmount = 0;
    let discountPercentage = 0;
    let taxAmount = 0;
    let depositAmount = parseFloat(reservation.deposit || 0);

    // Xử lý mã giảm giá nếu có
    if (discountId) {
      const discount = await Discount.findById(discountId);

      if (discount && discount.isValid) {
        // Kiểm tra điều kiện giá trị đơn hàng tối thiểu
        if (originalAmount >= parseFloat(discount.minimumOrderAmount || 0)) {
          discountPercentage = discount.discountPercentage;
          discountAmount = (originalAmount * discountPercentage) / 100;
          
          // Giới hạn số tiền giảm tối đa nếu có
          if (discount.maxDiscountAmount && discountAmount > parseFloat(discount.maxDiscountAmount)) {
            discountAmount = parseFloat(discount.maxDiscountAmount);
          }

          // Cập nhật số lần sử dụng
          discount.usedCount += 1;
          await discount.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Mã giảm giá yêu cầu đơn hàng tối thiểu ${discount.minimumOrderAmount}`
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn'
        });
      }
    }

    // Tính thuế VAT (10%)
    const taxPercentage = 10;
    taxAmount = (originalAmount * taxPercentage) / 100;

    // Tính số tiền cuối cùng
    const finalAmount = originalAmount - discountAmount - depositAmount + taxAmount;

    // Tạo payment mới
    const payment = new Payment({
      orderId,
      reservationId,
      paymentMethod,
      originalAmount,
      discountId: discountId || null,
      discountPercentage,
      discountAmount,
      taxAmount,
      taxPercentage,
      depositAmount,
      finalAmount,
      createdBy,
      notes,
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

// Hàm enrich payment với thông tin đầy đủ
async function enrichPayment(payment, req) {
  try {
    // Lấy thông tin order
    const order = await ExternalService.getOrderById(payment.orderId, req.headers.authorization);
    
    // Lấy thông tin reservation
    const reservation = await ExternalService.getReservationById(payment.reservationId, req.headers.authorization);
    
    // Lấy thông tin user tạo payment
    const user = await ExternalService.getUserById(payment.createdBy, req.headers.authorization);

    return {
      ...payment.toObject(),
      order: order?.data || order,
      reservation: reservation?.reservation || reservation,
      createdByUser: user?.data?.user || user
    };
  } catch (error) {
    console.error('Error enriching payment:', error.message);
    return payment.toObject();
  }
}
