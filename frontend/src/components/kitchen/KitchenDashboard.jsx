import React from 'react';

const KitchenDashboard = ({ orderItems, selectedStatus, onStatusFilterChange }) => {
  // Calculate statistics (only for active order items)
  const stats = {
    total: orderItems.filter(item => item.status !== 'Served' && item.status !== 'Cancelled').length,
    pending: orderItems.filter(item => item.status === 'Pending').length,
    preparing: orderItems.filter(item => item.status === 'Preparing').length,
    ready: orderItems.filter(item => item.status === 'Ready_to_serve').length
  };

  // Status options for filter (exclude Served and Cancelled as they are not displayed)
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Preparing', label: 'Preparing' },
    { value: 'Ready_to_serve', label: 'Ready to Serve' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Kitchen Dashboard</h2>
          <p className="text-gray-600">Manage orders in the kitchen</p>
        </div>
        
        {/* Status Filter */}
        <div className="mt-4 lg:mt-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-700">Total</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
          <div className="text-sm text-blue-700">Preparing</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          <div className="text-sm text-green-700">Ready</div>
        </div>
      </div>

      {/* Priority Alerts */}
      <div className="mt-6">
        {stats.pending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {stats.pending} orders are pending
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please process these orders as soon as possible.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {stats.ready > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {stats.ready} dishes are ready to serve
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>These dishes are ready to be served to customers.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard; 