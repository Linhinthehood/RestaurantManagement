import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { foodService } from "../../services/foodService";
import { paymentService } from "../../services/paymentService";
import { discountService } from "../../services/discountService";
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  Clock,
  Phone,
  Users
} from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const paymentId = query.get('paymentId');
  const orderId = query.get('orderId');
  const reservationId = query.get('reservationId');
  
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    } else if (orderId) {
      fetchOrderDetails();
    }
  }, [paymentId, orderId]);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const res = await discountService.getAll();
        if (res.success) setDiscounts(res.data || []);
      } catch (e) {
        console.error('Failed to load discounts');
      }
    };
    loadDiscounts();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const paymentResponse = await paymentService.getPaymentById(paymentId);
      
      if (paymentResponse.success) {
        const paymentData = paymentResponse.data;
        setPayment(paymentData);
        setPaymentMethod(paymentData.paymentMethod || 'Cash');
        setSelectedDiscountId(paymentData.discountId || null);
        
        // If payment has order data, use it; otherwise fetch separately
        if (paymentData.reservation && paymentData.reservation.order) {
          setOrder(paymentData.reservation.order);
        } else if (orderId) {
          await fetchOrderDetails();
        }
      }
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
      setError('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId);
      
      // Fetch food details for each order item
      if (response.data && response.data.orderItems) {
        const orderWithFoodDetails = {
          ...response.data,
          orderItems: await Promise.all(
            response.data.orderItems.map(async (item) => {
              try {
                const foodResponse = await foodService.getFoodById(item.foodId);
                return {
                  ...item,
                  foodName: foodResponse.data?.name || foodResponse.name || `Food ID: ${item.foodId}`
                };
              } catch (err) {
                console.error('Failed to fetch food details for item:', item._id, err);
                return {
                  ...item,
                  foodName: `Food ID: ${item.foodId}`
                };
              }
            })
          )
        };
        setOrder(orderWithFoodDetails);
      } else {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + 'đ';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Format ISO string without timezone conversion (e.g., 2025-08-19T19:00:00.000Z -> 19/08/2025 • 19:00)
  const formatIsoRawDateTime = (isoString) => {
    if (!isoString || typeof isoString !== 'string') return 'N/A';
    const [datePart, timePartWithZ] = isoString.split('T');
    if (!datePart || !timePartWithZ) return 'N/A';
    const [year, month, day] = datePart.split('-');
    const timePart = timePartWithZ.replace('Z', '').slice(0, 5);
    return `${day}/${month}/${year} • ${timePart}`;
  };

  const calculateTotal = () => {
    if (payment) {
      // Use payment data if available
      const finalAmount = payment.finalAmount?.$numberDecimal ? 
        Number(payment.finalAmount.$numberDecimal) : payment.finalAmount;
      return finalAmount || 0;
    }
    
    if (!order || !order.orderItems) return 0;
    return order.orderItems.reduce((total, item) => {
      const price = item.price?.$numberDecimal ? Number(item.price.$numberDecimal) : item.price;
      return total + price;
    }, 0);
  };

  const getPaymentBreakdown = () => {
    if (!payment) return null;
    
    const originalAmount = payment.originalAmount?.$numberDecimal ? 
      Number(payment.originalAmount.$numberDecimal) : payment.originalAmount;
    const taxAmount = payment.taxAmount || 0;
    const discountAmount = payment.discountAmount || 0;
    const depositAmount = payment.depositAmount || 0;
    const finalAmount = payment.finalAmount?.$numberDecimal ? 
      Number(payment.finalAmount.$numberDecimal) : payment.finalAmount;
    
    return {
      originalAmount,
      taxAmount,
      discountAmount,
      depositAmount,
      finalAmount
    };
  };

  const handleApplyDiscount = async () => {
    if (!payment) return;
    try {
      const res = await paymentService.updatePaymentDiscount(payment._id, selectedDiscountId || null);
      if (res.success) {
        setPayment(res.data);
        setSuccess('Applied discount successfully');
      } else {
        setError(res.message || 'Failed to apply discount');
      }
    } catch (e) {
      setError('Failed to apply discount');
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!payment) {
      setError('Payment information not found');
      return;
    }

    setProcessingPayment(true);
    try {
      // Update payment status to Completed
      const paymentResponse = await paymentService.updatePaymentStatus(payment._id, 'Completed');
      
      if (paymentResponse.success) {
        // Payment completed successfully
        setSuccess('Payment completed successfully!');
        
        // Log success for debugging
        console.log('Payment completed:', paymentResponse);
        
        // Navigate back to orders after delay
        setTimeout(() => {
          navigate('/dashboard/orders');
        }, 1500);
      } else {
        throw new Error(paymentResponse.message || 'Payment update failed');
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBackToOrders = () => {
    navigate('/dashboard/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error || (!order && !payment)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Order or payment information not found'}</p>
          <button
            onClick={handleBackToOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const total = calculateTotal();
  const breakdown = getPaymentBreakdown();
  
  // Get customer info from payment or order
  const customerInfo = payment?.reservation?.customerId || 
                      payment?.customer || 
                      order?.customer;
  const reservationInfo = payment?.reservation || order?.reservation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
          <button 
            onClick={() => setSuccess(null)}
            className="ml-4 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToOrders}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
              <p className="text-gray-600">Complete order and payment</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Order Completed</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Order Details
              </h2>
              
              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{customerInfo?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{customerInfo?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{customerInfo?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Guests:</span>
                    <span className="ml-2 font-medium">{reservationInfo?.quantity || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Handler Info */}
              {payment?.createdByUser && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Payment Handler Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Handler:</span>
                      <span className="ml-2 font-medium">{payment.createdByUser.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <span className="ml-2 font-medium">{payment.createdByUser.role}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Information */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Check-in:</span>
                    <span className="ml-2 font-medium">{formatIsoRawDateTime(reservationInfo?.checkInTime)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completed Time:</span>
                    <span className="ml-2 font-medium">{formatDate(payment?.createdAt || order?.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Food Items</h3>
                <div className="space-y-3">
                  {order.orderItems?.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.foodName || `Food ID: ${item.foodId}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                          {item.note && ` • Note: ${item.note}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatPrice(item.price?.$numberDecimal ? Number(item.price.$numberDecimal) : item.price)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'Served' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'Served' ? 'Served' : item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reservation Details */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reservation Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Check-in:</span>
                    <span className="ml-2 font-medium">{formatIsoRawDateTime(reservationInfo?.checkInTime)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Table:</span>
                    <span className="ml-2 font-medium">
                      {(reservationInfo?.tables || order?.tables)?.map(table => table.name).join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Payment
              </h2>

              {/* Payment Breakdown */}
              {breakdown && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Food Total:</span>
                      <span>{formatPrice(breakdown.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT Tax (10%):</span>
                      <span>+{formatPrice(breakdown.taxAmount)}</span>
                    </div>
                    {breakdown.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-{formatPrice(breakdown.discountAmount)}</span>
                      </div>
                    )}
                    {breakdown.depositAmount > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Deposit:</span>
                        <span>-{formatPrice(breakdown.depositAmount)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total Amount:</span>
                      <span className="text-green-600">{formatPrice(breakdown.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Selector */}
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Discount</h3>
                  <button
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
                <select
                  value={selectedDiscountId || ''}
                  onChange={(e) => setSelectedDiscountId(e.target.value || null)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">No discount</option>
                  {discounts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.discountCode} - {d.discountPercentage}% ({d.usedCount || 0}/{d.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Amount */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(total)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payment ? 'Amount Due' : 'Total Amount'}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash"
                      checked={paymentMethod === 'Cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Momo"
                      checked={paymentMethod === 'Momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Momo</span>
                  </label>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  processingPayment
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Confirm Payment
                  </div>
                )}
              </button>

              {/* Payment Info */}
              <div className="mt-6 pt-4 border-t text-sm text-gray-600">
                {payment && (
                  <>
                    <div className="flex justify-between mb-1">
                      <span>Payment Code:</span>
                      <span className="font-mono">{payment.paymentCode}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Payment Status:</span>
                      <span className={`font-medium ${
                        payment.status === 'Completed' ? 'text-green-600' : 
                        payment.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {payment.status === 'Completed' ? 'Paid' :
                         payment.status === 'Pending' ? 'Pending' : 'Cancelled'}
                      </span>
                    </div>
                    {payment.createdByUser && (
                      <div className="flex justify-between mb-1">
                        <span>Handled By:</span>
                        <span className="font-medium">{payment.createdByUser.name}</span>
                      </div>
                    )}
                  </>
                )}
                {order && (
                  <>
                    <div className="flex justify-between mb-1">
                      <span>Order ID:</span>
                      <span className="font-mono">{order._id?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Created Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Status:</span>
                      <span className="text-green-600 font-medium">Completed</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
