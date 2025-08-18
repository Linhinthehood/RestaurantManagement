import { useRoutes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFoundPage from "../pages/not-found/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import ProfilePage from "../pages/dashboard/ProfilePage"; // Import ProfilePage
import { roleConfig } from "../config/roleConfig";

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
  const { user } = useSelector((state) => state.user);
  const role = user?.role; // Không convert về lowercase nữa
  const allowedRoutes = roleConfig[role] || [];

  const routes = useRoutes([
    {
      path: "/login",
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      ),
    },
    { path: "/", element: <Navigate to="/dashboard" replace /> },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        // Default route - redirect to first available route
        { path: "", element: <Navigate to={allowedRoutes[0]?.path || "/dashboard/orders"} replace /> },
        // Profile route
        { path: "profile", element: <ProfilePage /> },
        // Other routes from roleConfig
        ...allowedRoutes.map((r) => ({
          path: r.path.replace("/dashboard/", ""),
          element: r.element,
        })),
        { path: "*", element: <Navigate to={allowedRoutes[0]?.path || "/dashboard/orders"} replace /> },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ]);

  return routes;
};

export default AppRouter;
