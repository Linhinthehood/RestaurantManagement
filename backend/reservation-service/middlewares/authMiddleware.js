import axios from "axios";

// User service URL
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL;

// Helper function để gọi API đến user service
const verifyTokenWithUserService = async (token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 5000, // 5 seconds timeout
    });

    return {
      success: true,
      user: response.data.data.user,
    };
  } catch (error) {
    console.error("Error verifying token with user service:", error.message);

    if (error.response) {
      // User service trả về lỗi
      return {
        success: false,
        message: error.response.data.message || "Token không hợp lệ",
      };
    } else if (error.code === "ECONNREFUSED") {
      // Không thể kết nối đến user service
      return {
        success: false,
        message: "Không thể kết nối đến user service",
      };
    } else {
      // Lỗi khác
      return {
        success: false,
        message: "Lỗi xác thực token",
      };
    }
  }
};

// Middleware xác thực - yêu cầu token hợp lệ
export const protect = async (req, res, next) => {
  let token;

  try {
    // Kiểm tra token trong headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token, truy cập bị từ chối!",
      });
    }

    // Xác thực token với user service
    const verificationResult = await verifyTokenWithUserService(token);

    if (!verificationResult.success) {
      return res.status(401).json({
        success: false,
        message: verificationResult.message,
      });
    }

    // Kiểm tra trạng thái user
    if (verificationResult.user.status === "Inactive") {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị khóa!",
      });
    }

    // Thêm user vào request object
    req.user = verificationResult.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server trong quá trình xác thực!",
    });
  }
};

// Middleware phân quyền - kiểm tra role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập!",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò [${req.user.role}] không được phép truy cập tài nguyên này.`,
      });
    }

    next();
  };
};

// Middleware xác thực tùy chọn - không yêu cầu token nhưng thêm user nếu có
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const verificationResult = await verifyTokenWithUserService(token);

      if (
        verificationResult.success &&
        verificationResult.user.status === "Active"
      ) {
        req.user = verificationResult.user;
      }
    }

    next();
  } catch (error) {
    // Tiếp tục mà không cần xác thực nếu token không hợp lệ
    next();
  }
};

// Middleware kiểm tra quyền quản lý đặt bàn (Manager, Receptionist)
export const requireReservationManagement = (req, res, next) => {
  return authorize("Manager", "Receptionist")(req, res, next);
};

// Middleware kiểm tra quyền xem đặt bàn (tất cả role)
export const requireReservationAccess = (req, res, next) => {
  return authorize("Manager", "Receptionist", "Waiter", "Chef")(req, res, next);
};

// Middleware kiểm tra quyền xử lý đặt bàn (Receptionist, Manager, Waiter)
export const requireReservationProcessing = (req, res, next) => {
  return authorize("Receptionist", "Manager", "Waiter")(req, res, next);
};
