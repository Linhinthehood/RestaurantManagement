import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import RootRoute from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDB();

// Route mẫu
app.get("/", (req, res) => {
  res.json({ message: "Table Service is running!" });
});

app.use("/api/v1", RootRoute);

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Table Service đang chạy tại http://localhost:${PORT}`);
});
