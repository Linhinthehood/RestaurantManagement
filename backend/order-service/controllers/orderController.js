const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ExternalService = require('../services/externalService');

async function enrichOrder(order, orderItems = [], req) {
  try {
    console.log('Enriching order:', order._id);
    console.log('Order tableId:', order.tableId);
    console.log('Order userId:', order.userId);
    console.log('Order reservationId:', order.reservationId);
    
    // Lấy thông tin table
    const table = order.tableId ? await ExternalService.getTableById(order.tableId, req.headers.authorization) : null;
    console.log('Table data:', table);
    
    // Lấy thông tin user
    const user = order.userId ? await ExternalService.getUserById(order.userId, req.headers.authorization) : null;
    console.log('User data:', user);
    
    // Lấy thông tin reservation và customer
    let reservation = null;
    let customer = null;
    if (order.reservationId) {
      reservation = await ExternalService.getReservationById(order.reservationId, req.headers.authorization);
      console.log('Reservation data:', reservation);
      if (reservation && reservation.customerId) {
        // Lấy thông tin customer từ reservation service
        customer = await ExternalService.getCustomerById(reservation.customerId, req.headers.authorization);
        console.log('Customer data:', customer);
      }
    }
    
    // Xử lý user data từ response structure
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
    
    // Xử lý table data từ response structure
    let tableData = null;
    if (table) {
      if (table.data && table.data.table) {
        tableData = table.data.table;
      } else if (table.table) {
        tableData = table.table;
      } else {
        tableData = table;
      }
    }
    
    // Xử lý reservation data từ response structure
    let reservationData = null;
    if (reservation) {
      if (reservation.data && reservation.data.reservation) {
        reservationData = reservation.data.reservation;
      } else if (reservation.reservation) {
        reservationData = reservation.reservation;
      } else {
        reservationData = reservation;
      }
    }
    
    // Xử lý customer data từ response structure
    let customerData = null;
    if (customer) {
      if (customer.data && customer.data.customer) {
        customerData = customer.data.customer;
      } else if (customer.customer) {
        customerData = customer.customer;
      } else {
        customerData = customer;
      }
    }
    
    return {
      ...order.toObject(),
      // Thông tin bàn
      tableName: tableData ? tableData.name : null,
      tableCapacity: tableData ? tableData.capacity : null,
      tableType: tableData ? tableData.type : null,
      
      // Thông tin nhân viên
      userName: userData ? userData.name : null,
      userRole: userData ? userData.role : null,
      userEmail: userData ? userData.email : null,
      
      // Thông tin khách hàng
      customerName: customerData ? customerData.name : null,
      customerPhone: customerData ? (customerData.phone || customerData.phoneNumber) : null,
      customerEmail: customerData ? customerData.email : null,
      customerId: reservationData ? reservationData.customerId : null,
      
      // Thông tin reservation
      reservationStatus: reservationData ? reservationData.status : null,
      reservationQuantity: reservationData ? reservationData.quantity : null,
      
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