const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { 
  validateCategoryData, 
  validateCategoryObjectId, 
  validateCategoryInUse 
} = require('../middlewares/categoryValidation');
const { 
  protect, 
  requireFoodManagement ,
  requireMenuAccess
} = require('../middlewares/authMiddleware');

// Public routes - xem categories (không cần xác thực)
router.get('/',protect, requireMenuAccess, categoryController.getAllCategories);
router.get('/:id', protect, requireMenuAccess, validateCategoryObjectId, categoryController.getCategoryById);

// Protected routes - quản lý categories (Manager, Chef)
router.post('/', protect, requireFoodManagement, validateCategoryData, categoryController.createCategory);
router.put('/:id', protect, requireFoodManagement, validateCategoryObjectId, validateCategoryData, categoryController.updateCategory);
router.delete('/:id', protect, requireFoodManagement, validateCategoryObjectId, validateCategoryInUse, categoryController.deleteCategory);

module.exports = router; 