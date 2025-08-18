import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import axios from "axios";
import { message } from "antd";

const TableGrid = ({ table, onAssigned, selectedDate, selectedTime }) => {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "reservation",
    canDrop: (item, monitor) => {
      const reservationTime = new Date(item.checkInTime);
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      slotTime.setUTCHours(hours);
      slotTime.setUTCMinutes(minutes);
      const hasCapacity = (Number(table.capacity) || 0) >= item.quantity;

      const isAvailable =
        table.status === "Available" || table.status === "Pending";

      const now = new Date();
      const isPastCheckIn = now > reservationTime;

      return hasCapacity && isAvailable && !isPastCheckIn;
    },
    drop: async (item, monitor) => {
      if (!monitor.canDrop()) {
        console.log("Wrong time or table capacity mismatch");
        message.error(
          "Cannot assign table: Wrong time, not enough capacity, or past check-in time."
        );
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
        <p className="text-sm font-bold text-start">
          {table.assignedReservation?.customerName}
        </p>
        <h3 className="text-lg font-semibold">{table.name}</h3>
        <p className="text-sm">{table.status}</p>
        <p className="text-sm">{table.capacity} Slots</p>
      </div>
    </>
  );
};

export default TableGrid;
