import axios from "axios";

const API_BASE = "http://localhost:3002/api/v1";

export const createReservation = async (data) => {
  const res = await axios.post(`${API_BASE}/reservations`, data);
  return res.data;
};

export const getReservationsByPhone = async (phone) => {
  const res = await axios.get(`${API_BASE}/reservations?phone=${phone}`);
  return res.data;
};

export const cancelReservation = async (id) => {
  const res = await axios.patch(`${API_BASE}/reservations/${id}/cancel`);
  return res.data;
};
