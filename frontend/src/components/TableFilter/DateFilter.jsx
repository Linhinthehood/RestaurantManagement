import React from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DateFilter = ({ selectedDate, onSelectDate }) => {
  const getNextDays = (numDays, startDate = new Date()) => {
    const nextDays = [];
    for (let i = 0; i < numDays; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + i);
      nextDays.push({
        date: nextDate,
        day: days[nextDate.getDay()],
      });
    }
    return nextDays;
  };

  return (
    <div className="w-2/3 flex space-x-4 justify-between items-center bg-gray-100 rounded shadow overflow-auto">
      {getNextDays(7).map(({ date, day }) => (
        <button
          key={date.toISOString()}
          className={`px-8 py-2 rounded cursor-pointer ${
            selectedDate.toDateString() === date.toDateString()
              ? "bg-blue-500 text-white"
              : "bg-white text-black hover:bg-gray-300"
          }`}
          onClick={() => onSelectDate(date)}
        >
          <div>
            <div className="text-sm font-medium">{day}</div>
            <div className="text-xs">
              {date.getDate()}/{date.getMonth() + 1}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default DateFilter;
