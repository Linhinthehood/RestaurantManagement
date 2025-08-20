import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ReservationPage from "../pages/ReservationPage";
import HistoryPage from "../pages/HistoryPage";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const AppRoutes = () => {
  return (
    <div className="min-h-dvh bg-white text-gray-900">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default AppRoutes;
