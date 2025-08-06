import React from "react";
import { useDrag } from "react-dnd";
import { UserIcon, ClockIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Button } from "antd";
import axios from "axios";

const ReservationListItem = ({ rsv }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "reservation",
    item: { id: rsv._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const handleUnassign = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/reservations/${rsv._id}/unassign-table`
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to unassign table: ", error);
    }
  };

  return (
    <div
      ref={dragRef}
      className={`transition-transform duration-200 ${
        isDragging ? "opacity-90 scale-95" : ""
      }`}
    >
      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <UserIcon className="h-5 w-5 text-blue-500" />
            <span>{rsv.customerId.name}</span>
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
        </div>

        <div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {rsv.timeStr}
          </div>
          <div className="mt-4">
            {rsv.tableHistory && (
              <Button danger onClick={handleUnassign} size="small">
                Hủy gán bàn
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationListItem;
