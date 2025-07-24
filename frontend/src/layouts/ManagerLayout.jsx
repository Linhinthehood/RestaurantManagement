import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const managerLinks = [
  { path: "/manager/ingredients", label: "Ingredient Check" },
];

const ManagerLayout = () => {
  return (
    <div className="flex">
      <Sidebar links={managerLinks} />
      <div className="flex-1">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
