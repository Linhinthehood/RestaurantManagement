const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// Validate ObjectId
const validateObjectId = (field) => (req, res, next) => {
  const value = req.body[field] || req.params[field];
  // Chỉ validate nếu có giá trị và không phải null/undefined
  if (value && value !== null && value !== undefined && !mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ error: `${field} không hợp lệ` });
  }
  next();
};

// Validate mảng orderItemId
const validateOrderItemIds = async (req, res, next) => {
  const { orderItemId } = req.body;
  // Nếu là PUT (update) thì không cho rỗng, còn POST thì cho phép rỗng
  const isUpdate = req.method === 'PUT';
  if (!Array.isArray(orderItemId) || (isUpdate && orderItemId.length === 0)) {
    return res.status(400).json({ error: 'orderItemId phải là mảng' + (isUpdate ? ' và không được rỗng' : '') });
  }
  // Nếu mảng rỗng (POST) thì bỏ qua kiểm tra tiếp theo
  if (Array.isArray(orderItemId) && orderItemId.length === 0) return next();
  // Kiểm tra từng id có hợp lệ và tồn tại không
  for (const id of orderItemId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `orderItemId ${id} không hợp lệ` });
    }
    const item = await OrderItem.findById(id);
    if (!item) {
      return res.status(400).json({ error: `OrderItem ${id} không tồn tại` });
    }
  }
  // Kiểm tra trùng foodId trong cùng order
  const items = await OrderItem.find({ _id: { $in: orderItemId } });
  const foodIds = items.map(i => String(i.foodId));
  const uniqueFoodIds = new Set(foodIds);
  if (foodIds.length !== uniqueFoodIds.size) {
    return res.status(400).json({ error: 'Không được thêm 2 món giống nhau trong cùng order' });
  }
  next();
};

// Validate orderStatus
const validateOrderStatus = (req, res, next) => {
  const { orderStatus } = req.body;
  const valid = ['Serving', 'Completed'];
  if (orderStatus && !valid.includes(orderStatus)) {
    return res.status(400).json({ error: 'orderStatus không hợp lệ' });
  }
  next();
};

// Không cho phép sửa status qua PUT
const forbidStatusInPut = (req, res, next) => {
  if ('orderStatus' in req.body || 'orderStatusHistory' in req.body) {
    return res.status(400).json({ error: 'Không được cập nhật trạng thái qua PUT, hãy dùng PATCH /:id/status' });
  }
  next();
};

// Không cho phép xóa order đã completed
const forbidDeleteCompletedOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (order && order.orderStatus === 'Completed') {
    return res.status(400).json({ error: 'Không thể xóa order đã hoàn thành' });
  }
  next();
};

// Không cho phép chuyển trạng thái lùi
const forbidStatusRollback = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { orderStatus } = req.body;
  const valid = ['Serving', 'Completed'];
  if (orderStatus && valid.indexOf(orderStatus) < valid.indexOf(order.orderStatus)) {
    return res.status(400).json({ error: 'Không thể chuyển trạng thái lùi' });
  }
  next();
};

// Validate không cho phép tạo order nếu bàn đang có order trạng thái Serving
const forbidCreateOrderIfTableServing = async (req, res, next) => {
  const { tableId } = req.body;
  // Chỉ kiểm tra nếu có tableId
  if (!tableId || tableId === null || tableId === undefined) return next();
  const servingOrder = await Order.findOne({ tableId, orderStatus: 'Serving' });
  if (servingOrder) {
    return res.status(400).json({ error: 'Bàn này đang có order chưa hoàn thành' });
  }
  next();
};

// 1. Kiểm tra các orderItems đã Served hoặc Cancelled hết chưa trước khi cho phép chuyển sang Completed
const checkAllOrderItemsServedOrCancelled = async (req, res, next) => {
  const { orderStatus } = req.body;
  if (orderStatus !== 'Completed') return next();
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = await OrderItem.find({ _id: { $in: order.orderItemId } });
  const notDone = items.filter(item => !['Served', 'Cancelled'].includes(item.status));
  if (notDone.length > 0) {
    return res.status(400).json({ error: 'Chỉ được chuyển sang Completed khi tất cả món đã Served hoặc Cancelled' });
  }
  next();
};

// Validate tổng hợp khi tạo order
const validateCreateOrder = [
  validateObjectId('reservationId'),
  validateObjectId('userId'),
  validateOrderItemIds,
  validateOrderStatus,
  forbidCreateOrderIfTableServing
];

// Validate tổng hợp khi update order
const validateUpdateOrder = [
  forbidStatusInPut,
  validateOrderItemIds
];

// Validate khi update status
const validateUpdateOrderStatus = [
  validateOrderStatus,
  forbidStatusRollback
];

// Validate khi xóa order
const validateDeleteOrder = [
  forbidDeleteCompletedOrder
];

module.exports = {
  validateObjectId,
  validateOrderItemIds,
  validateOrderStatus,
  forbidStatusInPut,
  forbidDeleteCompletedOrder,
  forbidStatusRollback,
  forbidCreateOrderIfTableServing,
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateOrderStatus,
  validateDeleteOrder,
  checkAllOrderItemsServedOrCancelled
}; 