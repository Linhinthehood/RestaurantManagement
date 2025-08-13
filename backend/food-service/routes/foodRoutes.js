const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middlewares/upload');
const { 
  validateFoodData, 
  validateObjectId 
} = require('../middlewares/foodValidation');
const { 
  protect, 
  requireFoodManagement,
  requireMenuAccess
} = require('../middlewares/authMiddleware');

// Public routes - xem menu (không cần xác thực)
router.get('/', protect, requireMenuAccess, foodController.getAllFoods);
router.get('/category/:categoryId', protect, requireMenuAccess, validateObjectId, foodController.getFoodsByCategory);
router.get('/:id', protect, requireMenuAccess, validateObjectId, foodController.getFoodById);

// Protected routes - quản lý food (Manager, Chef)
router.post('/', protect, requireFoodManagement, upload.single('image'), validateFoodData, foodController.createFood);
router.put('/:id', protect, requireFoodManagement, upload.single('image'), validateObjectId, validateFoodData, foodController.updateFood);
router.delete('/:id', protect, requireFoodManagement, validateObjectId, foodController.deleteFood);

module.exports = router; 