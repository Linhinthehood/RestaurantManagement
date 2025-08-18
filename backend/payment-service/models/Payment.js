const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  // 1. Mã payment tự động (DD-MM-YY + 4 số thứ tự)
  paymentCode: {
    type: String,
    required: true,
    unique: true,
    length: 10
  },
  
  // 2. Reservation ID (lấy từ orderService thông qua externalService)
  reservationId: {
    type: Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  
  // 3. Phương thức thanh toán (chỉ Cash hoặc Momo)
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Momo'],
    required: true
  },
  
  // 4. Giá gốc (TotalPrice từ Order)
  originalAmount: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: 0
  },
  
  // 5. Discount ID (reference đến Discount model)
  discountId: {
    type: Schema.Types.ObjectId,
    ref: 'Discount',
    default: null
  },
  
  // Giá cuối cùng (FinalPrice = TotalPrice + Tax - Discount - Deposit)
  finalAmount: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: 0
  },
  
  // 6. Người tạo payment (lấy từ token)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 8. Trạng thái thanh toán
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  // Thông tin giao dịch (cho Momo)
  transactionInfo: {
    transactionId: String,
    bankCode: String,
    bankName: String,
    accountNumber: String,
    accountName: String,
    paymentUrl: String, // URL thanh toán Momo
    qrCode: String      // QR code thanh toán
  },
  
  // Lịch sử thay đổi trạng thái
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
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

// Virtual field để tính tổng số tiền đã giảm (sẽ được tính động trong controller)
PaymentSchema.virtual('totalDiscount').get(function() {
  return 0; // Sẽ được tính động từ discountId và originalAmount
});

// Virtual field để tính tổng phí (sẽ được tính động trong controller)
PaymentSchema.virtual('totalFees').get(function() {
  return 0; // Sẽ được tính động từ tax và deposit
});

// Virtual field để kiểm tra có thể hủy không
PaymentSchema.virtual('canCancel').get(function() {
  return this.status === 'Pending';
});



// Middleware để cập nhật updatedAt
PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware để tự động tạo paymentCode TRƯỚC khi validate (để tránh lỗi required)
PaymentSchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.paymentCode) {
      this.paymentCode = await generatePaymentCode();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware để tự động cập nhật statusHistory khi status thay đổi
PaymentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.createdBy
    });
  }
  next();
});

// Hàm tạo mã payment tự động
async function generatePaymentCode() {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
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
      const paymentCode = `${datePrefix}${sequenceStr}`;
      
      // Kiểm tra xem paymentCode đã tồn tại chưa
      const existingPayment = await mongoose.model('Payment').findOne({ paymentCode });
      if (!existingPayment) {
        return paymentCode;
      }
      
      // Nếu đã tồn tại, tăng sequence và thử lại
      attempts++;
      
    } catch (err) {
      console.error('Error generating payment code:', err);
      attempts++;
      
      // Nếu có lỗi, thử tạo code với timestamp để đảm bảo unique
      if (attempts >= maxAttempts) {
        const timestamp = Date.now().toString().slice(-6);
        return `FALLBACK${timestamp}`;
      }
    }
  }
  
  // Fallback: sử dụng timestamp nếu tất cả attempts đều thất bại
  const timestamp = Date.now().toString().slice(-8);
  return `FALLBACK${timestamp}`;
}

// Index để tối ưu query
PaymentSchema.index({ paymentCode: 1 }, { unique: true });
PaymentSchema.index({ reservationId: 1 });
PaymentSchema.index({ createdBy: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

PaymentSchema.index({ discountId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
