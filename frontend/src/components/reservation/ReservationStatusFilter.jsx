import React from "react";

const statuses = ["All", "Pending", "Arrived", "Completed", "Cancelled"];

const ReservationStatusFilter = ({ currentStatus, onChange }) => {
  return (
    <div className="flex mb-4">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`px-4 py-2 border transition ${
            currentStatus === status
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default ReservationStatusFilter;
