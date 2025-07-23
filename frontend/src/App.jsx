import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Suspense fallback={<div className="p-4 text-blue-500">Đang tải...</div>}>
      <Outlet />
    </Suspense>
  );
}

export default App;
