import { Outlet, Link } from "react-router-dom";

const ChefLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-red-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold">Chef Panel</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/chef/orders">Đơn bếp</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default ChefLayout;
