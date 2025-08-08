import React, { useState } from "react";
import TableGrid from "../../components/TableFilter/TableGrid";
import {
  DateFilter,
  MiniCalendar,
  TimeFilter,
} from "../../components/TableFilter";
import { useEffect } from "react";
import axios from "axios";
import ReservationList from "../../components/reservation/ReservationList";

const TableManagementPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(
    "09:00"
    // new Date().toLocaleTimeString([], { hour: "2-digit" }) + ":00"
  );
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reservationRefreshTrigger, setReservationRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchAvailableTables();
  }, [selectedDate, selectedTime]);

  const fetchAvailableTables = async () => {
    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];

      const res = await axios.get(
        "http://localhost:3000/api/v1/reservations/available",
        {
          params: { date: formattedDate, time: selectedTime, quantity: 4 },
        }
      );
      setTables(res.data.tables);
    } catch (error) {
      console.error("Error fetching available tables: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationChanged = () => {
    fetchAvailableTables();
    setReservationRefreshTrigger((prev) => prev + 1);
  };

  return (
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
          <h2 className="text-xl font-bold mb-2">🪑Tables</h2>
          <div className="grid grid-cols-3 gap-4 p-4">
            {isLoading ? (
              <p>Loading Tables ...</p>
            ) : (
              tables.map((table) => (
                <TableGrid
                  key={table._id}
                  table={table}
                  onAssigned={handleReservationChanged}
                />
              ))
            )}
          </div>
        </div>

        <div className="w-1/3 bg-white rounded-xl shadow p-4 overflow-auto">
          <ReservationList
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            refreshTrigger={reservationRefreshTrigger}
            onReservationChanged={handleReservationChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default TableManagementPage;
