const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { mockTables, mockUsers, mockReservations } = require('../mockData');

function enrichOrder(order, orderItems = []) {
  // Lấy thông tin table
  const table = mockTables.find(t => t._id === String(order.tableId));
  // Lấy thông tin user
  const user = mockUsers.find(u => u._id === String(order.userId));
  // Lấy thông tin reservation
  const reservation = mockReservations.find(r => r._id === String(order.reservationId));
  return {
    ...order.toObject(),
    tableName: table ? table.tableName : null,
    userName: user ? user.name : null,
    customerId: reservation ? reservation.customerId : null,
    orderItems: orderItems.map(item => item.toObject())
  };
}

// Tạo mới Order
exports.createOrder = async (req, res) => {
  try {
    const { orderItemId = [], ...rest } = req.body;
    const items = orderItemId.length > 0 ? await OrderItem.find({ _id: { $in: orderItemId } }) : [];
    
    const order = new Order({
      ...rest,
      orderItemId,
      totalPrice: 0, // Giá ban đầu luôn là 0
      orderStatus: 'Serving',
      orderStatusHistory: [{ status: 'Serving', changedAt: new Date() }]
    });

    await order.save();
    res.status(201).json(enrichOrder(order, items));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả Order
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    const allOrderItems = await OrderItem.find();
    const result = orders.map(order => {
      const items = allOrderItems.filter(item => order.orderItemId.map(String).includes(String(item._id)));
      return enrichOrder(order, items);
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy Order theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await OrderItem.find({ _id: { $in: order.orderItemId } });
    res.json(enrichOrder(order, items));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy order theo reservationId
exports.getOrdersByReservationId = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const orders = await Order.find({ reservationId });
    if (!orders || orders.length === 0) return res.status(404).json({ error: 'Không tìm thấy order nào cho reservationId này' });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật Order (không cập nhật status)
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    Object.keys(req.body).forEach(key => {
      if (key !== 'orderStatus' && key !== 'orderStatusHistory' && key !== 'totalPrice') {
        order[key] = req.body[key];
      }
    });

    // Nếu có cập nhật orderItemId, tính lại totalPrice DỰA TRÊN CÁC MÓN ĐÃ SERVED
    if (req.body.orderItemId) {
      const items = await OrderItem.find({ _id: { $in: req.body.orderItemId } });
      const servedItems = items.filter(item => item.status === 'Served');
      const totalPrice = servedItems.reduce((sum, item) => sum + Number(item.price), 0);
      order.totalPrice = totalPrice;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật status của Order
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!req.body.orderStatus) {
      return res.status(400).json({ error: 'orderStatus là bắt buộc' });
    }
    if (req.body.orderStatus !== order.orderStatus) {
      order.orderStatus = req.body.orderStatus;
      order.orderStatusHistory.push({ status: req.body.orderStatus, changedAt: new Date() });
      await order.save();
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 