import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  fetchAllFoods,
  clearError,
  setSelectedCategory,
  clearSelectedCategory
} from "../../store/foodSlice";
import { orderItemService } from "../../services/orderService";
import { AlertCircle, Loader2, Plus, Minus } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MenuPage = () => {
  const dispatch = useDispatch();
  const { foods, categories, loading, error, selectedCategory } = useSelector((state) => state.food);
  const [quantityMap, setQuantityMap] = useState({});
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

  const handleAdd = async (food) => {
    if (!orderId) {
      alert('No order selected!');
      return;
    }
    try {
      await orderItemService.createOrderItem({
        orderId,
        foodId: food._id,
        quantity: getQuantity(food._id)
      });
      alert('Order item added successfully!');
    } catch (err) {
      alert('Failed to add order item!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Category filter bar */}
      <div className="w-full bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
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
        </div>
      </div>

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