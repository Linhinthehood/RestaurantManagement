import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { paymentService } from '../../services/paymentService';
import DateFilterComponent from './DateFilterComponent';

const DashboardTab = () => {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    monthlyRevenue: [],
    paymentMethods: [],
    recentPayments: []
  });
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filterType, setFilterType] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (allPayments.length > 0) {
      applyDateFilter();
    }
  }, [allPayments, filterType, customDateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments();
      
      if (response.success && response.data) {
        const payments = response.data;
        setAllPayments(payments);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (type) => {
    const now = new Date();
    let startDate, endDate;

    switch (type) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarter':
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          endDate = new Date(customDateRange.endDate);
          endDate.setDate(endDate.getDate() + 1); // Include end date
        } else {
          return null;
        }
        break;
      default:
        return null;
    }

    return { startDate, endDate };
  };

  const applyDateFilter = () => {
    const dateRange = getDateRange(filterType);
    if (!dateRange) {
      setFilteredPayments(allPayments);
      processDashboardData(allPayments);
      return;
    }

    const { startDate, endDate } = dateRange;
    const filtered = allPayments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDate && paymentDate < endDate;
    });

    setFilteredPayments(filtered);
    processDashboardData(filtered);
  };

  const handleApplyFilter = () => {
    applyDateFilter();
  };

  const processDashboardData = (payments) => {
    // Calculate basic stats
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'Completed').length;
    const pendingPayments = payments.filter(p => p.status === 'Pending').length;
    
    // Calculate total revenue from completed payments
    const totalRevenue = payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, payment) => {
        let amount = 0;
        if (payment.finalAmount && typeof payment.finalAmount === 'object' && payment.finalAmount.$numberDecimal) {
          amount = parseFloat(payment.finalAmount.$numberDecimal);
        } else if (payment.finalAmount) {
          amount = parseFloat(payment.finalAmount);
        }
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    // Process monthly revenue data
    const monthlyData = processMonthlyRevenue(payments);
    
    // Process payment methods data
    const methodsData = processPaymentMethods(payments);
    
    // Get recent payments (last 5)
    const recentPayments = payments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    setDashboardData({
      totalRevenue,
      totalPayments,
      completedPayments,
      pendingPayments,
      monthlyRevenue: monthlyData,
      paymentMethods: methodsData,
      recentPayments
    });
  };

  const processMonthlyRevenue = (payments) => {
    const timeMap = {};
    
    payments.filter(p => p.status === 'Completed').forEach(payment => {
      const date = new Date(payment.createdAt);
      let timeKey;
      
      // Generate time key based on filter type
      switch (filterType) {
        case 'today':
          timeKey = `${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'week':
          timeKey = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'month':
          timeKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
        case 'year':
          timeKey = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        case 'custom':
          // For custom range, use daily breakdown if range <= 31 days, otherwise monthly
          const dateRange = getDateRange(filterType);
          if (dateRange) {
            const daysDiff = (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24);
            if (daysDiff <= 31) {
              timeKey = date.toLocaleDateString('en-US');
            } else {
              timeKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
          } else {
            timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          }
          break;
        default:
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      let amount = 0;
      if (payment.finalAmount && typeof payment.finalAmount === 'object' && payment.finalAmount.$numberDecimal) {
        amount = parseFloat(payment.finalAmount.$numberDecimal);
      } else if (payment.finalAmount) {
        amount = parseFloat(payment.finalAmount);
      }
      
      if (!timeMap[timeKey]) {
        timeMap[timeKey] = { time: timeKey, revenue: 0, count: 0 };
      }
      
      timeMap[timeKey].revenue += isNaN(amount) ? 0 : amount;
      timeMap[timeKey].count += 1;
    });

    return Object.values(timeMap).sort((a, b) => {
      // Sort by time appropriately
      if (filterType === 'today') {
        return a.time.localeCompare(b.time);
      }
      return a.time.localeCompare(b.time);
    });
  };

  const processPaymentMethods = (payments) => {
    const methodsMap = {};
    
    payments.filter(p => p.status === 'Completed').forEach(payment => {
      const method = payment.paymentMethod || 'Unknown';
      if (!methodsMap[method]) {
        methodsMap[method] = { name: method, value: 0, count: 0 };
      }
      
      let amount = 0;
      if (payment.finalAmount && typeof payment.finalAmount === 'object' && payment.finalAmount.$numberDecimal) {
        amount = parseFloat(payment.finalAmount.$numberDecimal);
      } else if (payment.finalAmount) {
        amount = parseFloat(payment.finalAmount);
      }
      
      methodsMap[method].value += isNaN(amount) ? 0 : amount;
      methodsMap[method].count += 1;
    });

    return Object.values(methodsMap);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter Component */}
      <DateFilterComponent
        filterType={filterType}
        setFilterType={setFilterType}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        onApplyFilter={handleApplyFilter}
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.completedPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend - {filterType === 'today' ? 'Hourly' : 
                            filterType === 'week' ? 'Daily' : 
                            filterType === 'month' ? 'Daily' : 
                            filterType === 'year' ? 'Monthly' : 
                            filterType === 'quarter' ? 'Monthly' : 'Timeline'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.paymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentPayments.map((payment) => {
                let finalAmount = 0;
                if (payment.finalAmount && typeof payment.finalAmount === 'object' && payment.finalAmount.$numberDecimal) {
                  finalAmount = parseFloat(payment.finalAmount.$numberDecimal);
                } else if (payment.finalAmount) {
                  finalAmount = parseFloat(payment.finalAmount);
                }

                return (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.paymentCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(finalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
