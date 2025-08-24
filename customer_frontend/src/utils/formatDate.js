import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Chuyển UTC -> giờ VN (Asia/Ho_Chi_Minh)
export const toLocalTime = (utcDate) => {
  if (!utcDate) return null;
  return dayjs(utcDate).tz("Asia/Ho_Chi_Minh");
};
