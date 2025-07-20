const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const axios = require('axios');

// Helper: kiểm tra flow chuyển trạng thái
const canChangeStatus = (current, next) => {
  const flow = {
    Pending: ['Preparing', 'Cancelled'],
    Preparing: ['Ready_to_serve', 'Cancelled'],
    Ready_to_serve: ['Served'],
    Served: [],
    Cancelled: []
  };
  return flow[current] && flow[current].includes(next);
};

// Tạo mới OrderItem
exports.createOrderItem = async (req, res) => {
  try {
    const { foodId, quantity, note, orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });
    // Gọi API food-service để lấy thông tin food
    const foodServiceUrl = process.env.FOOD_SERVICE_URL;
    const foodRes = await axios.get(`${foodServiceUrl}/api/foods/${foodId}`);
    const food = foodRes.data;
    if (!food) return res.status(400).json({ error: 'Food not found' });
    const price = Number(food.pricePerUnit.$numberDecimal || food.pricePerUnit || 0) * Number(quantity);
    const orderItem = new OrderItem({
      foodId,
      orderId,
      quantity,
      note,
      price,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', changedAt: new Date() }]
    });
    await orderItem.save();
    // Cập nhật lại order: thêm orderItemId và cập nhật totalPrice
    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ error: 'Order not found' });
    order.orderItemId.push(orderItem._id);
    // Lấy lại toàn bộ order item để tính tổng tiền
    const allOrderItems = await OrderItem.find({ _id: { $in: order.orderItemId } });
    order.totalPrice = allOrderItems.reduce((sum, item) => sum + Number(item.price), 0);
    await order.save();
    // Gọi API food-service để cập nhật quantity và status của food
    const newQuantity = Number(food.quantity) - Number(quantity);
    const updatePayload = { quantity: newQuantity };
    if (newQuantity < 10) updatePayload.status = 'Unavailable';
    await axios.put(`${foodServiceUrl}/api/foods/${foodId}`, updatePayload);
    res.status(201).json({
      ...orderItem.toObject(),
      food // trả về toàn bộ thông tin food
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả OrderItem
exports.getAllOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.find();
    res.json(orderItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy OrderItem theo ID
exports.getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findById(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    res.json(orderItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái OrderItem (chỉ cho phép update status đúng flow)
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderItem = await OrderItem.findById(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    if (!status || status === orderItem.status) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ hoặc không thay đổi' });
    }
    // Kiểm tra flow
    if (!canChangeStatus(orderItem.status, status)) {
      return res.status(400).json({ error: 'Không thể chuyển trạng thái này!' });
    }
    orderItem.status = status;
    orderItem.statusHistory.push({ status, changedAt: new Date() });
    await orderItem.save();
    res.json(orderItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật OrderItem (chỉ cho phép update các trường khác ngoài status)
exports.updateOrderItem = async (req, res) => {
  try {
    const { note, quantity } = req.body;
    const orderItem = await OrderItem.findById(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    // Không cho phép cập nhật status và statusHistory qua PUT
    if ('status' in req.body || 'statusHistory' in req.body) {
      return res.status(400).json({ error: 'Không được cập nhật status qua PUT, hãy dùng PATCH /:id/status' });
    }
    if (note !== undefined) orderItem.note = note;
    if (quantity !== undefined) orderItem.quantity = quantity;
    await orderItem.save();
    res.json(orderItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa OrderItem
exports.deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByIdAndDelete(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    res.json({ message: 'OrderItem deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 