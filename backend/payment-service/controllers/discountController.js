const Discount = require('../models/Discount');
const ExternalService = require('../services/externalService');

// Tạo mã giảm giá mới
exports.createDiscount = async (req, res) => {
  try {
    const { discountPercentage, quantity } = req.body;

    // Lấy thông tin user từ token
    const userProfile = await ExternalService.getUserProfile(req.headers.authorization);
    if (!userProfile || !userProfile.data || !userProfile.data.user) {
      return res.status(401).json({
        success: false,
        message: 'Không thể xác thực người dùng'
      });
    }
    const createdBy = userProfile.data.user._id;

    // Validate phần trăm giảm giá
    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Phần trăm giảm giá phải từ 1-100%'
      });
    }

    // Validate số lượng
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng mã giảm giá phải lớn hơn 0'
      });
    }

    // Tạo discount mới
    const discount = new Discount({
      discountPercentage,
      quantity,
      createdBy,
      status: 'Active'
    });

    await discount.save();

    res.status(201).json({
      success: true,
      message: 'Mã giảm giá được tạo thành công',
      data: discount
    });

  } catch (err) {
    console.error('Error creating discount:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy tất cả mã giảm giá
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .sort({ createdAt: -1 });

    // Enrich discounts với thông tin user
    const enrichedDiscounts = await Promise.all(
      discounts.map(async (discount) => {
        const discountObj = discount.toObject();
        if (discount.createdBy) {
          const user = await ExternalService.getUserById(discount.createdBy, req.headers.authorization);
          discountObj.createdByUser = user?.data?.user || user;
        }
        return discountObj;
      })
    );

    res.json({
      success: true,
      message: 'Lấy danh sách mã giảm giá thành công',
      data: enrichedDiscounts
    });

  } catch (err) {
    console.error('Error getting all discounts:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy mã giảm giá theo ID
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    // Enrich discount với thông tin user
    const discountObj = discount.toObject();
    if (discount.createdBy) {
      const user = await ExternalService.getUserById(discount.createdBy, req.headers.authorization);
      discountObj.createdByUser = user?.data?.user || user;
    }

    res.json({
      success: true,
      message: 'Lấy mã giảm giá thành công',
      data: discountObj
    });

  } catch (err) {
    console.error('Error getting discount by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy mã giảm giá theo code
exports.getDiscountByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const discount = await Discount.findOne({ 
      discountCode: code.toUpperCase() 
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    // Enrich discount với thông tin user
    const discountObj = discount.toObject();
    if (discount.createdBy) {
      const user = await ExternalService.getUserById(discount.createdBy, req.headers.authorization);
      discountObj.createdByUser = user?.data?.user || user;
    }

    res.json({
      success: true,
      message: 'Lấy mã giảm giá thành công',
      data: discountObj
    });

  } catch (err) {
    console.error('Error getting discount by code:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Cập nhật mã giảm giá
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật một số trường
    const forbiddenFields = ['discountCode', 'createdBy', 'usedCount'];
    forbiddenFields.forEach(field => delete updateData[field]);

    // Validate phần trăm giảm giá nếu có cập nhật
    if (updateData.discountPercentage !== undefined) {
      if (updateData.discountPercentage < 1 || updateData.discountPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Phần trăm giảm giá phải từ 1-100%'
        });
      }
    }

    // Validate số lượng nếu có cập nhật
    if (updateData.quantity !== undefined) {
      if (updateData.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng mã giảm giá phải lớn hơn 0'
        });
      }
      
      // Kiểm tra số lượng mới không được nhỏ hơn số lần đã sử dụng
      const currentDiscount = await Discount.findById(id);
      if (currentDiscount && updateData.quantity < currentDiscount.usedCount) {
        return res.status(400).json({
          success: false,
          message: `Số lượng mới (${updateData.quantity}) không được nhỏ hơn số lần đã sử dụng (${currentDiscount.usedCount})`
        });
      }
    }

    const discount = await Discount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật mã giảm giá thành công',
      data: discount
    });

  } catch (err) {
    console.error('Error updating discount:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Xóa mã giảm giá
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findById(id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    // Kiểm tra xem mã có đang được sử dụng không
    if (discount.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa mã giảm giá đã được sử dụng'
      });
    }

    await Discount.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Xóa mã giảm giá thành công'
    });

  } catch (err) {
    console.error('Error deleting discount:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// Lấy mã giảm giá còn hiệu lực
exports.getActiveDiscounts = async (req, res) => {
  try {
    const activeDiscounts = await Discount.find({
      status: 'Active'
    });

    // Lọc ra những mã còn có thể sử dụng
    const availableDiscounts = activeDiscounts.filter(discount => discount.isValid);

    // Enrich discounts với thông tin user
    const enrichedDiscounts = await Promise.all(
      availableDiscounts.map(async (discount) => {
        const discountObj = discount.toObject();
        if (discount.createdBy) {
          const user = await ExternalService.getUserById(discount.createdBy, req.headers.authorization);
          discountObj.createdByUser = user?.data?.user || user;
        }
        return discountObj;
      })
    );

    res.json({
      success: true,
      message: 'Lấy danh sách mã giảm giá còn hiệu lực thành công',
      data: enrichedDiscounts
    });

  } catch (err) {
    console.error('Error getting active discounts:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};
