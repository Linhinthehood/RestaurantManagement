const Food = require('../models/Food');
const Category = require('../models/Category');

// Validate quantity của food
const validateFoodQuantity = (req, res, next) => {
  const { quantity } = req.body;
  
  if (quantity !== undefined) {
    const quantityNum = Number(quantity);
    
    if (isNaN(quantityNum)) {
      return res.status(400).json({ 
        error: 'Quantity phải là một số hợp lệ' 
      });
    }
    
    if (quantityNum < 0) {
      return res.status(400).json({ 
        error: 'Quantity không thể là số âm' 
      });
    }
    
    if (!Number.isInteger(quantityNum)) {
      return res.status(400).json({ 
        error: 'Quantity phải là số nguyên' 
      });
    }
    
    req.body.quantity = quantityNum;
  }
  
  next();
};

// Validate price của food
const validateFoodPrice = (req, res, next) => {
  const { pricePerUnit } = req.body;
  
  if (pricePerUnit !== undefined) {
    const priceNum = Number(pricePerUnit);
    
    if (isNaN(priceNum)) {
      return res.status(400).json({ 
        error: 'Giá phải là một số hợp lệ' 
      });
    }
    
    if (priceNum < 0) {
      return res.status(400).json({ 
        error: 'Giá không thể là số âm' 
      });
    }
    
    if (priceNum > 10000000) { // Giới hạn 10 triệu VND
      return res.status(400).json({ 
        error: 'Giá không được vượt quá 10,000,000 VND' 
      });
    }
    
    req.body.pricePerUnit = priceNum;
  }
  
  next();
};

// Validate tên món ăn
const validateFoodName = (req, res, next) => {
  const { name } = req.body;
  
  if (name !== undefined) {
    if (typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Tên món ăn phải là chuỗi ký tự' 
      });
    }
    
    if (name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Tên món ăn không được để trống' 
      });
    }
    
    if (name.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Tên món ăn phải có ít nhất 2 ký tự' 
      });
    }
    
    if (name.trim().length > 100) {
      return res.status(400).json({ 
        error: 'Tên món ăn không được vượt quá 100 ký tự' 
      });
    }
    
    // Kiểm tra ký tự đặc biệt không hợp lệ
    const invalidChars = /[<>{}]/;
    if (invalidChars.test(name)) {
      return res.status(400).json({ 
        error: 'Tên món ăn chứa ký tự không hợp lệ' 
      });
    }
    
    req.body.name = name.trim();
  }
  
  next();
};

// Validate mô tả món ăn
const validateFoodDescription = (req, res, next) => {
  const { description } = req.body;
  
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({ 
        error: 'Mô tả phải là chuỗi ký tự' 
      });
    }
    
    if (description.trim().length > 500) {
      return res.status(400).json({ 
        error: 'Mô tả không được vượt quá 500 ký tự' 
      });
    }
    
    req.body.description = description.trim();
  }
  
  next();
};

// Validate status của food
const validateFoodStatus = (req, res, next) => {
  const { status } = req.body;
  
  if (status !== undefined) {
    const validStatuses = ['Available', 'Unavailable'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Status phải là Available hoặc Unavailable' 
      });
    }
  }
  
  next();
};

// Validate categoryId
const validateCategoryId = async (req, res, next) => {
  const { categoryId } = req.body;
  
  if (categoryId !== undefined) {
    if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        error: 'categoryId không hợp lệ' 
      });
    }
    
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ 
          error: 'Category không tồn tại' 
        });
      }
    } catch (err) {
      return res.status(500).json({ 
        error: 'Lỗi khi kiểm tra category' 
      });
    }
  }
  
  next();
};

// Validate ObjectId format
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      error: 'ID không hợp lệ' 
    });
  }
  
  next();
};

// Validate image file
const validateImageFile = (req, res, next) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Chỉ chấp nhận file ảnh định dạng JPEG, JPG, PNG, WEBP' 
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'Kích thước file không được vượt quá 5MB' 
      });
    }
  }
  
  next();
};

// Kiểm tra trùng lặp tên món ăn trong cùng category
const validateDuplicateFoodName = async (req, res, next) => {
  const { name, categoryId } = req.body;
  const foodId = req.params.id; // Cho trường hợp update
  
  if (name && categoryId) {
    try {
      let query = { 
        name: name.trim(), 
        categoryId: categoryId 
      };
      
      // Nếu là update, loại trừ food hiện tại
      if (foodId) {
        query._id = { $ne: foodId };
      }
      
      const existingFood = await Food.findOne(query);
      
      if (existingFood) {
        return res.status(400).json({ 
          error: 'Đã tồn tại món ăn với tên này trong category này' 
        });
      }
    } catch (err) {
      return res.status(500).json({ 
        error: 'Lỗi khi kiểm tra trùng lặp tên món ăn' 
      });
    }
  }
  
  next();
};

// Validate tất cả cho food
const validateFoodData = [
  validateFoodName,
  validateFoodDescription,
  validateFoodPrice,
  validateFoodQuantity,
  validateFoodStatus,
  validateCategoryId,
  validateImageFile,
  validateDuplicateFoodName
];

module.exports = {
  validateFoodQuantity,
  validateFoodPrice,
  validateFoodName,
  validateFoodDescription,
  validateFoodStatus,
  validateCategoryId,
  validateObjectId,
  validateImageFile,
  validateDuplicateFoodName,
  validateFoodData
}; 