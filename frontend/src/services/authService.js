import { API_BASE_URL as BASE } from "./apiConfig";
const API_BASE_URL = `${BASE}/auth`;

export const authService = {
  // Đăng nhập
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin profile
  async getProfile(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể lấy thông tin profile");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin profile
  async updateProfile(token, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Đổi mật khẩu
  async changePassword(token, passwordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
