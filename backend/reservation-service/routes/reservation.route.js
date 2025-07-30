import express from "express";
import reservationController from "../controllers/reservation.controller.js";
import reservationMiddleware from "../middlewares/reservation.middleware.js";
import { validateAssignTable } from "../middlewares/validateAssignTable.middleware.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const route = express.Router();

route.post(
  "/",
  protect, // Thêm middleware xác thực token trước
  authorize("Manager", "Receptionist"),
  reservationMiddleware.validateReservationInput,
  reservationMiddleware.validateReservationTime,
  reservationController.createReservation
);
route.put(
  "/:id/assign-table",
  protect,
  validateAssignTable,
  reservationController.assignTable
);
route.put("/:id/checkin", protect, reservationController.checkInReservation);
route.get("/today", protect, reservationController.getAllReservations);
route.get("/available", protect, reservationController.getAvailableTables);
route.get("/customer/:phone", protect, reservationMiddleware.validatePhoneNumber, reservationController.getReservationByPhone);
route.get("/:id", protect, reservationController.getReservationById);
route.put("/:id/cancel", protect, reservationController.cancelReservation);

export default route;
