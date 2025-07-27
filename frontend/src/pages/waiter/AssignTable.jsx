import React, { useState } from "react";
import DaySelector from "../../components/DaySelector";
import TimeColumn from "../../components/TimeColumn";
import TableGrid from "../../components/TableGrid";
import FilterPanel from "../../components/FilterPanel";
import ReservationList from "../../components/ReservationList";

const AssignTable = () => {
  const [filterStatus, setFilterStatus] = useState("pending");
  return (
    <div className="flex flex-col p-4">
      <DaySelector />

      <div className="flex mt-4 gap-2">
        {/* Time Column */}
        <TimeColumn />

        {/* Table Grid */}
        <div className="flex-1 grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded shadow">
          <TableGrid />
        </div>

        {/* Right: Filter + Reservation List */}
        <div className=" bg-gray-100 p-4 rounded shadow">
          <FilterPanel
            currentFilter={filterStatus}
            onFilterChange={setFilterStatus}
          />
          <ReservationList filterStatus={filterStatus} />
        </div>
      </div>
    </div>
  );
};

export default AssignTable;
