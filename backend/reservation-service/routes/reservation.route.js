import express from "express";
import reservationController from "../controllers/reservation.controller.js";
import reservationMiddleware from "../middlewares/reservation.middleware.js";
import { validateAssignTable } from "../middlewares/validateAssignTable.middleware.js";
import { fakeAuth } from "../middlewares/fakeAuth.middleware.js";
import { authorize } from "../middlewares/authMiddleware.js";

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
  fakeAuth,
  authorize("Manager", "Receptionist", "Waiter"),
  validateAssignTable,
  reservationController.assignTable
);
route.put(
  "/:id/checkin",
  authorize("Manager", "Receptionist", "Waiter"),
  reservationController.checkInReservation
);
route.get(
  "/",
  authorize("Manager", "Receptionist", "Waiter", "Chef"),
  reservationController.getAllReservations
);
route.get(
  "/customer/:phone",
  authorize("Manager", "Receptionist", "Waiter", "Chef"),
  reservationController.getReservationByPhone
);
route.get(
  "/available",
  authorize("Manager", "Receptionist", "Waiter", "Chef"),
  reservationController.getAvailableTables
);
route.put(
  "/:id/cancel",
  authorize("Manager", "Receptionist"),
  reservationController.cancelReservation
);

export default route;
