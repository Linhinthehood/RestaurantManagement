const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { 
  validateCategoryData, 
  validateCategoryObjectId, 
  validateCategoryInUse 
} = require('../middlewares/categoryValidation');

router.post('/', validateCategoryData, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateCategoryObjectId, categoryController.getCategoryById);
router.put('/:id', validateCategoryObjectId, validateCategoryData, categoryController.updateCategory);
router.delete('/:id', validateCategoryObjectId, validateCategoryInUse, categoryController.deleteCategory);

module.exports = router; 