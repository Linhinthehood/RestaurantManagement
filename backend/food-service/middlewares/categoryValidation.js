const Category = require('../models/Category');

// Validate tên category
const validateCategoryName = (req, res, next) => {
  const { name } = req.body;
  
  if (name !== undefined) {
    if (typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Tên category phải là chuỗi ký tự' 
      });
    }
    
    if (name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Tên category không được để trống' 
      });
    }
    
    if (name.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Tên category phải có ít nhất 2 ký tự' 
      });
    }
    
    if (name.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Tên category không được vượt quá 50 ký tự' 
      });
    }
    
    // Kiểm tra ký tự đặc biệt không hợp lệ
    const invalidChars = /[<>{}]/;
    if (invalidChars.test(name)) {
      return res.status(400).json({ 
        error: 'Tên category chứa ký tự không hợp lệ' 
      });
    }
    
    req.body.name = name.trim();
  }
  
  next();
};

// Validate priority của category
const validateCategoryPriority = (req, res, next) => {
  const { priority } = req.body;
  
  if (priority !== undefined) {
    const validPriorities = ['High', 'Medium', 'Low'];
    
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority phải là High, Medium hoặc Low' 
      });
    }
  }
  
  next();
};

// Validate ObjectId format cho category
const validateCategoryObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ 
      error: 'Category ID không hợp lệ' 
    });
  }
  
  next();
};

// Kiểm tra trùng lặp tên category
const validateDuplicateCategoryName = async (req, res, next) => {
  const { name } = req.body;
  const categoryId = req.params.id; // Cho trường hợp update
  
  if (name) {
    try {
      let query = { name: name.trim() };
      
      // Nếu là update, loại trừ category hiện tại
      if (categoryId) {
        query._id = { $ne: categoryId };
      }
      
      const existingCategory = await Category.findOne(query);
      
      if (existingCategory) {
        return res.status(400).json({ 
          error: 'Đã tồn tại category với tên này' 
        });
      }
    } catch (err) {
      return res.status(500).json({ 
        error: 'Lỗi khi kiểm tra trùng lặp tên category' 
      });
    }
  }
  
  next();
};

// Kiểm tra category có đang được sử dụng không (trước khi xóa)
const validateCategoryInUse = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const Food = require('../models/Food');
    const foodsUsingCategory = await Food.findOne({ categoryId: id });
    
    if (foodsUsingCategory) {
      return res.status(400).json({ 
        error: 'Không thể xóa category đang được sử dụng bởi món ăn' 
      });
    }
  } catch (err) {
    return res.status(500).json({ 
      error: 'Lỗi khi kiểm tra category đang sử dụng' 
    });
  }
  
  next();
};

// Validate tất cả cho category
const validateCategoryData = [
  validateCategoryName,
  validateCategoryPriority,
  validateDuplicateCategoryName
];

module.exports = {
  validateCategoryName,
  validateCategoryPriority,
  validateCategoryObjectId,
  validateDuplicateCategoryName,
  validateCategoryInUse,
  validateCategoryData
}; 