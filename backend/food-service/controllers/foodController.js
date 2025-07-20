const Food = require('../models/Food');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const Category = require('../models/Category');

// Tạo mới food
exports.createFood = async (req, res) => {
  try {
    // Kiểm tra categoryId hợp lệ và tồn tại
    const { categoryId } = req.body;
    if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'categoryId không hợp lệ' });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Category không tồn tại' });
    }
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'food_images'
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }
    const food = new Food({
      ...req.body,
      image: imageUrl
    });
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả food
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find().populate('categoryId', 'name priority');
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy food theo id
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('categoryId', 'name priority');
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách món ăn theo categoryId
exports.getFoodsByCategory = async (req, res) => {
  try {
    const foods = await Food.find({ categoryId: req.params.categoryId }).populate('categoryId', 'name priority');
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật food
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('categoryId', 'name priority');
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa food
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json({ message: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 