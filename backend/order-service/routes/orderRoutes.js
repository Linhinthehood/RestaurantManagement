const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateOrderStatus,
  validateDeleteOrder,
  validateObjectId,
  checkAllOrderItemsServedOrCancelled
} = require('../middlewares/orderValidation');
const { protect, requireOrderAccess } = require('../middlewares/authMiddleware');

router.post('/',protect, requireOrderAccess, validateCreateOrder, orderController.createOrder);
router.get('/', protect, requireOrderAccess, orderController.getAllOrders);
router.get('/arrived-reservations', protect, requireOrderAccess, orderController.getArrivedReservations);
router.get('/by-reservation/:reservationId',protect, requireOrderAccess, validateObjectId('id'), orderController.getOrdersByReservationId);
router.get('/:id', protect, requireOrderAccess, validateObjectId('id'), orderController.getOrderById);
router.put('/:id', protect, requireOrderAccess, validateObjectId('id'), validateUpdateOrder, orderController.updateOrder);
router.patch('/:id/status', protect, requireOrderAccess, validateObjectId('id'), validateUpdateOrderStatus, checkAllOrderItemsServedOrCancelled, orderController.updateOrderStatus);
router.delete('/:id', protect, requireOrderAccess, validateObjectId('id'), validateDeleteOrder, orderController.deleteOrder);

module.exports = router; 