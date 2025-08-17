const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { 
  protect, 
  requirePaymentManagement 
} = require('../middlewares/authMiddleware');
const {
  validateObjectId
} = require('../middlewares/paymentValidation');

// Lấy mã giảm giá còn hiệu lực (đặt trước để tránh conflict với :id)
router.get('/active', 
  protect, 
  requirePaymentManagement,
  discountController.getActiveDiscounts
);

// Tạo mã giảm giá mới (chỉ Manager)
router.post('/', 
  protect, 
  requirePaymentManagement,
  discountController.createDiscount
);

// Lấy tất cả mã giảm giá
router.get('/', 
  protect, 
  requirePaymentManagement,
  discountController.getAllDiscounts
);



// Lấy mã giảm giá theo ID
router.get('/:id', 
  protect, 
  requirePaymentManagement,
  validateObjectId('id'),
  discountController.getDiscountById
);

// Lấy mã giảm giá theo code
router.get('/code/:code', 
  protect, 
  requirePaymentManagement,
  discountController.getDiscountByCode
);

// Cập nhật mã giảm giá
router.put('/:id', 
  protect, 
  requirePaymentManagement,
  validateObjectId('id'),
  discountController.updateDiscount
);

// Xóa mã giảm giá
router.delete('/:id', 
  protect, 
  requirePaymentManagement,
  validateObjectId('id'),
  discountController.deleteDiscount
);

module.exports = router;
