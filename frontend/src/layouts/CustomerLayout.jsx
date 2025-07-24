import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const customerLinks = [{ path: "/customer/reserve", label: "Reserve Table" }];

const CustomerLayout = () => {
  return (
    <div className="flex">
      <Sidebar links={customerLinks} />
      <div className="flex-1">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
