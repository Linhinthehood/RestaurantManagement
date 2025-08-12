const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  // Mã payment tự động (DD-MM-YY + 4 số thứ tự)
  paymentCode: {
    type: String,
    required: true,
    unique: true,
    length: 10
  },
  
  // Order ID (chỉ 1 order thay vì array)
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Reservation ID
  reservationId: {
    type: Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  
  // Phương thức thanh toán (chỉ Cash hoặc Momo)
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Momo'],
    required: true
  },
  
  // Giá gốc (từ order)
  originalAmount: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: 0
  },
  
  // Discount ID (reference đến Discount model)
  discountId: {
    type: Schema.Types.ObjectId,
    ref: 'Discount',
    default: null
  },
  
  // Thuế (VAT)
  taxAmount: {
    type: mongoose.Types.Decimal128,
    default: 0,
    min: 0
  },
  
  // Phần trăm thuế
  taxPercentage: {
    type: Number,
    default: 10, // 10% VAT
    min: 0
  },
  
  // Tiền đặt cọc (deposit)
  depositAmount: {
    type: mongoose.Types.Decimal128,
    default: 0,
    min: 0
  },
  
  // Giá cuối cùng (sau khi áp dụng tất cả)
  finalAmount: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: 0
  },
  
  // Trạng thái payment
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  
  // Người tạo payment
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Ghi chú
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Ngày thanh toán
  paymentDate: {
    type: Date,
    default: Date.now
  },
  
  // Ngày hoàn thành
  completedAt: {
    type: Date,
    default: null
  },
  
  // Thông tin giao dịch (cho Momo)
  transactionInfo: {
    transactionId: String,
    bankCode: String,
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field để tính tổng số tiền đã giảm
PaymentSchema.virtual('totalDiscount').get(function() {
  return this.discountAmount || 0;
});

// Virtual field để tính tổng phí
PaymentSchema.virtual('totalFees').get(function() {
  return (this.taxAmount || 0) + (this.depositAmount || 0);
});

// Middleware để cập nhật updatedAt
PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware để tự động tạo paymentCode trước khi save
PaymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentCode) {
    this.paymentCode = await generatePaymentCode();
  }
  next();
});

// Hàm tạo mã payment tự động
async function generatePaymentCode() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const datePrefix = `${day}${month}${year}`;
  
  // Tìm payment cuối cùng trong ngày
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const lastPayment = await mongoose.model('Payment').findOne({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  }).sort({ createdAt: -1 });
  
  let sequence = 1;
  if (lastPayment && lastPayment.paymentCode) {
    const lastSequence = parseInt(lastPayment.paymentCode.slice(-4));
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = String(sequence).padStart(4, '0');
  return `${datePrefix}${sequenceStr}`;
}

// Index để tối ưu query
PaymentSchema.index({ paymentCode: 1 }, { unique: true });
PaymentSchema.index({ reservationId: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ createdBy: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
