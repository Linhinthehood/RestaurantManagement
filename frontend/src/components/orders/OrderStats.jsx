import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign,
  ShoppingCart
} from 'lucide-react';

const OrderStats = ({ orders }) => {
  const stats = React.useMemo(() => {
    const totalOrders = orders.length;
    const servingOrders = orders.filter(order => order.orderStatus === 'Serving').length;
    const completedOrders = orders.filter(order => order.orderStatus === 'Completed').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      servingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue
    };
  }, [orders]);

  const statCards = [
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Đang phục vụ',
      value: stats.servingOrders,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Hoàn thành',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Tổng doanh thu',
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Giá trị TB/đơn',
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(stats.averageOrderValue),
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats; 