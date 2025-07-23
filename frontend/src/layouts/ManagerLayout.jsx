import React from "react";
import { Outlet, Link } from "react-router-dom";

const ManagerLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold">Manager Panel</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/manager/dashboard">Dashboard</Link>
          <Link to="/manager/reservations">Đặt bàn</Link>
          <Link to="/manager/tables">Bàn ăn</Link>
          <Link to="/manager/staffs">Nhân viên</Link>
          <Link to="/manager/statistics">Thống kê</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
