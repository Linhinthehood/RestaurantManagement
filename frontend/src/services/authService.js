const API_BASE_URL = "http://localhost:3000/api/auth";

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

  // Đăng xuất
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
