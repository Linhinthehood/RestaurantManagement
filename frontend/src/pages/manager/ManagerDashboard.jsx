import React, { useState } from 'react';
import DashboardTab from '../../components/manager/DashboardTab';
import UserManagementTab from '../../components/manager/UserManagementTab';
import MenuManagementTab from '../../components/manager/MenuManagementTab';
import ReservationManagementTab from '../../components/manager/ReservationManagementTab';
import TableManagementTab from '../../components/manager/TableManagementTab';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'menu', label: 'Menu Management', icon: '🍽️' },
    { id: 'reservations', label: 'Reservation Management', icon: '📅' },
    { id: 'tables', label: 'Table Management', icon: '🪑' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UserManagementTab />;
      case 'menu':
        return <MenuManagementTab />;
      case 'reservations':
        return <ReservationManagementTab />;
      case 'tables':
        return <TableManagementTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Restaurant management and analytics</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ManagerDashboard;
