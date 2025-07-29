import React from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DateFilter = ({ selectedDate, onSelectedDate }) => {
  const today = new Date();

  const getNextDays = (numDays) => {
    const nextDays = [];
    for (let i = 0; i < numDays; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      nextDays.push({
        date: nextDate,
        day: days[nextDate.getDay()],
      });
    }
    return nextDays;
  };

  return (
    <div className="flex space-x-4 justify-center bg-gray-100 rounded shadow">
      {getNextDays(7).map(({ date, day }) => (
        <button
          key={date.toISOString()}
          className={`px-4 py-2 rounded cursor-pointer ${
            selectedDate.toDateString() === date.toDateString()
              ? "bg-blue-500 text-white"
              : "bg-white text-black hover:bg-gray-300"
          }`}
          onClick={() => onSelectedDate(date)}
        >
          {day} {date.getDate()}
        </button>
      ))}
    </div>
  );
};

export default DateFilter;
