import React from "react";

const DaySelector = () => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return (
    <div className="flex space-x-4 justify-center bg-gray-100 rounded shadow">
      {days.map((day) => (
        <button
          key={day}
          className="px-4 py-2 bg-white text-black rounded hover:bg-gray-300 cursor-pointer"
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default DaySelector;
