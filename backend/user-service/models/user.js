import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên không được quá 50 ký tự']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  dob: {
    type: Date,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Ngày sinh không thể là tương lai'
    }
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Giới tính phải là Male, Female hoặc Other'
    },
    required: [true, 'Giới tính là bắt buộc']
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Inactive'],
      message: 'Trạng thái phải là Active hoặc Inactive'
    },
    default: 'Active'
  },
  role: {
    type: String,
    enum: {
      values: ['Manager', 'Waiter', 'Chef', 'Receptionist'],
      message: 'Vai trò phải là Manager, Waiter, Chef hoặc Receptionist'
    },
    required: [true, 'Vai trò là bắt buộc']
  },
  avatar: {
    type: String,
    default: null
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user age
userSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

const User = mongoose.model("User", userSchema);
export default User;
