import React from "react";
import { useSelector } from "react-redux";

const DashboardHome = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Chào mừng bạn!</h2>
        
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Vai trò:</strong> {user.role}</p>
            <p><strong>Trạng thái:</strong> {user.status}</p>
            <p><strong>Ngày sinh:</strong> {user.dob}</p>
            <p><strong>Số điện thoại:</strong> {user.phoneNumber}</p>
            <p><strong>Giới tính:</strong> {user.gender}</p>
          </div>
        ) : (
          <p className="text-red-600">Không có thông tin người dùng</p>
        )}
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Hướng dẫn sử dụng:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Sử dụng menu bên trái để điều hướng</li>
          <li>Mỗi vai trò sẽ có quyền truy cập khác nhau</li>
          <li>Bạn có thể đăng xuất từ header</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;
