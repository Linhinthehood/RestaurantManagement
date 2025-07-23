import { Outlet, Link } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div>
      <header className="bg-green-600 text-white p-4 flex justify-between">
        <h1 className="font-bold">🍽 Nhà Hàng LeeHuFang</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>
          <Link to="/menu" className="hover:underline">
            Thực đơn
          </Link>
          <Link to="/reserve" className="hover:underline">
            Đặt bàn
          </Link>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
