const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const {
  validateCreateOrderItem,
  validateUpdateOrderItem,
  validateObjectId
} = require('../middlewares/orderItemValidation');

router.post('/', validateCreateOrderItem, orderItemController.createOrderItem);
router.get('/', orderItemController.getAllOrderItems);
router.get('/:id', validateObjectId('id'), orderItemController.getOrderItemById);
router.put('/:id', validateObjectId('id'), validateUpdateOrderItem, orderItemController.updateOrderItem);
router.patch('/:id/status', validateObjectId('id'), orderItemController.updateOrderItemStatus);
router.delete('/:id', validateObjectId('id'), orderItemController.deleteOrderItem);

module.exports = router; 