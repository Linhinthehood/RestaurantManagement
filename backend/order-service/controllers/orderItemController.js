const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const ExternalService = require('../services/externalService');

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
    const food = await ExternalService.getFoodById(foodId, req.headers.authorization);

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    // 3. Không thể đặt quá quantity
    if (food.quantity < quantity) {
      return res.status(400).json({ 
        error: `Số lượng đặt vượt quá số lượng tồn kho.`,
        remainingQuantity: food.quantity 
      });
    }

    const price = Number(food.pricePerUnit?.$numberDecimal || food.pricePerUnit || 0) * Number(quantity);
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

    // Cập nhật lại order: chỉ thêm orderItemId mới, không tính lại totalPrice
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.orderItemId.push(orderItem._id);
    await order.save();

    // Cập nhật quantity của food
    const newQuantity = food.quantity - quantity;
    await ExternalService.updateFoodQuantity(foodId, newQuantity, req.headers.authorization);
    
    res.status(201).json({
      ...orderItem.toObject(),
      food
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả OrderItem
exports.getAllOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.find()
      .populate('orderId', 'orderStatus totalPrice reservationId');
    
    // Fetch food and table information for each order item
    const orderItemsWithDetails = await Promise.all(
      orderItems.map(async (orderItem) => {
        try {
          // Fetch food information
          const food = await ExternalService.getFoodById(orderItem.foodId, req.headers.authorization);
          
          // Fetch table information from reservation
          let tableName = null;
          if (orderItem.orderId && orderItem.orderId.reservationId) {
            try {
              const reservation = await ExternalService.getReservationById(orderItem.orderId.reservationId, req.headers.authorization);
              let reservationData = null;
              if (reservation) {
                if (reservation.data && reservation.data.reservation) {
                  reservationData = reservation.data.reservation;
                } else if (reservation.reservation) {
                  reservationData = reservation.reservation;
                } else {
                  reservationData = reservation;
                }
                
                // Get table names from reservation
                if (reservationData && Array.isArray(reservationData.tables)) {
                  tableName = reservationData.tables.map(table => table.name || table.tableName).join(', ');
                }
              }
            } catch (error) {
              console.error('Error fetching reservation for order item:', error);
            }
          }
          
          return {
            ...orderItem.toObject(),
            foodId: food || { _id: orderItem.foodId, name: 'Food not found' },
            tableName: tableName || 'Unknown Table'
          };
        } catch (error) {
          console.error('Error fetching details for order item:', error);
          return {
            ...orderItem.toObject(),
            foodId: { _id: orderItem.foodId, name: 'Food not found' },
            tableName: 'Unknown Table'
          };
        }
      })
    );
    
    res.json(orderItemsWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy OrderItem theo ID
exports.getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findById(req.params.id)
      .populate('orderId', 'orderStatus totalPrice reservationId');
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    
    // Fetch food and table information
    try {
      // Fetch food information
      const food = await ExternalService.getFoodById(orderItem.foodId, req.headers.authorization);
      
      // Fetch table information from reservation
      let tableName = null;
      if (orderItem.orderId && orderItem.orderId.reservationId) {
        try {
          const reservation = await ExternalService.getReservationById(orderItem.orderId.reservationId, req.headers.authorization);
          let reservationData = null;
          if (reservation) {
            if (reservation.data && reservation.data.reservation) {
              reservationData = reservation.data.reservation;
            } else if (reservation.reservation) {
              reservationData = reservation.reservation;
            } else {
              reservationData = reservation;
            }
            
            // Get table names from reservation
            if (reservationData && Array.isArray(reservationData.tables)) {
              tableName = reservationData.tables.map(table => table.name || table.tableName).join(', ');
            }
          }
        } catch (error) {
          console.error('Error fetching reservation for order item:', error);
        }
      }
      
      const orderItemWithDetails = {
        ...orderItem.toObject(),
        foodId: food || { _id: orderItem.foodId, name: 'Food not found' },
        tableName: tableName || 'Unknown Table'
      };
      res.json(orderItemWithDetails);
    } catch (error) {
      console.error('Error fetching details for order item:', error);
      const orderItemWithDetails = {
        ...orderItem.toObject(),
        foodId: { _id: orderItem.foodId, name: 'Food not found' },
        tableName: 'Unknown Table'
      };
      res.json(orderItemWithDetails);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái OrderItem (chỉ cho phép update status đúng flow)
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderItem = await OrderItem.findById(req.params.id).populate('orderId'); // Populate để lấy thông tin order
    if (!orderItem) return res.status(404).json({ error: 'OrderItem not found' });
    if (!status || status === orderItem.status) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ hoặc không thay đổi' });
    }
    if (!canChangeStatus(orderItem.status, status)) {
      return res.status(400).json({ error: 'Không thể chuyển trạng thái này!' });
    }

    const oldStatus = orderItem.status;
    orderItem.status = status;
    orderItem.statusHistory.push({ status, changedAt: new Date() });
    await orderItem.save();

    // Lấy order cha để cập nhật
    const order = orderItem.orderId;
    if (order) {
        const allItems = await OrderItem.find({ _id: { $in: order.orderItemId } });
        const servedItems = allItems.filter(item => item.status === 'Served');
        order.totalPrice = servedItems.reduce((sum, item) => sum + Number(item.price), 0);
        await order.save();
    }
    
    // 2. Cập nhật lại quantity cho food item khi order item được trả về "Cancelled"
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      try {
        const food = await ExternalService.getFoodById(orderItem.foodId, req.headers.authorization);
        if (food) {
          const newQuantity = food.quantity + orderItem.quantity;
          await ExternalService.updateFoodQuantity(orderItem.foodId, newQuantity, req.headers.authorization);
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật lại số lượng món ăn:', error.message);
        // Có thể thêm logic để xử lý lỗi này, ví dụ: lưu vào một hàng đợi để thử lại
      }
    }

    // Fetch updated order item with food and table information
    try {
      const updatedOrderItem = await OrderItem.findById(orderItem._id)
        .populate('orderId', 'orderStatus totalPrice reservationId');
      
      // Fetch food information
      const food = await ExternalService.getFoodById(updatedOrderItem.foodId, req.headers.authorization);
      
      // Fetch table information from reservation
      let tableName = null;
      if (updatedOrderItem.orderId && updatedOrderItem.orderId.reservationId) {
        try {
          const reservation = await ExternalService.getReservationById(updatedOrderItem.orderId.reservationId, req.headers.authorization);
          let reservationData = null;
          if (reservation) {
            if (reservation.data && reservation.data.reservation) {
              reservationData = reservation.data.reservation;
            } else if (reservation.reservation) {
              reservationData = reservation.reservation;
            } else {
              reservationData = reservation;
            }
            
            // Get table names from reservation
            if (reservationData && Array.isArray(reservationData.tables)) {
              tableName = reservationData.tables.map(table => table.name || table.tableName).join(', ');
            }
          }
        } catch (error) {
          console.error('Error fetching reservation for updated order item:', error);
        }
      }
      
      const orderItemWithDetails = {
        ...updatedOrderItem.toObject(),
        foodId: food || { _id: updatedOrderItem.foodId, name: 'Food not found' },
        tableName: tableName || 'Unknown Table'
      };
      
      res.json(orderItemWithDetails);
    } catch (error) {
      console.error('Error fetching details for updated order item:', error);
      const updatedOrderItem = await OrderItem.findById(orderItem._id)
        .populate('orderId', 'orderStatus totalPrice reservationId');
      
      const orderItemWithDetails = {
        ...updatedOrderItem.toObject(),
        foodId: { _id: updatedOrderItem.foodId, name: 'Food not found' },
        tableName: 'Unknown Table'
      };
      
      res.json(orderItemWithDetails);
    }
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