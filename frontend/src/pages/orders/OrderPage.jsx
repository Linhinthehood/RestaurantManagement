import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  Loader2
} from "lucide-react";
import { 
  fetchOrders, 
  updateOrderStatus, 
  deleteOrder,
  clearError,
  clearSuccess,
  setFilters
} from "../../store/orderSlice";
import CreateOrderModal from "../../components/orders/CreateOrderModal";
import OrderStats from "../../components/orders/OrderStats";
import OrderItemStatusBadge from "../../components/orders/OrderItemStatusBadge";

const OrderPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, success, filters } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [localFilters, setLocalFilters] = useState({
    status: "",
    date: "",
    search: ""
  });

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Clear error/success messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Serving": return "text-blue-600 bg-blue-100";
      case "Completed": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Serving": return <Clock className="w-4 h-4" />;
      case "Completed": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getOrderItemStatusColor = (status) => {
    switch (status) {
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Preparing": return "text-orange-600 bg-orange-100";
      case "Ready_to_serve": return "text-blue-600 bg-blue-100";
      case "Served": return "text-green-600 bg-green-100";
      case "Cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getOrderItemStatusText = (status) => {
    switch (status) {
      case "Pending": return "Chờ xử lý";
      case "Preparing": return "Đang chế biến";
      case "Ready_to_serve": return "Sẵn sàng phục vụ";
      case "Served": return "Đã phục vụ";
      case "Cancelled": return "Đã hủy";
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      dispatch(deleteOrder(orderId));
    }
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả đơn hàng</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Tạo đơn hàng mới
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <OrderStats orders={orders} />

      {/* Filter Panel */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Serving">Đang phục vụ</option>
            <option value="Completed">Hoàn thành</option>
          </select>

          <input
            type="date"
            value={localFilters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bàn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.tables?.[0]?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="ml-1">
                        {order.orderStatus === "Serving" ? "Đang phục vụ" : "Hoàn thành"}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Chỉnh sửa"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert('Chức năng chỉnh sửa sẽ được implement sau');
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Xóa"
                        onClick={() => handleDeleteOrder(order._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder._id.slice(-6)}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>SĐT:</strong> {selectedOrder.customer?.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
                <p><strong>Bàn:</strong> {selectedOrder.tables?.[0]?.name}</p>
                <p><strong>Trạng thái:</strong> {selectedOrder.orderStatus}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(selectedOrder.totalPrice)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Danh sách món ăn</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Món ăn</th>
                      <th className="px-4 py-2 text-left">Số lượng</th>
                      <th className="px-4 py-2 text-left">Giá</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems?.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">Món {index + 1}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatPrice(item.price)}</td>
                        <td className="px-4 py-2">
                          <OrderItemStatusBadge orderItem={item} orderId={selectedOrder._id} />
                        </td>
                        <td className="px-4 py-2">{item.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          dispatch(fetchOrders());
        }}
      />
    </div>
  );
};

export default OrderPage;
