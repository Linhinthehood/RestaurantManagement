import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const waiterLinks = [
  { path: "/waiter/assign-table", label: "Reservations" },
  { path: "/waiter/order", label: "Order" },
];

const WaiterLayout = () => {
  return (
    <div className="flex">
      <Sidebar links={waiterLinks} />
      <div className="flex-1">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WaiterLayout;
