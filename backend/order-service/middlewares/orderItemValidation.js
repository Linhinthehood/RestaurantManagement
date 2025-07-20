const mongoose = require('mongoose');
const OrderItem = require('../models/OrderItem');

// Validate ObjectId
const validateObjectId = (field) => (req, res, next) => {
  const value = req.body[field] || req.params[field];
  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ error: `${field} không hợp lệ` });
  }
  next();
};

// Kiểm tra quantity
const validateQuantity = (req, res, next) => {
  const { quantity } = req.body;
  if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ error: 'quantity phải là số nguyên dương' });
  }
  next();
};

// Kiểm tra status
const validateStatus = (req, res, next) => {
  const { status } = req.body;
  const valid = ['Pending', 'Preparing', 'Ready_to_serve', 'Served', 'Cancelled'];
  if (status && !valid.includes(status)) {
    return res.status(400).json({ error: 'status không hợp lệ' });
  }
  next();
};

// Kiểm tra trạng thái
const forbidStatusRollback = async (req, res, next) => {
  const item = await OrderItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'OrderItem not found' });
  const { status } = req.body;
  const valid = ['Pending', 'Preparing', 'Ready_to_serve', 'Served', 'Cancelled'];
  if (status && valid.indexOf(status) < valid.indexOf(item.status)) {
    return res.status(400).json({ error: 'Không thể chuyển trạng thái lùi' });
  }
  next();
};

const validateCreateOrderItem = [
  validateObjectId('foodId'),
  validateObjectId('orderId'),
  validateQuantity,
  validateStatus
];

const validateUpdateOrderItem = [
  validateQuantity,
  validateStatus,
  forbidStatusRollback
];

const validateDeleteOrderItem = [];

module.exports = {
  validateObjectId,
  validateQuantity,
  validateStatus,
  forbidStatusRollback,
  validateCreateOrderItem,
  validateUpdateOrderItem,
  validateDeleteOrderItem
}; 