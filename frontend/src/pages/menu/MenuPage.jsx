import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  fetchAllFoods,
  clearError,
  setSelectedCategory,
  clearSelectedCategory
} from "../../store/foodSlice";
import { orderService, orderItemService } from "../../services/orderService";
import { AlertCircle, Loader2, Plus, Minus, ShoppingCart, X } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MenuPage = () => {
  const dispatch = useDispatch();
  const { foods, categories, loading, error, selectedCategory } = useSelector((state) => state.food);
  const [quantityMap, setQuantityMap] = useState({});
  const [noteMap, setNoteMap] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [showOrderItems, setShowOrderItems] = useState(false);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  const query = useQuery();
  const orderId = query.get('orderId');
  const reservationId = query.get('reservationId');

  useEffect(() => {
    dispatch(fetchAllFoods());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Fetch order items when orderId changes
  useEffect(() => {
    if (orderId) {
      fetchOrderItems();
    }
  }, [orderId]);

  const fetchOrderItems = async () => {
    if (!orderId) return;
    
    setLoadingOrderItems(true);
    try {
      const response = await orderService.getOrderById(orderId);
      setOrderItems(response.orderItems || []);
    } catch (err) {
      console.error('Failed to fetch order items:', err);
    } finally {
      setLoadingOrderItems(false);
    }
  };

  // Group foods by category
  const groupedFoods = categories.map(category => ({
    category,
    foods: foods.filter(food => food.category?._id === category._id)
  })).filter(group => group.foods.length > 0);

  const handleCategoryClick = (categoryId) => {
    dispatch(setSelectedCategory(categoryId));
    // Scroll to category section
    const section = document.getElementById(`category-${categoryId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Quantity handlers
  const getQuantity = (foodId) => quantityMap[foodId] || 1;
  const setQuantity = (foodId, value) => {
    setQuantityMap(prev => ({ ...prev, [foodId]: value < 1 ? 1 : value }));
  };
  const increaseQuantity = (foodId) => setQuantity(foodId, getQuantity(foodId) + 1);
  const decreaseQuantity = (foodId) => setQuantity(foodId, getQuantity(foodId) - 1);

  // Note handlers
  const getNote = (foodId) => noteMap[foodId] || '';
  const setNote = (foodId, value) => {
    setNoteMap(prev => ({ ...prev, [foodId]: value }));
  };

  const handleAdd = async (food) => {
    if (!orderId) {
      alert('No order selected!');
      return;
    }
    try {
      await orderItemService.createOrderItem({
        orderId,
        foodId: food._id,
        quantity: getQuantity(food._id),
        note: getNote(food._id)
      });
      
      // Reset quantity and note for this food
      setQuantity(food._id, 1);
      setNote(food._id, '');
      
      // Refresh order items
      await fetchOrderItems();
      
      alert('Order item added successfully!');
    } catch (err) {
      alert('Failed to add order item!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Preparing': return 'bg-blue-100 text-blue-800';
      case 'Ready_to_serve': return 'bg-orange-100 text-orange-800';
      case 'Served': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Category filter bar */}
      <div className="w-full bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2 overflow-x-auto items-center">
          <button
            onClick={() => dispatch(clearSelectedCategory())}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
          
          {/* Order Items Button */}
          {orderId && (
            <button
              onClick={() => setShowOrderItems(!showOrderItems)}
              className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {loadingOrderItems ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Order Items (${orderItems.length})`
              )}
            </button>
          )}
        </div>
      </div>

      {/* Order Items Modal */}
      {showOrderItems && orderId && (
        <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] rounded-lg shadow-lg bg-white border border-gray-200 overflow-y-auto">
          <button
            onClick={() => setShowOrderItems(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Order Items</h2>
          </div>
          <div className="p-6">
            {loadingOrderItems ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading order items...</span>
              </div>
            ) : orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items in this order yet
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.foodName || item.foodId?.name || item.food?.name || 'Unknown Food'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Quantity: {item.quantity} × {formatPrice(item.price?.$numberDecimal ? Number(item.price.$numberDecimal) : item.price / item.quantity)} = {formatPrice(item.price?.$numberDecimal ? Number(item.price.$numberDecimal) : item.price)}
                    </div>
                    {item.note && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Note:</span> {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
            <p className="text-gray-600 mt-1">Select a dish to add to the order</p>
          </div>
          <button
            onClick={() => dispatch(fetchAllFoods())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading menu...</span>
          </div>
        ) : (
          <div>
            {groupedFoods.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No dishes found</div>
            ) : (
              groupedFoods.map(group => (
                <section key={group.category._id} id={`category-${group.category._id}`} className="mb-12">
                  <h2 className="text-xl font-bold mb-6 text-blue-700">{group.category.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.foods.map(food => (
                      <div key={food._id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                        <div className="h-80 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-gray-400 text-4xl">🍽️</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{food.name}</h3>
                          {food.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{food.description}</p>}
                          
                          {/* Note Input */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Note (optional)
                            </label>
                            <textarea
                              value={getNote(food._id)}
                              onChange={(e) => setNote(food._id, e.target.value)}
                              placeholder="Add special instructions..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                              rows="2"
                            />
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between gap-2">
                            <span className="text-lg font-bold text-blue-600">{formatPrice(food.price)}</span>
                            <div className="flex items-center gap-1">
                              <button
                                className="w-8 h-8 bg-gray-200 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-300"
                                onClick={() => decreaseQuantity(food._id)}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={getQuantity(food._id)}
                                onChange={e => setQuantity(food._id, Number(e.target.value))}
                                className="w-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                className="w-8 h-8 bg-gray-200 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-300"
                                onClick={() => increaseQuantity(food._id)}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm font-medium transition-colors"
                              onClick={() => handleAdd(food)}
                            >
                              <Plus className="w-4 h-4" /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage; 