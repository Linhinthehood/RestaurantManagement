import React from "react";

const StatusBadge = ({ status = "Pending" }) => {
  const map = {
    Pending: {
      text: "Waiting for confirmation",
      cls: "bg-amber-100 text-amber-800 border-amber-200",
    },
    Confirmed: {
      text: "Confirmed",
      cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    Canceled: {
      text: "Canceled",
      cls: "bg-rose-100 text-rose-800 border-rose-200",
    },
    Arrived: {
      text: "Checked in",
      cls: "bg-sky-100 text-sky-800 border-sky-200",
    },
    Completed: {
      text: "Completed",
      cls: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };
  const cfg = map[status] ?? map.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current/60" />
      {cfg.text}
    </span>
  );
};

export default StatusBadge;
