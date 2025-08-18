import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllFoods,
  clearError,
  setSelectedCategory,
  clearSelectedCategory
} from '../../store/foodSlice';
import { foodService } from '../../services/foodService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  AlertCircle,
  Loader2,
  X,
  Upload,
  Tag
} from 'lucide-react';

const MenuManagementTab = () => {
  const dispatch = useDispatch();
  const { foods, categories, loading, error, selectedCategory } = useSelector((state) => state.food);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [success, setSuccess] = useState(null);
  const [menuError, setMenuError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Food form state
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    pricePerUnit: '',
    categoryId: '',
    quantity: '',
    status: 'Available',
    image: null,
    imagePreview: ''
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    priority: 'Medium'
  });

  useEffect(() => {
    dispatch(fetchAllFoods());
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setMenuError(error);
      const timer = setTimeout(() => {
        dispatch(clearError());
        setMenuError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await foodService.getAllCategories();
      setAllCategories(response.data || response);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setMenuError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Filter foods based on search term and selected category
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || food.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + 'đ';
  };

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      dispatch(clearSelectedCategory());
    } else {
      dispatch(setSelectedCategory(categoryId));
    }
  };

  // Food Modal Functions
  const openFoodModal = (food = null) => {
    if (food) {
      setEditingFood(food);
      setFoodForm({
        name: food.name,
        description: food.description || '',
        pricePerUnit: food.price.toString(),
        categoryId: food.category?._id || '',
        quantity: food.quantity?.toString() || '',
        status: food.status || 'Available',
        image: null,
        imagePreview: food.image || ''
      });
    } else {
      setEditingFood(null);
      setFoodForm({
        name: '',
        description: '',
        pricePerUnit: '',
        categoryId: '',
        quantity: '',
        status: 'Available',
        image: null,
        imagePreview: ''
      });
    }
    setShowFoodModal(true);
  };

  const closeFoodModal = () => {
    setShowFoodModal(false);
    setEditingFood(null);
    setFoodForm({
      name: '',
      description: '',
      pricePerUnit: '',
      categoryId: '',
      quantity: '',
      status: 'Available',
      image: null,
      imagePreview: ''
    });
  };

  const handleFoodImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Luôn sử dụng FormData để tương thích với backend
      const formData = new FormData();
      formData.append('name', foodForm.name);
      formData.append('description', foodForm.description);
      formData.append('pricePerUnit', foodForm.pricePerUnit);
      formData.append('categoryId', foodForm.categoryId);
      formData.append('quantity', foodForm.quantity);
      formData.append('status', foodForm.status);
      
      // Chỉ append image nếu có file mới
      if (foodForm.image) {
        formData.append('image', foodForm.image);
      }

      if (editingFood) {
        await foodService.updateFood(editingFood._id, formData);
        setSuccess('Food updated successfully!');
      } else {
        await foodService.createFood(formData);
        setSuccess('Food created successfully!');
      }

      closeFoodModal();
      dispatch(fetchAllFoods());
    } catch (err) {
      console.error('Error saving food:', err);
      setMenuError(err.response?.data?.message || 'Failed to save food');
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await foodService.deleteFood(foodId);
        setSuccess('Food deleted successfully!');
        dispatch(fetchAllFoods());
      } catch (err) {
        console.error('Error deleting food:', err);
        setMenuError(err.response?.data?.message || 'Failed to delete food');
      }
    }
  };

  // Category Modal Functions
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        priority: category.priority || 'Medium'
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        priority: 'Medium'
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      priority: 'Medium'
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await foodService.updateCategory(editingCategory._id, categoryForm);
        setSuccess('Category updated successfully!');
      } else {
        await foodService.createCategory(categoryForm);
        setSuccess('Category created successfully!');
      }

      closeCategoryModal();
      await fetchCategories();
      dispatch(fetchAllFoods()); // Refresh foods to get updated category info
    } catch (err) {
      console.error('Error saving category:', err);
      setMenuError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All foods in this category will need to be reassigned.')) {
      try {
        await foodService.deleteCategory(categoryId);
        setSuccess('Category deleted successfully!');
        await fetchCategories();
        dispatch(fetchAllFoods());
      } catch (err) {
        console.error('Error deleting category:', err);
        setMenuError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {menuError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{menuError}</span>
          </div>
          <button 
            onClick={() => setMenuError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
          <button 
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage food items and categories</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openCategoryModal()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Add Category
          </button>
          <button
            onClick={() => openFoodModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Food
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search foods by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Filter by category:</span>
          </div>
        </div>
        
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => dispatch(clearSelectedCategory())}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({foods.length})
          </button>
          {categories.map((category) => {
            const count = foods.filter(food => food.category?._id === category._id).length;
            return (
              <button
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        </div>
        <div className="p-4">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCategories.map((category) => {
                const priorityColors = {
                  'High': 'bg-red-100 text-red-800',
                  'Medium': 'bg-yellow-100 text-yellow-800',
                  'Low': 'bg-green-100 text-green-800'
                };
                
                return (
                  <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${priorityColors[category.priority] || priorityColors['Medium']}`}>
                          {category.priority} Priority
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {foods.filter(food => food.category?._id === category._id).length} items
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Foods Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Food Items ({filteredFoods.length})
            </h3>
            <button
              onClick={() => dispatch(fetchAllFoods())}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading foods...</span>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No food items found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Start by adding your first food item'}
              </p>
              <button
                onClick={() => openFoodModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add First Food Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.map(food => (
                <div key={food._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {food.image ? (
                      <img src={food.image} alt={food.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-gray-400 text-4xl">🍽️</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{food.name}</h4>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openFoodModal(food)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit Food"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(food._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete Food"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {food.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{food.description}</p>
                    )}
                    
                    {/* Status and Quantity */}
                    <div className="flex gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        food.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {food.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        food.quantity > 10 
                          ? 'bg-blue-100 text-blue-800'
                          : food.quantity > 0
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Stock: {food.quantity || 0}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">{formatPrice(food.price)}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {food.category?.name || 'No Category'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Food Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button onClick={closeFoodModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleFoodSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter food name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={foodForm.description}
                  onChange={(e) => setFoodForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter food description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (VND) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={foodForm.pricePerUnit}
                  onChange={(e) => setFoodForm(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={foodForm.categoryId}
                  onChange={(e) => setFoodForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {allCategories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={foodForm.quantity}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Stock quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={foodForm.status}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Image
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFoodImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {foodForm.imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={foodForm.imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeFoodModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingFood ? 'Update Food' : 'Create Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  required
                  value={categoryForm.priority}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  High priority categories appear first in menus
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementTab;
