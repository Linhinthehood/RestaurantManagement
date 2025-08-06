import React, { useState, useEffect } from "react";
import axios from "axios";
import ReservationListItem from "./ReservationListItem";

const ReservationList = ({ selectedDate, selectedTime }) => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const formattedTime = selectedTime;
      const res = await axios.get("http://localhost:3000/api/v1/reservations", {
        params: { date: formattedDate, time: formattedTime },
      });
      setReservations(res.data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedDate, selectedTime]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        📋 Reservation List
      </h2>

      {isLoading ? (
        <p className="text-gray-500">Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-500">No reservations found.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((rsv) => (
            <div key={rsv._id}>
              <ReservationListItem key={rsv._id} rsv={rsv} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationList;
