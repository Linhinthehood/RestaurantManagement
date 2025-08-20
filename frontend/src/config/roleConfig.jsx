import TableManagementPage from "../pages/table-management/TableManagementPage";
import OrderPage from "../pages/orders/OrderPage";
import KitchenPage from "../pages/kitchen/KitchenPage";
import MenuPage from "../pages/menu/MenuPage";
import PaymentPage from "../pages/payment/PaymentPage";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import CRUDPage from "../pages/manager/CRUD";

export const roleConfig = {
  Manager: [
    { label: "Manager Dashboard", path: "/dashboard/manager", element: <ManagerDashboard /> },
    { label: "Assign Table", path: "/dashboard/table-management", element: <TableManagementPage /> },
    { label: "Orders", path: "/dashboard/orders", element: <OrderPage /> },
    { label: "Kitchen", path: "/dashboard/kitchen", element: <KitchenPage /> },
    // Menu và Payment pages sẽ được truy cập qua orderId/reservationId, không hiển thị trong sidebar
    { label: "", path: "/dashboard/menu", element: <MenuPage /> },
    { label: "", path: "/dashboard/payment", element: <PaymentPage /> },
  ],
  Waiter: [
    { label: "Orders", path: "/dashboard/orders", element: <OrderPage /> },
    // Menu, Payment sẽ được truy cập qua orderId/reservationId, không hiển thị trong sidebar
    { label: "", path: "/dashboard/menu", element: <MenuPage /> },
    { label: "", path: "/dashboard/payment", element: <PaymentPage /> },
  ],
  Chef: [
    { label: "Kitchen", path: "/dashboard/kitchen", element: <KitchenPage /> },
  ],
  Receptionist: [
    {
      label: "Assign Table",
      path: "/dashboard/table-management",
      element: <TableManagementPage />,
    },
    // Menu, Orders và Payment sẽ được truy cập qua orderId/reservationId, không hiển thị trong sidebar
    { label: "", path: "/dashboard/menu", element: <MenuPage /> },
    { label: "", path: "/dashboard/orders", element: <OrderPage /> },
    { label: "", path: "/dashboard/payment", element: <PaymentPage /> },
  ],
};
