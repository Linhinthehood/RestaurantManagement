import axios from "axios";
import { API_BASE_URL as BASE } from "./apiConfig";
const API_BASE_URL = `${BASE}/v1`;

const reservationAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

reservationAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

reservationAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const reservationService = {
  createReservation: async (data) => {
    const response = await reservationAPI.post("/reservations", data);
    return response.data;
  },
  getReservations: async () => {
    const response = await reservationAPI.get("/reservations");
    return response.data;
  },
  checkInReservation: async (id) => {
    console.log("ID của reservation:", id);
    const response = await reservationAPI.put(
      `/reservations/${id}/checkin`,
      {}
    );
    return response.data;
  },
};

export default reservationService;
