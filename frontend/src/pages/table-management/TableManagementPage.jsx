import React, { useState } from "react";
import TableGrid from "../../components/TableFilter/TableGrid";
import {
  DateFilter,
  MiniCalendar,
  TimeFilter,
} from "../../components/TableFilter";
import { useEffect } from "react";
import ReservationList from "../../components/reservation/ReservationList";
import reservationService from "../../services/reservationService";

const TableManagementPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(
    "09:00"
    // new Date().toLocaleTimeString([], { hour: "2-digit" }) + ":00"
  );
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reservationRefreshTrigger, setReservationRefreshTrigger] = useState(0);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchAvailableTables();
    fetchReservations();
  }, [selectedDate, selectedTime, reservationRefreshTrigger, filterStatus]);

  const fetchAvailableTables = async () => {
    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const res = await reservationService.getAvailableTables(
        formattedDate,
        selectedTime
      );
      setTables(res.tables);
    } catch (error) {
      console.error("Error fetching available tables: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const params = { date: formattedDate, status: filterStatus };
      const res = await reservationService.getAllReservations(params);
      setReservations(res.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationChanged = async () => {
    setReservationRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-4 bg-white px-4">
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
        <div className="h-[500px] overflow-y-auto pr-2 custom-scroll">
          <TimeFilter
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
          />
        </div>
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
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onAssigned={handleReservationChanged}
                />
              ))
            )}
          </div>
        </div>

        <div className="w-2/5 bg-white rounded-xl shadow p-4 overflow-auto">
          <ReservationList
            reservations={reservations}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onReservationChanged={handleReservationChanged}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default TableManagementPage;
