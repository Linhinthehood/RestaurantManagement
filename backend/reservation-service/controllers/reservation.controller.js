import reservationService from "../services/reservation.service.js";

const reservationController = {
  createReservation: async (req, res) => {
    try {
      const data = req.body;

      const reservation = await reservationService.createReservation(data);
      res.status(201).json({
        message: "Reservation created successfully",
        reservation: reservation,
        success: true,
      });
    } catch (error) {
      console.error("Error creating reservation: ", error);
      if (error.message === "Customer already have reservation at this time!") {
        return res.status(404).json({
          message: error.message,
          success: false,
        });
      }
      if (error.message === "No available tables at this time") {
        return res.status(404).json({
          message: error.message,
          success: false,
        });
      }
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },

  assignTable: async (req, res) => {
    try {
      const { id } = req.params;
      const { tableId } = req.body;
      const updatedReservation = await reservationService.assignTable(
        id,
        tableId
      );
      res.status(200).json({
        message: "Table assigned successfully",
        reservation: updatedReservation,
        success: true,
      });
    } catch (error) {
      console.error("Error assigning table: ", error);

      if (error.message === "Table already assigned during this time") {
        return res.status(400).json({
          message: error.message,
          success: false,
        });
      }
      if (error.message === "Reservation not found") {
        return res.status(404).json({
          message: error.message,
          success: false,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  unassignTable: async (req, res) => {
    try {
      const { id } = req.params;
      await reservationService.unassignTable(id);
      res
        .status(200)
        .json({ message: "Table unassigned successfully", success: true });
    } catch (error) {
      console.error("Error unassign table: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  checkInReservation: async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await reservationService.checkInReservation(id);
      if (!updated) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }
      res.status(200).json({
        message: "Reservation checked in successfully",
        reservation: updated,
        success: true,
      });
    } catch (error) {
      console.error("Error checking in reservation: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  getAllReservations: async (req, res) => {
    const { date } = req.query;
    try {
      const reservations = await reservationService.getAllReservations({
        dateStr: date,
      });
      res.status(200).json({
        message: "Reservations fetched successfully",
        reservations: reservations,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching reservations: ", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },

  getReservationById: async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(id);
      if (!reservation) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }
      res.status(200).json({
        message: "Reservation fetched successfully",
        reservation: reservation,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching reservation by ID: ", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },

  getReservationByPhone: async (req, res) => {
    try {
      const { phone } = req.params;
      const reservations = await reservationService.getReservationByPhone(
        phone
      );
      if (!reservations || reservations.length === 0) {
        return res.status(404).json({
          message: `Không tìm thấy reservation nào cho số điện thoại ${phone}`,
          success: false,
        });
      }
      res.status(200).json({
        message: `Tìm thấy ${reservations.length} reservation(s) cho số điện thoại ${phone}`,
        reservations: reservations,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching reservation by phone: ", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },

  getAvailableTables: async (req, res) => {
    try {
      const { date, time, quantity } = req.query;
      const tables = await reservationService.getAvailableTables(
        date,
        time,
        quantity
      );
      res.status(200).json({
        message: "Available tables fetched successfully",
        tables: tables,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching available tables: ", error);
      if (error.message === "Invalid check-in time") {
        return res.status(404).json({
          message: error.message,
          success: false,
        });
      }
      if (error.message === "Invalid quantity provided") {
        return res.status(404).json({
          message: error.message,
          success: false,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  cancelReservation: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await reservationService.cancelReservation(id);
      if (!result) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }
      res.status(200).json({
        message: "Reservation deleted successfully",
        reservation: result,
        success: true,
      });
    } catch (error) {
      console.error("Error deleting reservation: ", error);
      if (error.message === "Reservation not found") {
        return res.status(404).json({
          message: error.message,
          success: false,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  getTablesByReservationId: async (req, res) => {
    try {
      const { id } = req.params;
      const tables = await reservationService.getTablesByReservationId(id);
      res.status(200).json({ tables });
    } catch (error) {
      console.error("Error fetching tables by reservation:", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },
};

export default reservationController;
