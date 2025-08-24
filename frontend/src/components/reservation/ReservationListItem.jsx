import React from "react";
import { useDrag } from "react-dnd";
import { UserIcon, ClockIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Button, message } from "antd";
import reservationService from "../../services/reservationService";
import { getStatusColorClass } from "../../utils/statusColor";

const ReservationListItem = ({ rsv, onReservationChanged }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "reservation",
    item: {
      id: rsv._id,
      checkInTime: rsv.checkInTime,
      quantity: rsv.quantity,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const handleUnassign = async (tableId) => {
    try {
      const res = await reservationService.unassignTable(rsv._id, tableId);
      message.success(res.data.message);
      if (onReservationChanged) {
        onReservationChanged();
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to unassign table"
      );
      console.error("Failed to unassign table: ", error);
    }
  };
  const handleCheckIn = async () => {
    try {
      const res = await reservationService.checkInReservation(rsv._id);
      const now = new Date();
      const checkInTime = new Date(rsv.checkInTime);
      const lowerBound = new Date(checkInTime.getTime() - 30 * 60 * 1000);
      const upperBound = new Date(checkInTime.getTime() + 30 * 60 * 1000);
      console.log("res", res);
      if (now < lowerBound || now > upperBound) {
        message.error(error.message);
        return;
      }
      message.success(res.message);
      if (onReservationChanged) {
        onReservationChanged();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to check-in");
    }
  };
  const statusClasses = getStatusColorClass(rsv.status);
  console.log("Status:", rsv.status, "Classes:", statusClasses);

  return (
    <div
      ref={dragRef}
      className={`transition-transform duration-200 ${
        isDragging ? "opacity-90 scale-95" : ""
      }`}
    >
      <div
        className={`flex items-center justify-between border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition ${statusClasses.bg}`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <UserIcon className="h-5 w-5 text-blue-500" />
            <span>{rsv.customerId?.name || "Walk-in"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon className="h-4 w-4 text-green-500" />
            <span>
              {rsv.dateStr} - {rsv.timeStr}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <UsersIcon className="h-4 w-4 text-purple-500" />
            <span>{rsv.quantity} people</span>
          </div>
          {rsv.note && (
            <div className="flex items-center gap-2 text-gray-600">
              <UsersIcon className="h-4 w-4 text-purple-500" />
              <span>Note: {rsv.note} </span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-center">
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {rsv.timeStr}
          </div>
          <p className="bg-amber-100 rounded-full px-3 py-1 text-gray-600">
            Tables: {rsv.tables.map((t) => t.name).join(", ")}
          </p>
          <div className="space-y-1">
            {rsv.tables.map((table) => (
              <Button
                key={table._id}
                danger
                onClick={() => handleUnassign(table._id)}
                size="small"
              >
                Unassign {table.name}
              </Button>
            ))}
          </div>
          {rsv.status !== "Arrived" && rsv.status !== "Canceled" && (
            <Button size="small" type="primary" onClick={handleCheckIn}>
              Check-in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationListItem;
