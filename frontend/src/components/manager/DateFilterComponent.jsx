import React, { useState } from 'react';

const DateFilterComponent = ({ 
  filterType, 
  setFilterType, 
  customDateRange, 
  setCustomDateRange,
  onApplyFilter 
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const filterOptions = [
    { value: 'today', label: 'Today', icon: '📅' },
    { value: 'week', label: 'Week', icon: '📊' },
    { value: 'month', label: 'Month', icon: '📈' },
    { value: 'quarter', label: 'Quarter', icon: '📋' },
    { value: 'year', label: 'Year', icon: '📆' }
  ];

  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    setShowCustomPicker(false); // Close custom picker when switching
    onApplyFilter();
  };

  const handleCustomRangeClick = () => {
    setShowCustomPicker(!showCustomPicker);
  };

  const handleDateChange = (field, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomApply = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setFilterType('custom');
      setShowCustomPicker(false);
      onApplyFilter();
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getDateRangeText = () => {
    const now = new Date();
    switch (filterType) {
      case 'today':
        return now.toLocaleDateString('en-US');
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return `${startOfWeek.toLocaleDateString('en-US')} - ${endOfWeek.toLocaleDateString('en-US')}`;
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor((now.getMonth() + 3) / 3);
        return `Q${quarter} ${now.getFullYear()}`;
      case 'year':
        return `${now.getFullYear()}`;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          return `${new Date(customDateRange.startDate).toLocaleDateString('en-US')} - ${new Date(customDateRange.endDate).toLocaleDateString('en-US')}`;
        }
        return 'Custom';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterType === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-base">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
          
          {/* Custom Range Button */}
          <div className="relative">
            <button
              onClick={handleCustomRangeClick}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterType === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-base">📅</span>
              <span>Custom</span>
            </button>
            
            {/* Custom Date Picker Dropdown */}
            {showCustomPicker && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-80">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        max={getTodayDate()}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        min={customDateRange.startDate}
                        max={getTodayDate()}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setShowCustomPicker(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCustomApply}
                      disabled={!customDateRange.startDate || !customDateRange.endDate}
                      className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Range Display - Compact */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Range:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
            {getDateRangeText()}
          </span>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        {/* Current Range Display - Top */}
        <div className="flex justify-center">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {getDateRangeText()}
          </span>
        </div>
        
        {/* Filter Buttons - Mobile */}
        <div className="grid grid-cols-3 gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                filterType === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg mb-1">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
          
          {/* Custom Range Button - Mobile */}
          <div className="relative">
            <button
              onClick={handleCustomRangeClick}
              className={`w-full flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                filterType === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg mb-1">📅</span>
              <span>Custom</span>
            </button>
            
            {/* Custom Date Picker Dropdown - Mobile */}
            {showCustomPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      max={getTodayDate()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      min={customDateRange.startDate}
                      max={getTodayDate()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setShowCustomPicker(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCustomApply}
                      disabled={!customDateRange.startDate || !customDateRange.endDate}
                      className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilterComponent;
