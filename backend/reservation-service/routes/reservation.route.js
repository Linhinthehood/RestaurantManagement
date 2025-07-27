import express from "express";
import reservationController from "../controllers/reservation.controller.js";
import reservationMiddleware from "../middlewares/reservation.middleware.js";
import { validateAssignTable } from "../middlewares/validateAssignTable.middleware.js";
import { fakeAuth } from "../middlewares/fakeAuth.middleware.js";

const route = express.Router();

route.post(
  "/",
  reservationMiddleware.validateReservationInput,
  reservationMiddleware.validateReservationTime,
  reservationController.createReservation
);
route.put(
  "/:id/assign-table",
  fakeAuth,
  validateAssignTable,
  reservationController.assignTable
);
route.put("/:id/checkin", reservationController.checkInReservation);
route.get("/today", reservationController.getAllReservations);
route.get("/:id", reservationController.getReservationById);
route.get("/customer/:phone", reservationController.getReservationByPhone);
route.get("/available", reservationController.getAvailableTables);
route.put("/:id/cancel", reservationController.cancelReservation);

export default route;
