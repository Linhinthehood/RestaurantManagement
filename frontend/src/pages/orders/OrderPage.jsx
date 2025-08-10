import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Clock,
  Phone,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  UtensilsCrossed
} from "lucide-react";
import {
  fetchArrivedAndServingReservations,
  createOrder,
  clearError,
  clearSuccess,
  updateOrderStatus
} from "../../store/orderSlice";

const OrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { arrivedReservations, servingReservations, loading, error, success } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const [creatingOrderId, setCreatingOrderId] = useState(null);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  useEffect(() => {
    dispatch(fetchArrivedAndServingReservations());
  }, [dispatch]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US');
  };

  const handleCreateOrder = async (reservation) => {
    if (!user) {
      alert('Please login to create an order');
      return;
    }
    if (!window.confirm('Do you want to create an order for this reservation?')) return;
    setCreatingOrderId(reservation._id);
    try {
      const orderData = {
        reservationId: reservation._id,
        userId: user._id,
        tableId: reservation.tableId || null,
        orderItemId: [],
        totalPrice: 0,
        orderStatus: 'Serving'
      };
      await dispatch(createOrder(orderData)).unwrap();
      dispatch(fetchArrivedAndServingReservations());
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setCreatingOrderId(null);
    }
  };

  const handleGoToMenu = (reservation) => {
    // Lấy orderId từ reservation.order nếu có
    const orderId = reservation.order?._id || reservation.orderId || reservation._id;
    navigate(`/dashboard/menu?orderId=${orderId}&reservationId=${reservation._id}`);
  };

  const handlePayment = async (reservation) => {
    const orderId = reservation.order?._id || reservation.orderId;
    if (!orderId) {
      alert('Không tìm thấy order để thanh toán');
      return;
    }

    // Xác nhận trước khi thực hiện
    if (!window.confirm('Bạn có chắc chắn muốn hoàn thành order này và chuyển sang thanh toán?')) {
      return;
    }

    setProcessingPaymentId(orderId);
    try {
      // Cập nhật order status sang Completed
      await dispatch(updateOrderStatus({ orderId, orderStatus: 'Completed' })).unwrap();
      
      // Refresh danh sách reservations để cập nhật UI
      dispatch(fetchArrivedAndServingReservations());
      
      // Chuyển hướng đến trang payment
      navigate(`/dashboard/payment?orderId=${orderId}&reservationId=${reservation._id}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Lỗi: ${error.message || 'Không thể hoàn thành order'}`);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create & Manage Orders</h1>
            <p className="text-gray-600 mt-1">Select checked-in reservations to create orders or continue serving</p>
          </div>
          <button
            onClick={() => dispatch(fetchArrivedAndServingReservations())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>
      {/* Arrived Reservations (no order yet) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center"><Plus className="w-5 h-5 mr-2" />Reservations without orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading reservations...</span>
            </div>
          ) : arrivedReservations.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">No reservations ready to create orders</div>
          ) : (
            arrivedReservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCreateOrder(reservation)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">
                        {reservation.customerId?.name || 'Customer'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {reservation.customerId?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Check-in: {formatDate(reservation.checkInTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Guests: {reservation.quantity}</span>
                    </div>
                    {reservation.tables && reservation.tables.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">Table:</span>
                        <div className="flex flex-wrap gap-1">
                          {reservation.tables.map((table, index) => (
                            <span
                              key={table._id || index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {table.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {reservation.note && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Note:</span> {reservation.note}
                      </div>
                    )}
                  </div>
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      creatingOrderId === reservation._id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={creatingOrderId === reservation._id}
                  >
                    {creatingOrderId === reservation._id ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating order...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Order
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Serving Reservations (has order with Serving status) */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-green-700 flex items-center"><UtensilsCrossed className="w-5 h-5 mr-2" />Reservations being served</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading reservations...</span>
            </div>
          ) : servingReservations.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">No reservations currently being served</div>
          ) : (
            servingReservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleGoToMenu(reservation)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">
                        {reservation.customerId?.name || 'Customer'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {reservation.customerId?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Check-in: {formatDate(reservation.checkInTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Guests: {reservation.quantity}</span>
                    </div>
                    {reservation.tables && reservation.tables.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">Table:</span>
                        <div className="flex flex-wrap gap-1">
                          {reservation.tables.map((table, index) => (
                            <span
                              key={table._id || index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {table.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {reservation.note && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Note:</span> {reservation.note}
                      </div>
                    )}
                  </div>
                  <button
                    className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                  >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Continue serving / Select dishes
                  </button>
                  <button
                    onClick={() => handlePayment(reservation)}
                    className={`w-full mt-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                      processingPaymentId === (reservation.order?._id || reservation.orderId)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={processingPaymentId === (reservation.order?._id || reservation.orderId)}
                  >
                    {processingPaymentId === (reservation.order?._id || reservation.orderId) ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Order & Payment
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
