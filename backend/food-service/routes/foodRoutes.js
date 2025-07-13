const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middlewares/upload');

router.post('/', upload.single('image'), foodController.createFood);
router.get('/', foodController.getAllFoods);
router.get('/:id', foodController.getFoodById);
router.put('/:id', foodController.updateFood);
router.delete('/:id', foodController.deleteFood);

module.exports = router; 