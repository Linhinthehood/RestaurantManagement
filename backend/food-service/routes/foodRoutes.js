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
  requireFoodManagement 
} = require('../middlewares/authMiddleware');

// Public routes - xem menu (không cần xác thực)
router.get('/', protect, requireFoodManagement, foodController.getAllFoods);
router.get('/category/:categoryId', validateObjectId, foodController.getFoodsByCategory);
router.get('/:id', validateObjectId, foodController.getFoodById);

// Protected routes - quản lý food (Manager, Chef)
router.post('/', protect, requireFoodManagement, upload.single('image'), validateFoodData, foodController.createFood);
router.put('/:id', protect, requireFoodManagement, validateObjectId, validateFoodData, foodController.updateFood);
router.delete('/:id', protect, requireFoodManagement, validateObjectId, foodController.deleteFood);

module.exports = router; 