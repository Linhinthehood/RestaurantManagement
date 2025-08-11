import DashboardHome from "../pages/dashboard/DashboardHome";
import TableManagementPage from "../pages/table-management/TableManagementPage";
import OrderPage from "../pages/orders/OrderPage";
import KitchenPage from "../pages/kitchen/KitchenPage";
import MenuPage from "../pages/menu/MenuPage";
import RegisterUserPage from "../pages/manager/RegisterUserPage";
import InventoryPage from "../pages/manager/InventoryPage";
import ReportPage from "../pages/manager/ReportPage";
import CRUDPage from "../pages/manager/CRUD";

export const roleConfig = {
  manager: [
    { label: "Dashboard", path: "/dashboard", element: <DashboardHome /> },
    { label: "Menu", path: "/dashboard/menu", element: <MenuPage /> },
    {
      label: "Register User",
      path: "/dashboard/manager/register",
      element: <RegisterUserPage />,
    },
    {
      label: "Inventory",
      path: "/dashboard/manager/inventory",
      element: <InventoryPage />,
    },
    {
      label: "Reports",
      path: "/dashboard/manager/reports",
      element: <ReportPage />,
    },
    {
      label: "CRUD",
      path: "/dashboard/manager/crud",
      element: <CRUDPage />,
    },
  ],
  waiter: [
    { label: "Dashboard", path: "/dashboard", element: <DashboardHome /> },
    {
      label: "Table Management",
      path: "/dashboard/table-management",
      element: <TableManagementPage />,
    },
    { label: "Orders", path: "/dashboard/orders", element: <OrderPage /> },
    { label: "Menu", path: "/dashboard/menu", element: <MenuPage /> },
  ],
  chef: [
    { label: "Dashboard", path: "/dashboard", element: <DashboardHome /> },
    { label: "Kitchen", path: "/dashboard/kitchen", element: <KitchenPage /> },
  ],
  receptionist: [
    { label: "Dashboard", path: "/dashboard", element: <DashboardHome /> },
    {
      label: "Table Management",
      path: "/dashboard/table-management",
      element: <TableManagementPage />,
    },
    { label: "Orders", path: "/dashboard/orders", element: <OrderPage /> },
  ],
};
