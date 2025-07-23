import { Outlet, Link } from "react-router-dom";

const WaiterLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-blue-800 text-white p-4 space-y-2">
        <h2 className="text-xl font-bold">Waiter Panel</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/waiter/checkin">Check-in</Link>
          <Link to="/waiter/orders">Gọi món</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default WaiterLayout;
