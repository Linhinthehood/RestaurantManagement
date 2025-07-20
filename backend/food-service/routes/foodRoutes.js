const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middlewares/upload');
const { 
  validateFoodData, 
  validateObjectId 
} = require('../middlewares/foodValidation');

router.post('/', upload.single('image'), validateFoodData, foodController.createFood);
router.get('/', foodController.getAllFoods);
router.get('/category/:categoryId', validateObjectId, foodController.getFoodsByCategory);
router.get('/:id', validateObjectId, foodController.getFoodById);
router.put('/:id', validateObjectId, validateFoodData, foodController.updateFood);
router.delete('/:id', validateObjectId, foodController.deleteFood);

module.exports = router; 