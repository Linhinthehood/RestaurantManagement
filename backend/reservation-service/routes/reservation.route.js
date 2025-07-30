import express from "express";
import reservationController from "../controllers/reservation.controller.js";
import reservationMiddleware from "../middlewares/reservation.middleware.js";
import { validateAssignTable } from "../middlewares/validateAssignTable.middleware.js";

const route = express.Router();

route.post(
  "/",
  authorize("Manager", "Receptionist"),
  reservationMiddleware.validateReservationInput,
  reservationMiddleware.validateReservationTime,
  reservationController.createReservation
);
route.put(
  "/:id/assign-table",
  validateAssignTable,
  reservationController.assignTable
);
route.put("/:id/checkin", reservationController.checkInReservation);
route.get("/today", reservationController.getAllReservations);
route.get("/available", reservationController.getAvailableTables);
route.get("/customer/:phone", reservationMiddleware.validatePhoneNumber, reservationController.getReservationByPhone);
route.get("/:id", reservationController.getReservationById);
route.put("/:id/cancel", reservationController.cancelReservation);

export default route;
