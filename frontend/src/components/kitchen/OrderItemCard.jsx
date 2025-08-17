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

  // Status English labels
  const statusLabels = {
    Pending: 'Pending',
    Preparing: 'Preparing',
    Ready_to_serve: 'Ready to Serve',
    Served: 'Served',
    Cancelled: 'Cancelled'
  };

  // Next status options - Chef can only change to specific statuses
  const getNextStatusOptions = (currentStatus) => {
    const flow = {
      Pending: ['Preparing', 'Cancelled'],
      Preparing: ['Ready_to_serve', 'Cancelled'],
      Ready_to_serve: [], // Chef cannot change to Served, only Waiter can
      Served: [],
      Cancelled: []
    };
    return flow[currentStatus] || [];
  };

  // Calculate elapsed time (stop counting for Served and Cancelled orders)
  useEffect(() => {
    // Don't count time for served or cancelled orders
    if (orderItem.status === 'Served' || orderItem.status === 'Cancelled') {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const createdAt = new Date(orderItem.createdAt);
      const elapsed = Math.floor((now - createdAt) / 1000); // seconds
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [orderItem.createdAt, orderItem.status]);

  // Reset timer when status changes
  useEffect(() => {
    if (orderItem.status === 'Pending' || orderItem.status === 'Preparing' || orderItem.status === 'Ready_to_serve') {
      setElapsedTime(0);
    }
  }, [orderItem.status]);

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
      // Timer will be reset automatically due to useEffect dependency on orderItem.status
    } catch (error) {
      console.error('OrderItemCard - handleStatusUpdate: Error updating status:', error);
    }
  };

  // Get latest status change time
  const getLatestStatusTime = () => {
    if (orderItem.statusHistory && orderItem.statusHistory.length > 0) {
      const latest = orderItem.statusHistory[orderItem.statusHistory.length - 1];
      return new Date(latest.changedAt).toLocaleTimeString('en-US');
    }
    return new Date(orderItem.createdAt).toLocaleTimeString('en-US');
  };

  // Extract price value from MongoDB Decimal128
  const getPriceValue = (price) => {
    if (!price) return 0;
    if (typeof price === 'object' && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal);
    }
    if (typeof price === 'string') {
      return parseFloat(price);
    }
    if (typeof price === 'number') {
      return price;
    }
    return 0;
  };

  const nextStatusOptions = getNextStatusOptions(orderItem.status);
  const priceValue = getPriceValue(orderItem.price);

  return (
    <div className={`border rounded-lg p-4 shadow-md ${statusColors[orderItem.status]}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {orderItem.foodId?.name || 'Food Name'}
          </h3>
          {orderItem.tableName && (
            <p className="text-xs text-blue-600 font-medium">
              Table: {orderItem.tableName}
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
          <span className="font-medium">Quantity:</span>
          <span className="text-lg font-bold">{orderItem.quantity}</span>
        </div>
        
        {orderItem.note && (
          <div>
            <span className="font-medium">Note:</span>
            <p className="text-sm bg-white bg-opacity-50 p-2 rounded mt-1">
              {orderItem.note}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <span className="font-medium">Price:</span>
          <span className="font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceValue)}
          </span>
        </div>
      </div>

      {/* Timer */}
      {orderItem.status === 'Served' ? (
        <div className="bg-gray-100 p-2 rounded mb-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Order Served</div>
            <div className="text-xs text-gray-500">No time tracking needed</div>
          </div>
        </div>
      ) : orderItem.status === 'Cancelled' ? (
        <div className="bg-red-100 p-2 rounded mb-3">
          <div className="text-center">
            <div className="text-sm font-medium text-red-600">Order Cancelled</div>
            <div className="text-xs text-red-500">No time tracking needed</div>
          </div>
        </div>
      ) : (
        <div className="bg-white bg-opacity-50 p-2 rounded mb-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Elapsed Time</div>
            <div className="text-xl font-mono font-bold">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Buttons */}
      {nextStatusOptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Update Status:</div>
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
        Last updated: {getLatestStatusTime()}
      </div>
    </div>
  );
};

export default OrderItemCard; 