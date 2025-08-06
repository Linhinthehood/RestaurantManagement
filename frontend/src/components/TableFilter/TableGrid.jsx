import React from "react";
import { useDrop } from "react-dnd";
import axios from "axios";

const TableGrid = ({ table, onAssigned }) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "reservation",
    drop: async (item) => {
      try {
        await axios.put(
          `http://localhost:3000/api/v1/reservations/${item.id}/assign-table`,
          {
            tableId: table._id,
          }
        );
        onAssigned();
      } catch (error) {
        console.error("Failed to assign table: ", error);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  return (
    <>
      <div
        ref={dropRef}
        className={`p-4 rounded shadow cursor-pointer transition-colors duration-200 ${
          isOver
            ? "bg-blue-600"
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
      </div>
    </>
  );
};

export default TableGrid;
