import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import axios from "axios";
import { message } from "antd";

const TableGrid = ({ table, onAssigned, selectedDate, selectedTime }) => {
  const [reservation, setReservation] = useState(null);
  useEffect(() => {
    const fetchReservation = async () => {
      if (table.reservationId) {
        try {
          const res = await axios.get(
            `http://localhost:3000/api/v1/reservations/${table.reservationId}`
          );
          setReservation(res.data.reservation);
        } catch (error) {
          console.error("Failed to fetch reservation:", error);
        }
      }
    };
    fetchReservation();
  }, [table.reservationId]);

  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "reservation",
    canDrop: (item, monitor) => {
      const reservationTime = new Date(item.checkInTime);
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      slotTime.setUTCHours(hours);
      slotTime.setUTCMinutes(minutes);

      return (
        reservationTime.getUTCHours() === slotTime.getUTCHours() &&
        reservationTime.getUTCMinutes() === slotTime.getUTCMinutes()
      );
    },
    drop: async (item, monitor) => {
      if (!monitor.canDrop()) {
        console.log("Cannot drop: Wrong time slot");
        return;
      }
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      slotTime.setUTCHours(hours);
      slotTime.setUTCMinutes(minutes);
      try {
        const res = await axios.put(
          `http://localhost:3000/api/v1/reservations/${item.id}/assign-table`,
          {
            tableId: table._id,
            checkInTime: slotTime,
          },
          { headers: { "Cache-Control": "no-cache" } }
        );
        message.success(res.data.message || "Table assigned successfully!");
        onAssigned();
      } catch (error) {
        message.error(
          error.response?.data?.message || "Failed to assign table"
        );
        console.error("Failed to assign table: ", error);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  return (
    <>
      <div
        ref={dropRef}
        className={`p-4 rounded shadow cursor-pointer transition-colors duration-200 ${
          isOver && canDrop
            ? "bg-blue-600"
            : isOver && !canDrop
            ? "bg-gray-400"
            : table.status === "Available"
            ? "bg-green-500"
            : table.status === "Pending"
            ? "bg-yellow-500"
            : "bg-red-500"
        } text-white text-center`}
      >
        <h3 className="text-lg font-semibold">{table.name}</h3>
        <p className="text-sm">{table.status}</p>
        <p className="text-sm">{table.capacity} Slots</p>
        {reservation && (
          <div className="mt-2 text-sm bg-gray-200 text-gray-800 p-2 rounded">
            <p>Customer: {reservation.customerId.name}</p>
            <p>Time: {reservation.timeStr}</p>
            <p>Quantity: {reservation.quantity} people</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TableGrid;
