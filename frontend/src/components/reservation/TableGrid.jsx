import React from "react";

const TableGrid = ({ table }) => {
  return (
    <>
      <div
        className={`p-4 rounded shadow ${
          table.status === "Available"
            ? "bg-green-500"
            : table.status === "Pending"
            ? "bg-yellow-500"
            : "bg-red-500"
        } text-white text-center`}
      >
        <h3 className="text-lg font-semibold">{table.name}</h3>
        <p className="text-sm">{table.status}</p>
      </div>
    </>
  );
};

export default TableGrid;
