import { useRoutes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import DashboardHome from "../pages/dashboard/DashboardHome";
import TableManagementPage from "../pages/table-management/TableManagementPage";
import OrderPage from "../pages/orders/OrderPage";
import KitchenPage from "../pages/kitchen/KitchenPage";
import NotFoundPage from "../pages/not-found/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterUserPage from "../pages/manager/RegisterUserPage";
import InventoryPage from "../pages/manager/InventoryPage";
import ReportPage from "../pages/manager/ReportPage";

const AppRoutes = () => {
  // const user = JSON.parse(localStorage.getItem('user'));

  const routes = useRoutes([
    { path: "/login", element: <LoginPage /> },

    {
      path: "/",
      // element: element: user ? <DashboardLayout /> : <Navigate to="/login" />,
      element: <DashboardLayout />,
      children: [
        { path: "", element: <DashboardHome /> },
        { path: "table-management", element: <TableManagementPage /> },
        { path: "orders", element: <OrderPage /> },
        { path: "kitchen", element: <KitchenPage /> },

        // route này là cho manager nhé
        { path: "manager/register", element: <RegisterUserPage /> },
        { path: "manager/inventory", element: <InventoryPage /> },
        { path: "manager/reports", element: <ReportPage /> },
      ],
    },

    { path: "*", element: <NotFoundPage /> },
  ]);

  return routes;
};

export default AppRoutes;
