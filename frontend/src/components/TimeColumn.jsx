import React from "react";

const TimeColumn = () => {
  // from 09:00 to 22:00, each hour
  const hours = Array.from(
    { length: 14 },
    (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`
  );
  return (
    <div className="flex flex-col space-y-2 pr-4 bg-gray-100 rounded shadow">
      {hours.map((hour) => (
        <div
          key={hour}
          className="text-sm text-center p-2 rounded hover:bg-gray-300 cursor-pointer"
        >
          {hour}
        </div>
      ))}
    </div>
  );
};

export default TimeColumn;
