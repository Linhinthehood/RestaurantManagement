import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) return <Navigate to="/unauthorized" />;

  return children;
};

export default PrivateRoute;
