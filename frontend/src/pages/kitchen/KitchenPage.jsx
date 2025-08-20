import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderItems, clearSuccess, clearError } from "../../store/orderSlice";
import KitchenDashboard from "../../components/kitchen/KitchenDashboard";
import OrderItemCard from "../../components/kitchen/OrderItemCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import { Maximize2, Minimize2 } from "lucide-react";

const KitchenPage = () => {
  const dispatch = useDispatch();
  const ordersState = useSelector((state) => {
    return state.order || {};
  });

  const { orderItems = [], loading = false, error = null, success = null } = useMemo(() => {
    const result = {
      orderItems: ordersState.orderItems || [],
      loading: ordersState.loading || false,
      error: ordersState.error || null,
      success: ordersState.success || null
    };
    console.log('KitchenPage - Current state:', { orderItems: result.orderItems.length, loading: result.loading, error: result.error });
    return result;
  }, [ordersState.orderItems, ordersState.loading, ordersState.error, ordersState.success]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Fetch order items on component mount
  useEffect(() => {
    dispatch(fetchOrderItems());
  }, [dispatch]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(fetchOrderItems());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, autoRefresh]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Handle Fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    const isApiFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

    if (!isApiFullscreen && !isFullscreen) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
      else setIsFullscreen(true); // CSS fallback
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      else setIsFullscreen(false); // CSS fallback
    }
  };

  // Filter order items based on selected status and exclude Served and Cancelled items
  const filteredOrderItems = selectedStatus === "all" 
    ? orderItems.filter(item => item.status !== 'Served' && item.status !== 'Cancelled')
    : orderItems.filter(item => item.status === selectedStatus && item.status !== 'Served' && item.status !== 'Cancelled');

  // Sort order items by status priority, then by category priority, then by creation time
  const sortedOrderItems = [...filteredOrderItems].sort((a, b) => {
    // Status priority order: Pending > Preparing > Ready_to_serve > Served > Cancelled
    const statusPriority = {
      Pending: 1,
      Preparing: 2,
      Ready_to_serve: 3,
      Served: 4,
      Cancelled: 5
    };

    // Category priority order: High > Medium > Low
    const categoryPriority = {
      High: 1,
      Medium: 2,
      Low: 3
    };

    // First, sort by status priority
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;

    // If same status, sort by category priority
    const aCategoryPriority = categoryPriority[a.foodId?.categoryId?.priority] || 4; // Default to lowest if no priority
    const bCategoryPriority = categoryPriority[b.foodId?.categoryId?.priority] || 4;
    const categoryDiff = aCategoryPriority - bCategoryPriority;
    if (categoryDiff !== 0) return categoryDiff;

    // If same category priority, sort by creation time (oldest first)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
  };

  const handleRefresh = () => {
    dispatch(fetchOrderItems());
  };

  if (loading && orderItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`p-6 relative ${isFullscreen ? 'fixed inset-0 bg-white z-50 overflow-auto' : ''}`}
    >
      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Management</h1>
          <p className="text-gray-600 mt-2">Manage and track orders in the kitchen</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Auto refresh</span>
          </label>
        </div>
      </div> */}

      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}
      
      {success && (
        <Alert type="success" message={success} className="mb-6" />
      )}

      {/* Dashboard */}
      <KitchenDashboard
        orderItems={orderItems}
        selectedStatus={selectedStatus}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* Order Items Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Order Items ({sortedOrderItems.length})
          </h2>
          {loading && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {sortedOrderItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No order items</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === "all" 
                ? "No order items found. Orders will appear here when customers place them."
                : `No order items with status "${selectedStatus}" found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOrderItems.map((orderItem) => (
              <OrderItemCard key={orderItem._id} orderItem={orderItem} />
            ))}
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};

export default KitchenPage;
