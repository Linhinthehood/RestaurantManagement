import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const API_BASE = `${API_BASE_URL}/v1/reservations`;

export const createReservation = async (data) => {
  const res = await axios.post(`${API_BASE}`, data);
  return res.data;
};

export const getReservationsByPhone = async (phone) => {
  const res = await axios.get(`${API_BASE}/customer/?${phone}`);
  return res.data;
};

export const cancelReservation = async (id) => {
  const res = await axios.patch(`${API_BASE}/${id}/cancel`);
  return res.data;
};
