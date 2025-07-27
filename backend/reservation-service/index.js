import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import reservationRoutes from "./routes/reservation.route.js";
import customerRoutes from "./routes/customer.route.js";
import tableHistoryRoutes from "./routes/tableHistory.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDB();

// Route mẫu
app.get("/", (req, res) => {
  res.json({ message: "Reservation Service is running!" });
});

// API Routes
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/table-histories", tableHistoryRoutes);

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Reservation Service đang chạy tại http://localhost:${PORT}`);
});
