import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronDown, Check } from 'lucide-react';
import { updateOrderItemStatus } from '../../store/orderSlice';

const OrderItemStatusBadge = ({ orderItem, orderId }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'Pending', label: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'Preparing', label: 'Đang chế biến', color: 'text-orange-600 bg-orange-100' },
    { value: 'Ready_to_serve', label: 'Sẵn sàng phục vụ', color: 'text-blue-600 bg-blue-100' },
    { value: 'Served', label: 'Đã phục vụ', color: 'text-green-600 bg-green-100' },
    { value: 'Cancelled', label: 'Đã hủy', color: 'text-red-600 bg-red-100' }
  ];

  const currentStatus = statusOptions.find(option => option.value === orderItem.status);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === orderItem.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updateOrderItemStatus({ 
        orderItemId: orderItem._id, 
        status: newStatus 
      })).unwrap();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating order item status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus?.color} hover:opacity-80 transition-opacity disabled:opacity-50`}
      >
        {isUpdating ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : (
          <ChevronDown className="w-3 h-3 mr-1" />
        )}
        {currentStatus?.label}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  option.value === orderItem.status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                  {option.label}
                </span>
                {option.value === orderItem.status && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderItemStatusBadge; 