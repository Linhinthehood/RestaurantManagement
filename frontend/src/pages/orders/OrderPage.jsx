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
  UtensilsCrossed,
  CreditCard
} from "lucide-react";
import {
  fetchArrivedAndServingReservations,
  createOrder,
  updateOrderStatus,
  clearError,
  clearSuccess
} from "../../store/orderSlice";
import { paymentService } from "../../services/paymentService";

const OrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { arrivedReservations, servingReservations, loading, error, success } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const [creatingOrderId, setCreatingOrderId] = useState(null);
  const [closingOrderId, setClosingOrderId] = useState(null);
  const [creatingPaymentId, setCreatingPaymentId] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchArrivedAndServingReservations());
  }, [dispatch]);

  // Debug: Log serving reservations when they change
  useEffect(() => {
    console.log('Serving reservations updated:', servingReservations);
    servingReservations.forEach(reservation => {
      console.log(`Reservation ${reservation._id}:`, {
        order: reservation.order,
        orderItems: reservation.order?.orderItems,
        canComplete: canCompleteOrder(reservation)
      });
    });
  }, [servingReservations]);

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

  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localSuccess]);

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => {
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const formatDate = (dateString) => {
    // Trừ đi 7 giờ để hiển thị đúng giờ check-in
    const date = new Date(dateString);
    date.setHours(date.getHours() - 7);
    return date.toLocaleString('en-US');
  };

  const handleCreateOrder = async (reservation) => {
    if (!user) {
      setLocalError('Please login to create an order');
      return;
    }
    
    setShowConfirm({
      type: 'createOrder',
      message: 'Do you want to create an order for this reservation?',
      reservation: reservation
    });
  };

  const confirmCreateOrder = async (reservation) => {
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
      setLocalSuccess('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      setLocalError('Failed to create order. Please try again.');
    } finally {
      setCreatingOrderId(null);
      setShowConfirm(null);
    }
  };

  const handleGoToMenu = (reservation) => {
    // Lấy orderId từ reservation.order nếu có
    const orderId = reservation.order?._id || reservation.orderId || reservation._id;
    navigate(`/dashboard/menu?orderId=${orderId}&reservationId=${reservation._id}`);
  };

  // Check if order can be completed (all order items are Served or Cancelled)
  const canCompleteOrder = (reservation) => {
    console.log('Checking canCompleteOrder for reservation:', reservation._id);
    console.log('Reservation order:', reservation.order);
    console.log('Order items:', reservation.order?.orderItems);
    
    if (!reservation.order || !reservation.order.orderItems || reservation.order.orderItems.length === 0) {
      console.log('Cannot complete: No order or order items');
      return false;
    }
    
    // Order can be completed when all items are either served or cancelled
    const canComplete = reservation.order.orderItems.every(item => {
      const isComplete = item.status === 'Served' || item.status === 'Cancelled';
      console.log(`Item ${item._id} status: ${item.status}, isComplete: ${isComplete}`);
      return isComplete;
    });
    
    console.log('Can complete order:', canComplete);
    return canComplete;
  };

  // Handle close order (change status to Completed)
  const handleCloseOrder = async (reservation) => {
    if (!reservation.order?._id) {
      setLocalError('No order found for this reservation');
      return;
    }

    if (!canCompleteOrder(reservation)) {
      setLocalError('Cannot close order. Some order items are still pending.');
      return;
    }

    setShowConfirm({
      type: 'closeOrder',
      message: 'Are you sure you want to close this order? Order will be moved to Completed status.',
      reservation: reservation
    });
  };

  const confirmCloseOrder = async (reservation) => {
    setClosingOrderId(reservation._id);
    try {
      await dispatch(updateOrderStatus({ 
        orderId: reservation.order._id, 
        status: 'Completed' 
      })).unwrap();
      
      // Refresh the reservations list
      dispatch(fetchArrivedAndServingReservations());
      setLocalSuccess('Order closed successfully!');
    } catch (error) {
      console.error('Error closing order:', error);
      setLocalError('Failed to close order. Please try again.');
    } finally {
      setClosingOrderId(null);
      setShowConfirm(null);
    }
  };

  // Handle create payment and navigate to payment page
  const handleCreatePayment = async (reservation) => {
    if (!reservation.order?._id) {
      setLocalError('No order found for this reservation');
      return;
    }

    if (reservation.order.orderStatus !== 'Completed') {
      setLocalError('Order must be completed before creating payment');
      return;
    }

    setShowConfirm({
      type: 'createPayment',
      message: 'Do you want to create a payment for this order?',
      reservation: reservation
    });
  };

  const confirmCreatePayment = async (reservation) => {
    setCreatingPaymentId(reservation._id);
    try {
      // Create payment through payment service
      const paymentData = {
        reservationId: reservation._id,
        paymentMethod: 'Cash', // Default method, can be changed in payment page
        discountId: null // No discount by default
      };

      const paymentResponse = await paymentService.createPayment(paymentData);
      
      if (paymentResponse.success) {
        // Navigate to payment page with payment ID
        navigate(`/dashboard/payment?paymentId=${paymentResponse.data._id}&orderId=${reservation.order._id}&reservationId=${reservation._id}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setLocalError('Failed to create payment. Please try again.');
    } finally {
      setCreatingPaymentId(null);
      setShowConfirm(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Fixed Notifications */}
      {(error || localError) && (
        <div className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-red-200/50 rounded-2xl shadow-2xl px-6 py-4 max-w-md transform transition-all duration-300 translate-x-0">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-base font-semibold text-gray-900 mb-1">Error</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{error || localError}</p>
            </div>
            <button 
              onClick={() => {
                if (error) dispatch(clearError());
                if (localError) setLocalError(null);
              }}
              className="ml-4 flex-shrink-0 w-8 h-8 bg-gray-100/80 hover:bg-gray-200/80 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 backdrop-blur-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {(success || localSuccess) && (
        <div className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-green-200/50 rounded-2xl shadow-2xl px-6 py-4 max-w-md transform transition-all duration-300 translate-x-0">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-base font-semibold text-gray-900 mb-1">Success</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{success || localSuccess}</p>
            </div>
            <button 
              onClick={() => {
                if (success) dispatch(clearSuccess());
                if (localSuccess) setLocalSuccess(null);
              }}
              className="ml-4 flex-shrink-0 w-8 h-8 bg-gray-100/80 hover:bg-gray-200/80 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 backdrop-blur-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          {/* Glass morphism modal */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Header with icon */}
            <div className="p-8 pb-6">
              <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full shadow-lg animate-in zoom-in-95 duration-500 delay-200 ${
                showConfirm.type === 'createOrder' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                showConfirm.type === 'closeOrder' ? 'bg-gradient-to-br from-orange-100 to-orange-200' :
                'bg-gradient-to-br from-green-100 to-green-200'
              }`}>
                {showConfirm.type === 'createOrder' && <Plus className="w-10 h-10 text-blue-600" />}
                {showConfirm.type === 'closeOrder' && <CheckCircle className="w-10 h-10 text-orange-600" />}
                {showConfirm.type === 'createPayment' && <CreditCard className="w-10 h-10 text-green-600" />}
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-3 animate-in slide-in-from-top-4 duration-500 delay-300">
                {showConfirm.type === 'createOrder' && 'Create Order'}
                {showConfirm.type === 'closeOrder' && 'Close Order'}
                {showConfirm.type === 'createPayment' && 'Create Payment'}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed text-lg animate-in slide-in-from-top-4 duration-500 delay-400">{showConfirm.message}</p>
            </div>
            
            {/* Action buttons */}
            <div className="px-8 pb-8 animate-in slide-in-from-bottom-4 duration-500 delay-500">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 px-6 py-4 text-gray-700 bg-gray-100/80 backdrop-blur-sm rounded-2xl hover:bg-gray-200/80 transition-all duration-200 font-semibold text-lg border border-gray-200/50 hover:shadow-lg transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showConfirm.type === 'createOrder') {
                      confirmCreateOrder(showConfirm.reservation);
                    } else if (showConfirm.type === 'closeOrder') {
                      confirmCloseOrder(showConfirm.reservation);
                    } else if (showConfirm.type === 'createPayment') {
                      confirmCreatePayment(showConfirm.reservation);
                    }
                  }}
                  className={`flex-1 px-6 py-4 text-white rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    showConfirm.type === 'createOrder' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' :
                    showConfirm.type === 'closeOrder' ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' :
                    'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {showConfirm.type === 'createOrder' && 'Create Order'}
                  {showConfirm.type === 'closeOrder' && 'Close Order'}
                  {showConfirm.type === 'createPayment' && 'Create Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <div className="mb-6">
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
      </div> */}
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
                    
                    {/* Order Items Status */}
                    {reservation.order?.orderItems && reservation.order.orderItems.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Food Status:</div>
                        <div className="space-y-1">
                          {reservation.order.orderItems.map((item, index) => (
                            <div key={item._id || index} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">
                                {item.foodName || `Item ${index + 1}`} (x{item.quantity})
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.status === 'Served' ? 'bg-green-100 text-green-800' :
                                item.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                item.status === 'Ready_to_serve' ? 'bg-orange-100 text-orange-800' :
                                item.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status === 'Served' ? 'Served' :
                                 item.status === 'Cancelled' ? 'Cancelled' :
                                 item.status === 'Ready_to_serve' ? 'Ready' :
                                 item.status === 'Preparing' ? 'Preparing' :
                                 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Only show "Continue serving" button when order is still Serving */}
                    {reservation.order.orderStatus === 'Serving' && (
                      <button
                        onClick={() => handleGoToMenu(reservation)}
                        className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                      >
                        <UtensilsCrossed className="w-4 h-4 mr-2" />
                        Continue serving / Select dishes
                      </button>
                    )}
                    
                    {/* Close Order button - only show when all order items are Served or Cancelled */}
                    {canCompleteOrder(reservation) && reservation.order.orderStatus === 'Serving' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseOrder(reservation);
                        }}
                        disabled={closingOrderId === reservation._id}
                        className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                          closingOrderId === reservation._id
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {closingOrderId === reservation._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Closing order...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Close Order
                          </>
                        )}
                      </button>
                    )}

                    {/* Payment button - only show when order is Completed */}
                    {reservation.order.orderStatus === 'Completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreatePayment(reservation);
                        }}
                        disabled={creatingPaymentId === reservation._id}
                        className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                          creatingPaymentId === reservation._id
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {creatingPaymentId === reservation._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Create Payment
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
