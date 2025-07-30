const reservationMiddleware = {
  validateReservationInput: (req, res, next) => {
    const data = req.body;
    const isWalkIn = data.isWalkIn === true;

    if (!isWalkIn) {
      const requiredFields = ["customerName", "customerPhone", "customerEmail"];
      for (let fields of requiredFields) {
        if (!data[fields]) {
          return res.status(400).json({
            message: `${fields} is required for non walk-in reservation`,
            success: false,
          });
        }
      }
      
      // Validate phone number format
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(data.customerPhone)) {
        return res.status(400).json({
          message: "Số điện thoại không hợp lệ (phải có 10-11 chữ số)",
          success: false,
        });
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
        message: "Check-in time must be at least 1 hours from now",
        success: false,
      });
    }

    const openHour = 9; // 9 AM
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

  validatePhoneNumber: (req, res, next) => {
    const { phone } = req.params;
    
    if (!phone) {
      return res.status(400).json({
        message: "Số điện thoại là bắt buộc",
        success: false,
      });
    }
    
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ (phải có 10-11 chữ số)",
        success: false,
      });
    }
    
    next();
  },
};
export default reservationMiddleware;
