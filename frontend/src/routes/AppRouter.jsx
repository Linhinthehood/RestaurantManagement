import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";

// Layouts
import WaiterLayout from "../layouts/WaiterLayout";
import ChefLayout from "../layouts/ChefLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import CustomerLayout from "../layouts/CustomerLayout";

// Waiter Pages
import ReservationList from "../pages/waiter/ReservationList";
import CheckIn from "../pages/waiter/CheckIn";
import OrderPage from "../pages/waiter/OrderPage";

// Chef Pages
import KitchenDashboard from "../pages/chef/KitchenDashboard";

// Manager Pages
import IngredientCheck from "../pages/manager/IngredientCheck";

// Customer Pages
import ReservationForm from "../pages/customer/ReservationForm";

// Payment Pages
import CheckoutPage from "../pages/payment/CheckoutPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Waiter */}
        <Route path="waiter" element={<WaiterLayout />}>
          <Route path="/waiter/reservations" element={<ReservationList />} />
          <Route path="/waiter/check-in" element={<CheckIn />} />
          <Route path="/waiter/order" element={<OrderPage />} />
        </Route>

        {/* Chef */}
        <Route path="/chef" element={<ChefLayout />}>
          <Route path="/chef/dashboard" element={<KitchenDashboard />} />
        </Route>

        {/* Manager */}
        <Route path="manager" element={<ManagerLayout />}>
          <Route path="/manager/ingredients" element={<IngredientCheck />} />
        </Route>

        {/* Customer */}
        <Route path="customer" element={<CustomerLayout />}>
          <Route path="/customer/reserve" element={<ReservationForm />} />
        </Route>

        {/* Payment */}
        <Route path="/payment/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
