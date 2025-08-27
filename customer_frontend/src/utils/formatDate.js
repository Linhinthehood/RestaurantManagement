import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Format date thành dd/mm/yyyy (không đổi múi giờ)
export const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};

// Format time thành HH:mm (không đổi múi giờ)
export const formatTime = (date) => {
  if (!date) return "";
  return dayjs(date).format("HH:mm");
};

// Format date và time thành dd/mm/yyyy • HH:mm (không đổi múi giờ)
export const formatDateTime = (date) => {
  if (!date) return "";
  return dayjs(date).utc().format("DD/MM/YYYY • HH:mm");
};
