import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
