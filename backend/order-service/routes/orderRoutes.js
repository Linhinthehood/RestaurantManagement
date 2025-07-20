const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateOrderStatus,
  validateDeleteOrder,
  validateObjectId,
  checkAllOrderItemsServedOrCancelled,
  validateTotalPriceWithServedItems
} = require('../middlewares/orderValidation');

router.post('/', validateCreateOrder, orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', validateObjectId('id'), orderController.getOrderById);
router.put('/:id', validateObjectId('id'), validateUpdateOrder, orderController.updateOrder);
router.patch('/:id/status', validateObjectId('id'), validateUpdateOrderStatus, checkAllOrderItemsServedOrCancelled, validateTotalPriceWithServedItems, orderController.updateOrderStatus);
router.delete('/:id', validateObjectId('id'), validateDeleteOrder, orderController.deleteOrder);

module.exports = router; 