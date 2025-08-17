import axios from "axios";

const API_BASE = "http://localhost:3002/api/v1/reservations";

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
