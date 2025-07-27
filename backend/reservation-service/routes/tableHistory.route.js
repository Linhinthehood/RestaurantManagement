import express from "express";
import tableHistoryController from "../controllers/tableHistory.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Tạo TableHistory thủ công từ tables có sẵn
router.post("/create-from-tables", tableHistoryController.createTableHistoryFromTables);

// CRUD operations
router.get("/", tableHistoryController.getAllTableHistories);
router.get("/table/:tableId", tableHistoryController.getTableHistoryByTableId);
router.get("/reservation/:reservationId", tableHistoryController.getTableHistoryByReservationId);
router.get("/status/:status", tableHistoryController.getTableHistoryByStatus);
router.put("/:id", tableHistoryController.updateTableHistory);
router.delete("/:id", tableHistoryController.deleteTableHistory);

// Tạo TableHistory cho một table cụ thể
router.post("/table/:tableId", tableHistoryController.createTableHistoryForTable);

export default router; 