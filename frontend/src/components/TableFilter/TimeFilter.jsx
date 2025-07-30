import React from "react";

const TimeFilter = ({ selectedTime, onSelectTime }) => {
  const times = Array.from({ length: 14 }, (_, i) => {
    const hour = 9 + i; // 9 AM to 10 PM
    return `${hour < 10 ? "0" : ""}${hour}:00`;
  });
  return (
    <div className="flex flex-col space-y-4 pr-4">
      {times.map((time) => (
        <button
          key={time}
          className={`p-2 rounded text-sm ${
            selectedTime === time
              ? "bg-blue-500 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
          onClick={() => onSelectTime(time)}
        >
          {time}
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;
