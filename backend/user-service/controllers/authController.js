import User from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Helper function để tạo JWT token
const generateToken = (userId, name, role) => {
  return jwt.sign(
    {
      id: userId,
      name,
      role,
      nonce: crypto.randomBytes(16).toString("hex"), // Thêm random string để token luôn khác nhau
    },
    process.env.JWT_SECRET_KEY || "default-secret-key-for-development",
    { expiresIn: process.env.JWT_EXPIRE_TIME || "7d" }
  );
};

// Helper function để format response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data }),
  };
  return res.status(statusCode).json(response);
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, password, email, phoneNumber, gender, role, dob } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return sendResponse(
        res,
        400,
        false,
        existingUser.email === email
          ? "Email đã được sử dụng"
          : "Số điện thoại đã được sử dụng"
      );
    }

    // Create new user
    const newUser = await User.create({
      name,
      password,
      email,
      phoneNumber,
      gender,
      role,
      dob: dob ? new Date(dob) : undefined,
    });

    // Generate token
    const token = generateToken(newUser._id, newUser.name, newUser.role);

    sendResponse(res, 201, true, "Đăng ký thành công", {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        gender: newUser.gender,
        role: newUser.role,
        status: newUser.status,
        dob: newUser.dob,
        age: newUser.age,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return sendResponse(res, 400, false, "Dữ liệu không hợp lệ", { errors });
    }

    sendResponse(res, 500, false, "Lỗi server trong quá trình đăng ký");
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, "Vui lòng nhập email và mật khẩu");
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return sendResponse(res, 401, false, "Email hoặc mật khẩu không đúng");
    }

    // Check if user is active
    if (user.status === "Inactive") {
      return sendResponse(res, 401, false, "Tài khoản đã bị khóa");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, "Email hoặc mật khẩu không đúng");
    }

    // Generate token
    const token = generateToken(user._id, user.name, user.role);

    sendResponse(res, 200, true, "Đăng nhập thành công", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        role: user.role,
        status: user.status,
        dob: user.dob,
        age: user.age,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse(res, 500, false, "Lỗi server trong quá trình đăng nhập");
  }
};

// Get current user profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendResponse(res, 404, false, "Người dùng không tồn tại");
    }

    sendResponse(res, 200, true, "Lấy thông tin profile thành công", { user });
  } catch (error) {
    console.error("Get profile error:", error);
    sendResponse(res, 500, false, "Lỗi server khi lấy thông tin profile");
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, gender, dob } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = new Date(dob);

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return sendResponse(res, 404, false, "Người dùng không tồn tại");
    }

    sendResponse(res, 200, true, "Cập nhật profile thành công", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return sendResponse(res, 400, false, "Dữ liệu không hợp lệ", { errors });
    }

    sendResponse(res, 500, false, "Lỗi server khi cập nhật profile");
  }
};

// Get all users (Manager only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    sendResponse(res, 200, true, "Lấy danh sách người dùng thành công", {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        usersPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    sendResponse(res, 500, false, "Lỗi server khi lấy danh sách người dùng");
  }
};

// Get user by ID (Manager only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return sendResponse(res, 404, false, "Người dùng không tồn tại");
    }

    sendResponse(res, 200, true, "Lấy thông tin người dùng thành công", {
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    sendResponse(res, 500, false, "Lỗi server khi lấy thông tin người dùng");
  }
};

// Update user (Manager only)
const updateUser = async (req, res) => {
  try {
    const { name, phoneNumber, gender, role, status, dob } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (gender) updateData.gender = gender;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (dob) updateData.dob = new Date(dob);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return sendResponse(res, 404, false, "Người dùng không tồn tại");
    }

    sendResponse(res, 200, true, "Cập nhật người dùng thành công", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return sendResponse(res, 400, false, "Dữ liệu không hợp lệ", { errors });
    }

    sendResponse(res, 500, false, "Lỗi server khi cập nhật người dùng");
  }
};

// Delete user (Manager only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendResponse(res, 404, false, "Người dùng không tồn tại");
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user.id) {
      return sendResponse(
        res,
        400,
        false,
        "Không thể xóa tài khoản của chính mình"
      );
    }

    await User.findByIdAndDelete(req.params.id);

    sendResponse(res, 200, true, "Xóa người dùng thành công");
  } catch (error) {
    console.error("Delete user error:", error);
    sendResponse(res, 500, false, "Lỗi server khi xóa người dùng");
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(
        res,
        400,
        false,
        "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới"
      );
    }

    if (newPassword.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Mật khẩu mới phải có ít nhất 6 ký tự"
      );
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return sendResponse(res, 404, false, "Người dùng không tồn tại");
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendResponse(res, 400, false, "Mật khẩu hiện tại không đúng");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, true, "Đổi mật khẩu thành công");
  } catch (error) {
    console.error("Change password error:", error);
    sendResponse(res, 500, false, "Lỗi server khi đổi mật khẩu");
  }
};

const AuthController = {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
};

export default AuthController;
