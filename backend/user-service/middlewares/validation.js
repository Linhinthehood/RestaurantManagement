import { validationResult } from 'express-validator';

// Middleware để kiểm tra validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Custom validation cho enum values
export const validateEnum = (field, allowedValues) => {
  return (value) => {
    if (!allowedValues.includes(value)) {
      throw new Error(`${field} phải là một trong các giá trị: ${allowedValues.join(', ')}`);
    }
    return true;
  };
};

// Custom validation cho phone number
export const validatePhoneNumber = (value) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Số điện thoại phải có 10-11 chữ số');
  }
  return true;
};

// Custom validation cho email
export const validateEmail = (value) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Email không hợp lệ');
  }
  return true;
};

// Custom validation cho date of birth
export const validateDOB = (value) => {
  const dob = new Date(value);
  const today = new Date();
  
  if (dob > today) {
    throw new Error('Ngày sinh không thể là tương lai');
  }
  
  const age = today.getFullYear() - dob.getFullYear();
  if (age < 16 || age > 100) {
    throw new Error('Tuổi phải từ 16 đến 100');
  }
  
  return true;
}; 