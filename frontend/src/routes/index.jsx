import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
// import PrivateRoute from "./PrivateRoute";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import PublicLayout from "../layouts/PublicLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import WaiterLayout from "../layouts/WaiterLayout";
import ChefLayout from "../layouts/ChefLayout";

// Lazy loaded pages
const LoginPage = lazy(() => import("../pages/Login/LoginPage"));
const HomePage = lazy(() => import("../pages/Home/HomePage"));
const OnlineReservationPage = lazy(() =>
  import("../pages/Reservation/OnlineReservationPage")
);
const MenuPage = lazy(() => import("../pages/Menu/MenuPage"));

// Manager
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const ReservationListPage = lazy(() =>
  import("../pages/Reservation/ReservationListPage")
);
const TableManagementPage = lazy(() =>
  import("../pages/Table/TableManagementPage")
);
const StaffManagementPage = lazy(() =>
  import("../pages/Staff/StaffManagementPage")
);
const StatisticsPage = lazy(() => import("../pages/Statistics/StatisticsPage"));

// Waiter
const CheckinPage = lazy(() => import("../pages/Waiter/CheckinPage"));
const WaiterOrderPage = lazy(() => import("../pages/Waiter/WaiterOrderPage"));
const PaymentPage = lazy(() => import("../pages/Waiter/PaymentPage"));

// Chef
const KitchenOrderListPage = lazy(() =>
  import("../pages/Chef/KitchenOrderListPage")
);

// 404
const NotFound = () => <div className="p-4 text-red-500">404 - Not Found</div>;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "menu", element: <MenuPage /> },
      { path: "reserve", element: <OnlineReservationPage /> },
    ],
  },
  {
    path: "/manager",
    element: (
      // <PrivateRoute role="manager">
      <ManagerLayout />
      // </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "reservations", element: <ReservationListPage /> },
      { path: "tables", element: <TableManagementPage /> },
      { path: "staffs", element: <StaffManagementPage /> },
      { path: "statistics", element: <StatisticsPage /> },
    ],
  },
  {
    path: "/waiter",
    element: (
      // <PrivateRoute role="waiter">
      <WaiterLayout />
      // </PrivateRoute>
    ),
    children: [
      { path: "checkin", element: <CheckinPage /> },
      { path: "orders", element: <WaiterOrderPage /> },
      { path: "payment/:tableId", element: <PaymentPage /> },
    ],
  },
  {
    path: "/chef",
    element: (
      // <PrivateRoute role="chef">
      <ChefLayout />
      // </PrivateRoute>
    ),
    children: [{ path: "orders", element: <KitchenOrderListPage /> }],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
