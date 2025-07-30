import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

const ReservationList = ({ filterStatus }) => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const url =
        filterStatus === "all"
          ? "http://localhost:3002/api/v1/reservations"
          : `http://localhost:3002/api/v1/reservations?status=${filterStatus}`;
      const res = await axios.get(url);
      console.log("Fetched reservations:", res.data.reservations);
      setReservations(res.data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatus]);

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Reservations</h2>
      {isLoading ? (
        <p className="text-gray-500">Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-500">No reservations found.</p>
      ) : (
        reservations.map((c) => (
          <div key={c._id} className="border p-2 mb-2 rounded">
            <div>{c.customerId.name}</div>
            <div className="text-sm text-gray-400">{c.time}</div>
            <div className="text-xs italic text-yellow-400">{c.status}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReservationList;
