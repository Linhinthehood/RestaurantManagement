import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import { createOrder } from '../../store/orderSlice';

const CreateOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    reservationId: '',
    tableId: '',
    orderItems: []
  });

  const [availableReservations, setAvailableReservations] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);

  // Mock data cho demo
  useEffect(() => {
    setAvailableReservations([
      { _id: 'res1', customerName: 'Nguyễn Văn A', phone: '0123456789', tableName: 'Bàn 1' },
      { _id: 'res2', customerName: 'Trần Thị B', phone: '0987654321', tableName: 'Bàn 3' }
    ]);
    
    setAvailableTables([
      { _id: 'table1', name: 'Bàn 1', capacity: 4, status: 'Available' },
      { _id: 'table2', name: 'Bàn 2', capacity: 6, status: 'Available' },
      { _id: 'table3', name: 'Bàn 3', capacity: 2, status: 'Occupied' }
    ]);
    
    setAvailableFoods([
      { _id: 'food1', name: 'Phở bò', price: 50000, category: 'Món chính' },
      { _id: 'food2', name: 'Cơm tấm', price: 45000, category: 'Món chính' },
      { _id: 'food3', name: 'Bún chả', price: 40000, category: 'Món chính' },
      { _id: 'food4', name: 'Nước mía', price: 15000, category: 'Đồ uống' },
      { _id: 'food5', name: 'Cà phê sữa', price: 25000, category: 'Đồ uống' }
    ]);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFoodItem = () => {
    const newItem = {
      foodId: '',
      quantity: 1,
      note: '',
      price: 0
    };
    setSelectedFoods(prev => [...prev, newItem]);
  };

  const removeFoodItem = (index) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const updateFoodItem = (index, field, value) => {
    setSelectedFoods(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Cập nhật giá nếu thay đổi món ăn
      if (field === 'foodId') {
        const selectedFood = availableFoods.find(food => food._id === value);
        if (selectedFood) {
          updated[index].price = selectedFood.price;
        }
      }
      
      return updated;
    });
  };

  const calculateTotal = () => {
    return selectedFoods.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reservationId && !formData.tableId) {
      alert('Vui lòng chọn reservation hoặc table');
      return;
    }

    if (selectedFoods.length === 0) {
      alert('Vui lòng chọn ít nhất một món ăn');
      return;
    }

    const orderData = {
      reservationId: formData.reservationId || undefined,
      tableId: formData.tableId || undefined,
      userId: user?._id,
      totalPrice: calculateTotal(),
      orderItems: selectedFoods.map(item => ({
        foodId: item.foodId,
        quantity: item.quantity,
        note: item.note,
        price: item.price
      }))
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({ reservationId: '', tableId: '', orderItems: [] });
      setSelectedFoods([]);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Tạo đơn hàng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reservation/Table Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Reservation
              </label>
              <select
                value={formData.reservationId}
                onChange={(e) => handleInputChange('reservationId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn reservation...</option>
                {availableReservations.map(reservation => (
                  <option key={reservation._id} value={reservation._id}>
                    {reservation.customerName} - {reservation.phone} ({reservation.tableName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Bàn (nếu không có reservation)
              </label>
              <select
                value={formData.tableId}
                onChange={(e) => handleInputChange('tableId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!formData.reservationId}
              >
                <option value="">Chọn bàn...</option>
                {availableTables
                  .filter(table => table.status === 'Available')
                  .map(table => (
                    <option key={table._id} value={table._id}>
                      {table.name} (Sức chứa: {table.capacity})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Food Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chọn món ăn</h3>
              <button
                type="button"
                onClick={addFoodItem}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm món
              </button>
            </div>

            {selectedFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có món ăn nào được chọn
              </div>
            ) : (
              <div className="space-y-3">
                {selectedFoods.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Món ăn
                        </label>
                        <select
                          value={item.foodId}
                          onChange={(e) => updateFoodItem(index, 'foodId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Chọn món...</option>
                          {availableFoods.map(food => (
                            <option key={food._id} value={food._id}>
                              {food.name} - {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(food.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số lượng
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateFoodItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateFoodItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-none focus:ring-0"
                            min="1"
                          />
                          <button
                            type="button"
                            onClick={() => updateFoodItem(index, 'quantity', item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ghi chú
                        </label>
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => updateFoodItem(index, 'note', e.target.value)}
                          placeholder="Không cay, ít đường..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá
                          </label>
                          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(item.price * item.quantity)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          {selectedFoods.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span className="text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(calculateTotal())}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || selectedFoods.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo đơn hàng'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal; 