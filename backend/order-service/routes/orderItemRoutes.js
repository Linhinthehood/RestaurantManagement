const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const {
  validateCreateOrderItem,
  validateUpdateOrderItem,
  validateObjectId
} = require('../middlewares/orderItemValidation');
const { protect, authorize, requireOrderAccess } = require('../middlewares/authMiddleware');

router.post('/', protect, requireOrderAccess, validateCreateOrderItem, orderItemController.createOrderItem);
router.get('/', protect, requireOrderAccess, orderItemController.getAllOrderItems);
router.get('/:id', protect, requireOrderAccess, validateObjectId('id'), orderItemController.getOrderItemById);
router.put('/:id', protect, requireOrderAccess, validateObjectId('id'), validateUpdateOrderItem, orderItemController.updateOrderItem);
router.patch('/:id/status', protect, requireOrderAccess, validateObjectId('id'), orderItemController.updateOrderItemStatus);
router.delete('/:id', protect, requireOrderAccess, validateObjectId('id'), orderItemController.deleteOrderItem);

module.exports = router; 