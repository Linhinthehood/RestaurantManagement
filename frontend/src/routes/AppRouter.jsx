import { useRoutes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "../layouts/DashboardLayout";

import DashboardHome from "../pages/dashboard/DashboardHome";
import TableManagementPage from "../pages/table-management/TableManagementPage";
import OrderPage from "../pages/orders/OrderPage";
import KitchenPage from "../pages/kitchen/KitchenPage";
import MenuPage from "../pages/menu/MenuPage";
import PaymentPage from "../pages/payment/PaymentPage";
import NotFoundPage from "../pages/not-found/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterUserPage from "../pages/manager/RegisterUserPage";
import InventoryPage from "../pages/manager/InventoryPage";
import ReportPage from "../pages/manager/ReportPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  const routes = useRoutes([
    { 
      path: "/login", 
      element: <PublicRoute><LoginPage /></PublicRoute> 
    },

    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },

    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardHome /> },
        { path: "table-management", element: <TableManagementPage /> },
        { path: "orders", element: <OrderPage /> },
        { path: "kitchen", element: <KitchenPage /> },
        { path: "menu", element: <MenuPage /> },
        { path: "payment", element: <PaymentPage /> },

        // route này là cho manager nhé
        { path: "manager/register", element: <RegisterUserPage /> },
        { path: "manager/inventory", element: <InventoryPage /> },
        { path: "manager/reports", element: <ReportPage /> },
        
        // Catch-all route cho dashboard
        { path: "*", element: <Navigate to="/dashboard" replace /> },
      ],
    },

    { path: "*", element: <NotFoundPage /> },
  ]);

  return routes;
};

export default AppRouter;
