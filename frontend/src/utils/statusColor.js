export const STATUS_COLORS = {
  Pending: {
    text: "text-amber-600",
    bg: "bg-amber-100",
  },
  Arrived: {
    text: "text-green-600",
    bg: "bg-green-100",
  },
  Canceled: {
    text: "text-red-600",
    bg: "bg-red-100",
  },
  Completed: {
    text: "text-blue-600",
    bg: "bg-blue-100",
  },
};

export function getStatusColorClass(status) {
  return STATUS_COLORS[status] || {};
}
