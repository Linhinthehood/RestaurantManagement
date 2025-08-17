const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ExternalService = require('../services/externalService');

async function enrichOrder(order, orderItems = [], req) {
  try {
    console.log('Enriching order:', order._id);
    console.log('Order userId:', order.userId);
    console.log('Order reservationId:', order.reservationId);
    
    // Lấy thông tin table từ reservation (có thể là 1 hoặc nhiều)
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

    // Enrich orderItems với thông tin food
    const enrichedOrderItems = await Promise.all(orderItems.map(async (item) => {
      try {
        // Gọi sang food-service để lấy thông tin food
        const foodResponse = await ExternalService.getFoodById(item.foodId, req.headers.authorization);
        let foodData = null;
        
        if (foodResponse) {
          if (foodResponse.data && foodResponse.data.food) {
            foodData = foodResponse.data.food;
          } else if (foodResponse.food) {
            foodData = foodResponse.food;
          } else {
            foodData = foodResponse;
          }
        }
        
        return {
          ...item.toObject(),
          foodName: foodData ? foodData.name : `Food ID: ${item.foodId}`
        };
      } catch (err) {
        console.error('Error fetching food details for item:', item._id, err);
        return {
          ...item.toObject(),
          foodName: `Food ID: ${item.foodId}`
        };
      }
    }));

    return {
      ...order.toObject(),
      tables: tables, // mảng bàn
      user: userData ? { name: userData.name, role: userData.role } : null, // chỉ giữ name, role
      customer: customerData, // object customer
      reservation: reservationData ? {
        ...reservationData,
        tables: undefined // xoá trường tables khỏi reservation để tránh trùng lặp
      } : null, // object reservation
      orderItems: enrichedOrderItems
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
    const { orderItemId = [], reservationId, userId, ...rest } = req.body;
    
    // Kiểm tra và validate các ID trước khi tạo order
    const validationErrors = [];
    
    // 1. Kiểm tra reservationId nếu có
    if (reservationId) {
      const reservation = await ExternalService.getReservationById(reservationId, req.headers.authorization);
      if (!reservation) {
        validationErrors.push(`Reservation với ID ${reservationId} không tồn tại`);
      } else {
        console.log('Reservation found:', reservation);
        
        // Chuẩn hoá reservation data để kiểm tra status
        let reservationData = null;
        if (reservation.data && reservation.data.reservation) {
          reservationData = reservation.data.reservation;
        } else if (reservation.reservation) {
          reservationData = reservation.reservation;
        } else {
          reservationData = reservation;
        }
        
        // Kiểm tra status phải là "Arrived"
        if (reservationData.status !== 'Arrived') {
          validationErrors.push(`Reservation với ID ${reservationId} có trạng thái "${reservationData.status}", chỉ có thể tạo order cho reservation có trạng thái "Arrived"`);
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
      orderItemId,
      userId,
      reservationId,
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
    
    // Enrich order với thông tin đầy đủ
    const enrichedOrder = await enrichOrder(order, items, req);
    
    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: enrichedOrder
    });
  } catch (err) {
    console.error('Error getting order by ID:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: err.message 
    });
  }
};

// Lấy order theo reservationId
exports.getOrdersByReservationId = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const orders = await Order.find({ reservationId });
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy order nào cho reservationId này' 
      });
    }
    
    // Lấy tất cả orderItems cho tất cả orders
    const allOrderItemIds = orders.flatMap(order => order.orderItemId);
    const allOrderItems = await OrderItem.find({ _id: { $in: allOrderItemIds } });
    
    // Enrich từng order với thông tin đầy đủ
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const items = allOrderItems.filter(item => 
        order.orderItemId.map(String).includes(String(item._id))
      );
      return await enrichOrder(order, items, req);
    }));
    
    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: enrichedOrders
    });
  } catch (err) {
    console.error('Error getting orders by reservation ID:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: err.message 
    });
  }
};

// Lấy danh sách reservations có status "Arrived" và chưa có order để tạo order
exports.getArrivedReservations = async (req, res) => {
  try {
    // Lấy tất cả reservations có status "Arrived"
    const arrivedReservations = await ExternalService.getArrivedReservations(req.headers.authorization);
    
    // Lấy danh sách tất cả orders để kiểm tra (bao gồm Serving và Completed)
    const allOrders = await Order.find({ 
      orderStatus: { $in: ['Serving', 'Completed'] } 
    });
    
    // Tạo map để tra cứu nhanh orders theo reservationId
    const ordersByReservationId = new Map();
    allOrders.forEach(order => {
      ordersByReservationId.set(order.reservationId.toString(), order);
    });
    
    // Phân loại reservations và lọc ra những đã có payment completed
    const result = [];
    
    for (const reservation of arrivedReservations) {
      const existingOrder = ordersByReservationId.get(reservation._id.toString());
      
      if (existingOrder) {
        if (existingOrder.orderStatus === 'Serving') {
          // Reservation có order đang Serving - hiển thị trong danh sách serving
          result.push({
            reservation: reservation,
            order: existingOrder
          });
        } else if (existingOrder.orderStatus === 'Completed') {
          // Kiểm tra xem đã có payment completed chưa
          const hasCompletedPayment = await ExternalService.hasCompletedPayment(
            reservation._id.toString(), 
            req.headers.authorization
          );
          
          if (!hasCompletedPayment) {
            // Chưa có payment completed - vẫn hiển thị để tạo payment
            result.push({
              reservation: reservation,
              order: existingOrder
            });
          }
          // Nếu đã có payment completed thì không thêm vào result (ẩn đi)
        }
      } else {
        // Reservation chưa có order - hiển thị trong danh sách chờ tạo order
        result.push({
          reservation: reservation,
          order: null
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Lấy danh sách arrived reservations thành công',
      data: result
    });
  } catch (err) {
    console.error('Error getting arrived reservations:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách arrived reservations',
      error: err.message 
    });
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