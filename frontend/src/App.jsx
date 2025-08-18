import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, setToken, setAuthenticated } from "./store/userSlice";
import AppRouter from "./routes/AppRouter";
import LoadingSpinner from "./components/LoadingSpinner";

import "./App.css";

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Khôi phục trạng thái authentication từ localStorage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch(setToken(token));
        dispatch(setUser(userData));
        dispatch(setAuthenticated(true));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(setAuthenticated(false));
      }
    } else {
      dispatch(setAuthenticated(false));
    }

    // Không cần delay, chỉ cần đảm bảo state đã được khôi phục
    setIsInitializing(false);
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Đang khởi tạo hệ thống..." />
      </div>
    );
  }

  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
