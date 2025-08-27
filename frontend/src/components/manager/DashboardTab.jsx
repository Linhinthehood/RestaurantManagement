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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  // Pagination states for payments table
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [tablePayments, setTablePayments] = useState([]);

  // Removed initial fetch; we fetch via the effect below to avoid double calls

  useEffect(() => {
    if (allPayments.length > 0) {
      processDashboardData(allPayments);
    } else {
      setDashboardData({
        totalRevenue: 0,
        totalPayments: 0,
        completedPayments: 0,
        pendingPayments: 0,
        monthlyRevenue: [],
        paymentMethods: [],
        recentPayments: []
      });
    }
  }, [allPayments]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = { filterType };
      if (filterType === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }
      const response = await paymentService.getAllPayments(params);
      const paged = await paymentService.getPaymentsPaginated({ page, limit, ...params });
      
      if (response.success && response.data) {
        const payments = response.data;
        setAllPayments(payments);
      }
      if (paged && paged.success && Array.isArray(paged.data)) {
        setTablePayments(paged.data);
        if (paged.pagination) {
          setPagination({ total: paged.pagination.total, totalPages: paged.pagination.totalPages });
        } else {
          setPagination({ total: paged.data.length, totalPages: 1 });
        }
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

  const handleApplyFilter = () => {
    // No-op: fetching is handled by useEffect on filter changes to avoid stale state
    return;
  };

  // Single unified refetch effect
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, customDateRange.startDate, customDateRange.endDate, page, limit]);

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

  // Formatter cho trục Y (không dùng style currency để tránh ký hiệu thừa và làm tròn)
  const formatAxisCurrency = (value) => {
    if (typeof value !== 'number') return value;
    if (Math.abs(value) >= 1000) {
      const thousands = Math.round(value / 1000);
      return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(thousands) + 'k';
    }
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Format ISO UTC string without timezone conversion, e.g., 2025-08-19T19:00:00.000Z -> 19/08/2025 • 19:00
  const formatIsoRawDateTime = (isoString) => {
    if (!isoString || typeof isoString !== 'string') return 'N/A';
    const [datePart, timePartWithZ] = isoString.split('T');
    if (!datePart || !timePartWithZ) return 'N/A';
    const [year, month, day] = datePart.split('-');
    const timePart = timePartWithZ.replace('Z', '').slice(0, 5); // HH:mm
    return `${day}/${month}/${year} • ${timePart}`;
  };

  const parseAmount = (amount) => {
    if (!amount && amount !== 0) return 0;
    if (typeof amount === 'object' && amount.$numberDecimal) {
      const parsed = parseFloat(amount.$numberDecimal);
      return isNaN(parsed) ? 0 : parsed;
    }
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const openPaymentDetails = async (paymentId) => {
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedPayment(null);
    try {
      const res = await paymentService.getPaymentById(paymentId);
      if (res && res.success && res.data) {
        setSelectedPayment(res.data);
      } else if (res && res.data) {
        setSelectedPayment(res.data);
      } else if (res) {
        // Direct object case
        setSelectedPayment(res);
      } else {
        setDetailsError('Failed to load payment details');
      }
    } catch (e) {
      setDetailsError('Failed to load payment details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closePaymentDetails = () => {
    setIsDetailsOpen(false);
    setSelectedPayment(null);
    setDetailsError(null);
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
              <YAxis tickFormatter={formatAxisCurrency} allowDecimals={false} />
              <Tooltip formatter={(value) => [formatAxisCurrency(value), 'Revenue']} />
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
            <p className="text-sm text-gray-500">Page {page} of {Math.max(1, pagination.totalPages || 1)} • {pagination.total} payments</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`px-3 py-2 text-sm rounded-lg ${page <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => (pagination.totalPages ? Math.min(pagination.totalPages, p + 1) : p + 1))}
                disabled={pagination.totalPages ? page >= pagination.totalPages : false}
                className={`px-3 py-2 text-sm rounded-lg ${(pagination.totalPages && page >= pagination.totalPages) ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
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
              {(tablePayments || []).map((payment) => {
                let finalAmount = 0;
                if (payment.finalAmount && typeof payment.finalAmount === 'object' && payment.finalAmount.$numberDecimal) {
                  finalAmount = parseFloat(payment.finalAmount.$numberDecimal);
                } else if (payment.finalAmount) {
                  finalAmount = parseFloat(payment.finalAmount);
                }

                return (
                  <tr 
                    key={payment._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openPaymentDetails(payment._id)}
                  >
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
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4">
          <div className="absolute inset-0 bg-white/20" onClick={closePaymentDetails}></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl mx-4 border border-white/20">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                {selectedPayment?.paymentCode && (
                  <p className="text-sm text-gray-600">Code: <span className="font-mono">{selectedPayment.paymentCode}</span></p>
                )}
              </div>
              <button onClick={closePaymentDetails} className="p-2 rounded hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {detailsLoading && (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              )}
              {detailsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {detailsError}
                </div>
              )}
              {!detailsLoading && !detailsError && selectedPayment && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedPayment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : selectedPayment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPayment.status}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Method</p>
                      <p className="mt-1 font-medium">{selectedPayment.paymentMethod || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="mt-1 font-medium">{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    {selectedPayment.createdByUser && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">Handled By</p>
                        <p className="mt-1 font-medium">{selectedPayment.createdByUser.name} ({selectedPayment.createdByUser.role})</p>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const originalAmount = parseAmount(selectedPayment.originalAmount);
                    const taxAmount = parseAmount(selectedPayment.taxAmount);
                    const discountAmount = parseAmount(selectedPayment.discountAmount);
                    const depositAmount = parseAmount(selectedPayment.depositAmount);
                    const finalAmount = parseAmount(selectedPayment.finalAmount);
                    return (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="font-semibold mb-3">Payment Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Food Total:</span>
                            <span>{formatCurrency(originalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT Tax (10%):</span>
                            <span>+{formatCurrency(taxAmount)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Discount:</span>
                              <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                          )}
                          {depositAmount > 0 && (
                            <div className="flex justify-between text-blue-600">
                              <span>Deposit:</span>
                              <span>-{formatCurrency(depositAmount)}</span>
                            </div>
                          )}
                          <hr className="my-2" />
                          <div className="flex justify-between font-medium text-lg">
                            <span>Total Amount:</span>
                            <span className="text-green-600">{formatCurrency(finalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {(selectedPayment.reservation || selectedPayment.customer) && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="font-semibold mb-3">Customer & Reservation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Customer</p>
                          <p className="font-medium">
                            {selectedPayment.reservation?.customerId?.name || selectedPayment.customer?.name || 'N/A'}
                          </p>
                          <p className="text-gray-600 mt-2">Phone</p>
                          <p className="font-medium">
                            {selectedPayment.reservation?.customerId?.phone || selectedPayment.customer?.phone || 'N/A'}
                          </p>
                          <p className="text-gray-600 mt-2">Check-in Time</p>
                          <p className="font-medium">
                            {formatIsoRawDateTime(selectedPayment.reservation?.checkInTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-medium">{selectedPayment.reservation?.quantity || 'N/A'}</p>
                          <p className="text-gray-600 mt-2">Tables</p>
                          <p className="font-medium">{(selectedPayment.reservation?.tables || []).map(t => t.name).join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={closePaymentDetails} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
