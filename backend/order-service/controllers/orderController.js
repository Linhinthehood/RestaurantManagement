const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ExternalService = require('../services/externalService');

async function enrichOrder(order, orderItems = [], req) {
  try {
    console.log('Enriching order:', order._id);
    console.log('Order tableId:', order.tableId);
    console.log('Order userId:', order.userId);
    console.log('Order reservationId:', order.reservationId);
    
    // Lấy thông tin table (có thể là 1 hoặc nhiều)
    let tables = [];
    if (order.reservationId) {
      // Gọi sang reservation-service lấy reservation, lấy trường tables
      const reservationResp = await ExternalService.getReservationById(order.reservationId, req.headers.authorization);
      let reservationData = null;
      if (reservationResp) {
        if (reservationResp.data && reservationResp.data.reservation) {
          reservationData = reservationResp.data.reservation;
        } else if (reservationResp.reservation) {
          reservationData = reservationResp.reservation;
        } else {
          reservationData = reservationResp;
        }
        if (reservationData && Array.isArray(reservationData.tables)) {
          tables = reservationData.tables;
        }
      }
    } else if (order.tableId) {
      const table = await ExternalService.getTableById(order.tableId, req.headers.authorization);
      if (table) tables = [{ _id: table._id, name: table.name }];
    }

    // Lấy thông tin user
    const user = order.userId ? await ExternalService.getUserById(order.userId, req.headers.authorization) : null;
    let userData = null;
    if (user) {
      if (user.data && user.data.user) {
        userData = user.data.user;
      } else if (user.user) {
        userData = user.user;
      } else {
        userData = user;
      }
    }

    // Lấy thông tin reservation và customer
    let reservation = null;
    if (order.reservationId) {
      reservation = await ExternalService.getReservationById(order.reservationId, req.headers.authorization);
    }

    // Chuẩn hoá reservationData và lấy customer từ reservation
    let reservationData = null;
    let customerData = null;
    if (reservation) {
      if (reservation.data && reservation.data.reservation) {
        reservationData = reservation.data.reservation;
      } else if (reservation.reservation) {
        reservationData = reservation.reservation;
      } else {
        reservationData = reservation;
      }
      // Lấy customer từ reservation.customerId
      if (reservationData && reservationData.customerId) {
        customerData = reservationData.customerId;
      }
    }

    return {
      ...order.toObject(),
      tables: tables, // mảng bàn
      user: userData ? { name: userData.name, role: userData.role } : null, // chỉ giữ name, role
      customer: customerData, // object customer
      reservation: reservationData ? {
        ...reservationData,
        tables: undefined // xoá trường tables khỏi reservation để tránh trùng lặp
      } : null, // object reservation
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
    const { orderItemId = [], tableId, reservationId, userId, ...rest } = req.body;
    
    // Kiểm tra và validate các ID trước khi tạo order
    const validationErrors = [];
    
    // 1. Kiểm tra reservationId nếu có
    if (reservationId) {
      const reservation = await ExternalService.getReservationById(reservationId, req.headers.authorization);
      if (!reservation) {
        validationErrors.push(`Reservation với ID ${reservationId} không tồn tại`);
      } else {
        console.log('Reservation found:', reservation);
        // Nếu có reservation, lấy tableId từ reservation nếu không có tableId
        if (!tableId && reservation.tableId) {
          rest.tableId = reservation.tableId;
        }
      }
    }
    
    // 2. Kiểm tra userId nếu có
    if (userId) {
      const user = await ExternalService.getUserById(userId, req.headers.authorization);
      if (!user) {
        validationErrors.push(`User với ID ${userId} không tồn tại`);
      } else {
        console.log('User found:', user);
      }
    }
    
    // 3. Kiểm tra tableId nếu có
    if (tableId) {
      const table = await ExternalService.getTableById(tableId, req.headers.authorization);
      if (!table) {
        validationErrors.push(`Table với ID ${tableId} không tồn tại`);
      } else {
        console.log('Table found:', table);
      }
    }
    
    // 4. Kiểm tra orderItemId nếu có
    if (orderItemId && orderItemId.length > 0) {
      const items = await OrderItem.find({ _id: { $in: orderItemId } });
      if (items.length !== orderItemId.length) {
        const foundIds = items.map(item => item._id.toString());
        const missingIds = orderItemId.filter(id => !foundIds.includes(id));
        validationErrors.push(`OrderItem với ID ${missingIds.join(', ')} không tồn tại`);
      }
    }
    
    // Nếu có lỗi validation, trả về lỗi
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Lấy order items nếu có
    const items = orderItemId.length > 0 ? await OrderItem.find({ _id: { $in: orderItemId } }) : [];
    
    // Tạo order mới
    const order = new Order({
      ...rest,
      tableId: rest.tableId || tableId,
      orderItemId,
      userId, // thêm dòng này
      reservationId, // thêm dòng này
      totalPrice: 0, // Giá ban đầu luôn là 0
      orderStatus: 'Serving',
      orderStatusHistory: [{ status: 'Serving', changedAt: new Date() }]
    });

    await order.save();
    
    // Enrich order với thông tin đầy đủ
    const enrichedOrder = await enrichOrder(order, items, req);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: enrichedOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: err.message 
    });
  }
};

// Lấy tất cả Order
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    const allOrderItems = await OrderItem.find();
    const result = await Promise.all(orders.map(async (order) => {
      const items = allOrderItems.filter(item => order.orderItemId.map(String).includes(String(item._id)));
      return await enrichOrder(order, items, req);
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
    res.json(await enrichOrder(order, items, req));
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