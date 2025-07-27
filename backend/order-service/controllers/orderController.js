const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ExternalService = require('../services/externalService');

async function enrichOrder(order, orderItems = []) {
  try {
    console.log('Enriching order:', order._id);
    console.log('Order tableId:', order.tableId);
    console.log('Order userId:', order.userId);
    console.log('Order reservationId:', order.reservationId);
    
    // Lấy thông tin table
    const table = order.tableId ? await ExternalService.getTableById(order.tableId) : null;
    console.log('Table data:', table);
    
    // Lấy thông tin user
    const user = order.userId ? await ExternalService.getUserById(order.userId) : null;
    console.log('User data:', user);
    
    // Lấy thông tin reservation và customer
    let reservation = null;
    let customer = null;
    if (order.reservationId) {
      reservation = await ExternalService.getReservationById(order.reservationId);
      console.log('Reservation data:', reservation);
      if (reservation && reservation.customerId) {
        // Lấy thông tin customer từ reservation service
        customer = await ExternalService.getCustomerById(reservation.customerId);
        console.log('Customer data:', customer);
      }
    }
    
    // Xử lý user data từ response structure
    const userData = user && user.data && user.data.user ? user.data.user : user;
    
    return {
      ...order.toObject(),
      // Thông tin bàn
      tableName: table ? table.name : null,
      tableCapacity: table ? table.capacity : null,
      tableType: table ? table.type : null,
      
      // Thông tin nhân viên
      userName: userData ? userData.name : null,
      userRole: userData ? userData.role : null,
      userEmail: userData ? userData.email : null,
      
      // Thông tin khách hàng
      customerName: customer ? customer.name : null,
      customerPhone: customer ? customer.phone : null, // Sửa từ phoneNumber thành phone
      customerEmail: customer ? customer.email : null,
      customerId: reservation ? reservation.customerId : null,
      
      // Thông tin reservation
      reservationStatus: reservation ? reservation.status : null,
      reservationQuantity: reservation ? reservation.quantity : null,
      
      orderItems: orderItems.map(item => item.toObject())
    };
  } catch (error) {
    console.error('Error enriching order:', error.message);
    // Trả về order cơ bản nếu có lỗi
    return {
      ...order.toObject(),
      tableName: null,
      userName: null,
      customerName: null,
      orderItems: orderItems.map(item => item.toObject())
    };
  }
}

// Tạo mới Order
exports.createOrder = async (req, res) => {
  try {
    const { orderItemId = [], tableId, ...rest } = req.body;
    const items = orderItemId.length > 0 ? await OrderItem.find({ _id: { $in: orderItemId } }) : [];
    
    // Nếu có reservationId, lấy tableId từ reservation
    let finalTableId = tableId;
    if (rest.reservationId && !tableId) {
      const reservation = await ExternalService.getReservationById(rest.reservationId);
      if (reservation && reservation.tableId) {
        finalTableId = reservation.tableId;
      }
    }
    
    const order = new Order({
      ...rest,
      tableId: finalTableId,
      orderItemId,
      totalPrice: 0, // Giá ban đầu luôn là 0
      orderStatus: 'Serving',
      orderStatusHistory: [{ status: 'Serving', changedAt: new Date() }]
    });

    await order.save();
    res.status(201).json(await enrichOrder(order, items));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả Order
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    const allOrderItems = await OrderItem.find();
    const result = await Promise.all(orders.map(async (order) => {
      const items = allOrderItems.filter(item => order.orderItemId.map(String).includes(String(item._id)));
      return await enrichOrder(order, items);
    }));
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
    res.json(await enrichOrder(order, items));
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