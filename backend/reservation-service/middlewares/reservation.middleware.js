const reservationMiddleware = {
  validateReservationInput: (req, res, next) => {
    const data = req.body;
    const isWalkIn = data.isWalkIn === true;

    if (!isWalkIn) {
      const requiredFields = ["customerName", "customerPhone", "customerEmail"];
      for (let field of requiredFields) {
        if (!data[field]) {
          return res.status(400).json({
            message: `${field} is required for non walk-in reservation`,
            success: false,
          });
        }
      }
    }

    if (!data.quantity) {
      return res.status(400).json({
        message: "Quantity is required",
        success: false,
      });
    }

    if (typeof data.quantity !== "number" || data.quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive number",
        success: false,
      });
    }

    if (!data.checkInTime) {
      return res.status(400).json({
        message: "Check-in time is required",
        success: false,
      });
    }

    next();
  },

  validateReservationTime: (req, res, next) => {
    const { checkInTime } = req.body;
    if (!checkInTime) {
      return res.status(400).json({
        message: "Check-in time is required",
        success: false,
      });
    }

    const now = new Date();
    const reservationTime = new Date(checkInTime);
    const diffMinutes = (reservationTime - now) / (1000 * 60); // 1000ms = 1s, 60s = 1 minute

    if (reservationTime < now) {
      return res.status(400).json({
        message: "Check-in time must be in the future",
        success: false,
      });
    }

    if (diffMinutes < 60) {
      return res.status(400).json({
        message: "Check-in time must be at least 1 hour from now",
        success: false,
      });
    }

    const openHour = 6; // 6 AM
    const closeHour = 22; // 10 PM
    const reservationHour = reservationTime.getHours();

    if (reservationHour < openHour || reservationHour >= closeHour) {
      return res.status(400).json({
        message: `Check-in time must be between ${openHour}:00 and ${closeHour}:00`,
        success: false,
      });
    }

    next();
  },

  validateAssignTable: (req, res, next) => {
    const { tableId } = req.body;
    if (!tableId) {
      return res.status(400).json({
        message: "Table ID is required",
        success: false,
      });
    }
    next();
  },

  validateTableId: (req, res, next) => {
    const { tableId } = req.params;
    if (!tableId) {
      return res.status(400).json({
        message: "Table ID is required",
        success: false,
      });
    }
    next();
  },

  validateReservationId: (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Reservation ID is required",
        success: false,
      });
    }
    next();
  },

  validatePhoneNumber: (req, res, next) => {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
        success: false,
      });
    }
    
    // Basic phone number validation (Vietnamese format)
    const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number format",
        success: false,
      });
    }
    
    next();
  }
};

export default reservationMiddleware;
