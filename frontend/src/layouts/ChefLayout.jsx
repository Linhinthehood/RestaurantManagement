import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const chefLinks = [{ path: "/chef/dashboard", label: "Dashboard" }];

const ChefLayout = () => {
  return (
    <div className="flex">
      <Sidebar links={chefLinks} />
      <div className="flex-1">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ChefLayout;
