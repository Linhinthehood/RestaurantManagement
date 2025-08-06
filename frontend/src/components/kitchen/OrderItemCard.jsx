import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrderItemStatus } from '../../store/orderSlice';

const OrderItemCard = ({ orderItem }) => {
  const dispatch = useDispatch();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Status colors
  const statusColors = {
    Pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    Preparing: 'bg-blue-100 border-blue-300 text-blue-800',
    Ready_to_serve: 'bg-green-100 border-green-300 text-green-800',
    Served: 'bg-gray-100 border-gray-300 text-gray-800',
    Cancelled: 'bg-red-100 border-red-300 text-red-800'
  };

  // Status Vietnamese labels
  const statusLabels = {
    Pending: 'Chờ xử lý',
    Preparing: 'Đang chế biến',
    Ready_to_serve: 'Sẵn sàng phục vụ',
    Served: 'Đã phục vụ',
    Cancelled: 'Đã hủy'
  };

  // Next status options
  const getNextStatusOptions = (currentStatus) => {
    const flow = {
      Pending: ['Preparing', 'Cancelled'],
      Preparing: ['Ready_to_serve', 'Cancelled'],
      Ready_to_serve: ['Served'],
      Served: [],
      Cancelled: []
    };
    return flow[currentStatus] || [];
  };

  // Calculate elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const createdAt = new Date(orderItem.createdAt);
      const elapsed = Math.floor((now - createdAt) / 1000); // seconds
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [orderItem.createdAt]);

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      await dispatch(updateOrderItemStatus({ id: orderItem._id, status: newStatus })).unwrap();
    } catch (error) {
      console.error('OrderItemCard - handleStatusUpdate: Error updating status:', error);
    }
  };

  // Get latest status change time
  const getLatestStatusTime = () => {
    if (orderItem.statusHistory && orderItem.statusHistory.length > 0) {
      const latest = orderItem.statusHistory[orderItem.statusHistory.length - 1];
      return new Date(latest.changedAt).toLocaleTimeString('vi-VN');
    }
    return new Date(orderItem.createdAt).toLocaleTimeString('vi-VN');
  };

  const nextStatusOptions = getNextStatusOptions(orderItem.status);

  return (
    <div className={`border rounded-lg p-4 shadow-md ${statusColors[orderItem.status]}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {orderItem.foodId?.name || 'Food Name'}
          </h3>
          <p className="text-sm opacity-75">
            Order ID: {orderItem.orderId?._id || orderItem.orderId}
          </p>
          {orderItem.tableName && (
            <p className="text-xs text-blue-600 font-medium">
              Table: {orderItem.tableName}
            </p>
          )}
          {orderItem.orderId?.orderStatus && (
            <p className="text-xs text-gray-500">
              Order Status: <span className="font-medium">{orderItem.orderId.orderStatus}</span>
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[orderItem.status]}`}>
            {statusLabels[orderItem.status]}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Số lượng:</span>
          <span className="text-lg font-bold">{orderItem.quantity}</span>
        </div>
        
        {orderItem.note && (
          <div>
            <span className="font-medium">Ghi chú:</span>
            <p className="text-sm bg-white bg-opacity-50 p-2 rounded mt-1">
              {orderItem.note}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <span className="font-medium">Giá:</span>
          <span className="font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              typeof orderItem.price === 'string' ? parseFloat(orderItem.price) : orderItem.price
            )}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-white bg-opacity-50 p-2 rounded mb-3">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600">Thời gian đã trôi</div>
          <div className="text-xl font-mono font-bold">
            {formatTime(elapsedTime)}
          </div>
        </div>
      </div>

      {/* Status History */}
      {orderItem.statusHistory && orderItem.statusHistory.length > 1 && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-600 mb-2">Lịch sử trạng thái:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {orderItem.statusHistory.slice(-3).map((history, index) => (
              <div key={index} className="text-xs flex justify-between">
                <span>{statusLabels[history.status]}</span>
                <span>{new Date(history.changedAt).toLocaleTimeString('vi-VN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Buttons */}
      {nextStatusOptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Cập nhật trạng thái:</div>
          <div className="flex flex-wrap gap-2">
            {nextStatusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  status === 'Cancelled' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 mt-3 text-center">
        Cập nhật lần cuối: {getLatestStatusTime()}
      </div>
    </div>
  );
};

export default OrderItemCard; 