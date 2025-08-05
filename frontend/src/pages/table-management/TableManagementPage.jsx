import React, { useState } from "react";
import TableGrid from "../../components/reservation/TableGrid";
import {
  DateFilter,
  MiniCalendar,
  TimeFilter,
} from "../../components/TableFilter";
import { useEffect } from "react";
import axios from "axios";

const TableManagementPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(
    "09:00"
    // new Date().toLocaleTimeString([], { hour: "2-digit" }) + ":00"
  );
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAvailableTables();
  }, [selectedDate, selectedTime]);

  const fetchAvailableTables = async () => {
    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const formattedTime = selectedTime;

      const res = await axios.get(
        "http://localhost:3000/api/v1/reservations/available",
        {
          params: { date: formattedDate, time: formattedTime, quantity: 4 },
        }
      );
      setTables(res.data.tables);

      console.log("Available tables: ", res.data);
    } catch (error) {
      console.error("Error fetching available tables: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const assignStatusToTables = (tables, histories) => {
  //   return tables.map((table) => {
  //     const history = histories.find((h) => h.tableId === table._id);
  //     let status = "Available";
  //     if (history) {
  //       status = history.status;
  //     }
  //     return { ...table, status };
  //   });
  // };

  // const [filterStatus, setFilterStatus] = useState("pending");
  return (
    // <div className="flex flex-col p-4">
    //   <DaySelector />

    //   <div className="flex mt-4 gap-2">
    //     {/* Time Column */}
    //     <TimeColumn />

    //     {/* Table Grid */}
    //     <div className="flex-1 grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded shadow">
    //       <TableGrid />
    //     </div>

    //     {/* Right: Filter + Reservation List */}
    //     <div className=" bg-gray-100 p-4 rounded shadow">
    //       <FilterPanel
    //         currentFilter={filterStatus}
    //         onFilterChange={setFilterStatus}
    //       />
    //       <ReservationList filterStatus={filterStatus} />
    //     </div>
    //   </div>
    // </div>
    <div className="p-4">
      <div className="flex items-center gap-4 bg-white px-4 py-2">
        <DateFilter
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <MiniCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>
      <div className="flex mt-4">
        <TimeFilter
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />
        <div className="flex-1 bg-gray-100 rounded-xl shadow p-4">
          <h2 className="text-xl font-bold mb-2">Tables</h2>
          <div className="grid grid-cols-3 gap-4 p-4">
            {/* Sau này map qua danh sách bàn */}
            {isLoading ? (
              <p>Loading Tables ...</p>
            ) : (
              tables.map((table) => <TableGrid key={table._id} table={table} />)
            )}
          </div>
        </div>

        {/* Bên phải: Danh sách đặt bàn */}
        <div className="w-1/3 bg-white rounded-xl shadow p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-2">Đặt bàn hôm nay</h2>
          <ul className="space-y-3">
            {/* Sau này map qua danh sách đặt bàn */}
            <li className="bg-gray-100 p-3 rounded">
              Khách: Long - 19:00 - 4 người
            </li>
            <li className="bg-gray-100 p-3 rounded">
              Khách: Hà - 19:30 - 2 người
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TableManagementPage;
