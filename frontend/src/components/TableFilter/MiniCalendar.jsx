import React from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const MiniCalendar = ({ selectedDate, onSelectDate }) => {
  return (
    <div className="ml-auto">
      <DatePicker
        value={selectedDate ? dayjs(selectedDate) : null}
        onChange={(date) => onSelectDate(date?.toDate())}
        picker="date"
        placeholder="Select day"
        allowClear={false}
        size="small"
        bordered={false}
        className="bg-white shadow rounded px-2 py-1"
      />
    </div>
  );
};

export default MiniCalendar;
