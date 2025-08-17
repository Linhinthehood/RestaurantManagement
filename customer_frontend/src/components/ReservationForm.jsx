import React from "react";

const ReservationForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-serif text-center text-gray-800 mb-6">
          Book a table at the restaurant
        </h2>

        <form className="grid gap-4">
          <input
            type="text"
            placeholder="Full name"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
          />
          <input
            type="tel"
            placeholder="Phone number"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
            />
            <input
              type="time"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
            />
          </div>

          <input
            type="number"
            placeholder="Number of guests"
            min="1"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
          />

          <textarea
            placeholder="Special notes (if any)"
            rows={3}
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-600"
          />

          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 rounded-lg transition"
          >
            Book your table now
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
