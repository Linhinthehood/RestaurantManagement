import React from "react";

const TableGrid = () => {
  // table have 3 status: available, reserved, occupied
  const tables = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`,
    status: "Available",
  }));
  return (
    <>
      {tables.map((table) => (
        <div
          key={table.id}
          className={`p-4 rounded shadow ${
            table.status === "Available"
              ? "bg-green-500"
              : table.status === "Reserved"
              ? "bg-yellow-500"
              : "bg-red-500"
          } text-white text-center`}
        >
          <h3 className="text-lg font-semibold">{table.name}</h3>
          <p className="text-sm">{table.status}</p>
        </div>
      ))}
    </>
  );
};

export default TableGrid;
