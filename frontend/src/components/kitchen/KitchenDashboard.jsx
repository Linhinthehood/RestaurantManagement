import React from 'react';

const KitchenDashboard = ({ orderItems, selectedStatus, onStatusFilterChange }) => {
  const stats = {
    total: orderItems.filter(item => item.status !== 'Served' && item.status !== 'Cancelled').length,
    pending: orderItems.filter(item => item.status === 'Pending').length,
    preparing: orderItems.filter(item => item.status === 'Preparing').length,
    ready: orderItems.filter(item => item.status === 'Ready_to_serve').length
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Preparing', label: 'Preparing' },
    { value: 'Ready_to_serve', label: 'Ready' }
  ];

  return (
    <div>
      <div className="flex items-center justify-start mb-2">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-md shadow p-3 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <span className="inline-flex justify-center items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 w-full">
          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
          Total: <strong>{stats.total}</strong>
        </span>
        <span className="inline-flex justify-center items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 w-full">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          Pending: <strong>{stats.pending}</strong>
        </span>
        <span className="inline-flex justify-center items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 w-full">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Preparing: <strong>{stats.preparing}</strong>
        </span>
        <span className="inline-flex justify-center items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 w-full">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Ready: <strong>{stats.ready}</strong>
        </span>
      </div>
    </div>
      
    </div>
    
    
  );
};

export default KitchenDashboard; 