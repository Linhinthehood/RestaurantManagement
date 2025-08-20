const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
  // Mã giảm giá tự động (5 chữ cái)
  discountCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    length: 5
  },
  
  // Phần trăm giảm giá
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  
  // Số lượng mã giảm giá
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Số lần đã sử dụng
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Trạng thái mã giảm giá
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  
  // Người tạo mã giảm giá
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index để tối ưu query
DiscountSchema.index({ discountCode: 1 }, { unique: true });
DiscountSchema.index({ status: 1 });
DiscountSchema.index({ createdBy: 1 });

// Virtual field để kiểm tra mã còn hiệu lực không
DiscountSchema.virtual('isValid').get(function() {
  return this.status === 'Active' && this.usedCount < this.quantity;
});

// Middleware để tự động tạo mã discount trước khi validate
DiscountSchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.discountCode) {
      this.discountCode = await generateDiscountCode();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Hàm tạo mã discount tự động (5 chữ cái)
async function generateDiscountCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Kiểm tra mã đã tồn tại chưa
    const existingDiscount = await mongoose.connection.db.collection('discounts').findOne({ discountCode: code });
    if (!existingDiscount) {
      isUnique = true;
    }
  }
  
  return code;
}

module.exports = mongoose.model('Discount', DiscountSchema);
