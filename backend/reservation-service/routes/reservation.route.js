import express from "express";
import reservationController from "../controllers/reservation.controller.js";
import reservationMiddleware from "../middlewares/reservation.middleware.js";
import { validateAssignTable } from "../middlewares/validateAssignTable.middleware.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const route = express.Router();

route.post(
  "/",
  // protect, // Thêm middleware xác thực token trước
  // authorize("Manager", "Receptionist", "Waiter"),
  reservationMiddleware.validateReservationInput,
  reservationMiddleware.validateReservationTime,
  reservationController.createReservation
);
route.put(
  "/:id/assign-table",
  // protect,
  validateAssignTable,
  reservationController.assignTable
);
route.put("/:id/unassign-table", reservationController.unassignTable);
route.put(
  "/:id/checkin",
  protect,
  authorize("Manager", "Receptionist", "Waiter"),
  reservationController.checkInReservation
);
route.get(
  "/",
  //  protect,
  reservationController.getAllReservations
);
route.get(
  "/available",
  // protect,
  reservationController.getAvailableTables
);
route.get(
  "/customer/:phone",
  // protect,
  reservationMiddleware.validatePhoneNumber,
  reservationController.getReservationByPhone
);
route.get(
  "/:id/tables",
  protect,
  reservationController.getTablesByReservationId
);
route.get("/:id", protect, reservationController.getReservationById);
route.put("/:id/cancel", protect, reservationController.cancelReservation);

// Route để cập nhật tableStatus khi payment hoàn thành
route.patch(
  "/:id/update-table-status",
  protect,
  authorize("Manager", "Receptionist", "Waiter"),
  reservationController.updateTableStatus
);

export default route;
