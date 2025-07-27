import express from "express";
import reservationController from "../controllers/reservation.controller.js";
import reservationMiddleware from "../middlewares/reservation.middleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post(
  "/",
  reservationMiddleware.validateReservationInput,
  reservationMiddleware.validateReservationTime,
  reservationController.createReservation
);

router.get("/available", reservationController.getAvailableTables);

router.get("/customer/:phone", 
  reservationMiddleware.validatePhoneNumber,
  reservationController.getReservationByPhone
);

// Protected routes - require authentication
router.use(protect);

router.get("/today", reservationController.getAllReservations);

router.put(
  "/:id/assign-table",
  reservationMiddleware.validateReservationId,
  reservationMiddleware.validateAssignTable,
  reservationController.assignTable
);

router.put("/:id/checkin", 
  reservationMiddleware.validateReservationId,
  reservationController.checkInReservation
);

router.put("/:id/cancel", 
  reservationMiddleware.validateReservationId,
  reservationController.cancelReservation
);

export default router;
