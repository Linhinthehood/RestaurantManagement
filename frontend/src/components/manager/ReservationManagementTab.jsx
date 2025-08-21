import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import reservationService from "../../services/reservationService";
import DateFilterComponent from "./DateFilterComponent";

// Colors for the charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#E3A3B7",
];

const ReservationManagementTab = () => {
  /** ---------------- STATE ---------------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });

  const [reservations, setReservations] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalReservations: 0,
    totalGuests: 0,
    noShowRate: 0,
    trendData: [],
    statusData: [],
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);

  /** ---------------- HELPER ---------------- */
  const getDateRange = (type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = today;
    let endDate = new Date(today);

    switch (type) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        endDate = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case "custom":
        startDate = customDateRange.startDate
          ? new Date(customDateRange.startDate)
          : null;
        endDate = customDateRange.endDate
          ? new Date(customDateRange.endDate)
          : null;
        break;
      default:
        break;
    }
    return { startDate, endDate };
  };

  /** ---------------- API CALLS ---------------- */
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(filterType);

      const apiResponse = await reservationService.getAllReservations({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        status: "All",
      });

      const allReservations = Array.isArray(apiResponse.reservations)
        ? apiResponse.reservations
        : [];

      // ----- Analytics -----
      const totalReservations = allReservations.length;
      const totalGuests = allReservations.reduce(
        (sum, r) => sum + r.quantity,
        0
      );

      const canceled = allReservations.filter((r) => r.status === "Canceled");
      const noShowRate =
        totalReservations > 0 ? (canceled.length / totalReservations) * 100 : 0;

      const trendData = {};
      allReservations.forEach((r) => {
        const checkInTime = new Date(r.checkInTime);
        if (isNaN(checkInTime.getTime())) return;

        const dateKey = checkInTime.toISOString().split("T")[0];
        if (!trendData[dateKey]) {
          trendData[dateKey] = { date: dateKey, count: 0 };
        }
        trendData[dateKey].count++;
      });

      const statusData = {};
      allReservations.forEach((r) => {
        if (!statusData[r.status]) {
          statusData[r.status] = { name: r.status, value: 0 };
        }
        statusData[r.status].value++;
      });

      setAnalytics({
        totalReservations,
        totalGuests,
        noShowRate,
        trendData: Object.values(trendData),
        statusData: Object.values(statusData),
      });

      // ----- Pagination -----
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      setReservations(allReservations.slice(startIndex, endIndex));

      setPagination((prev) => ({
        ...prev,
        total: allReservations.length,
        totalPages: Math.ceil(allReservations.length / prev.limit),
      }));
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Failed to load reservation data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationDetails = async (id) => {
    setLoading(true);
    try {
      const apiResponse = await reservationService.getReservationById(id);
      const res = apiResponse.reservation;

      if (!res) {
        console.error("Error: Incomplete reservation data.");
        setError("Incomplete reservation data.");
        return;
      }

      setSelectedReservation(res);
      // No need to call setAvailableTables here
    } catch (err) {
      console.error("Error fetching reservation details:", err);
      setError("Failed to load reservation details");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- HANDLERS ---------------- */
  const handleCancelReservation = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?"))
      return;
    setLoading(true);
    try {
      await reservationService.cancelReservation(id);
      alert("Reservation canceled successfully!");
      fetchReservations();
    } catch (err) {
      alert("Cancellation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    setLoading(true);
    try {
      await reservationService.checkInReservation(id);
      alert("Check-in successful!");
      fetchReservations();
    } catch (err) {
      alert("Check-in failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTable = async (tableId) => {
    if (!selectedReservation) return;
    try {
      await reservationService.assignTable(selectedReservation._id, tableId);
      alert("Table assigned successfully!");
      await fetchReservationDetails(selectedReservation._id);
    } catch (err) {
      alert("Table assignment failed: " + err.message);
    }
  };

  const handleOpenDetails = (id) => {
    setIsDetailsOpen(true);
    fetchReservationDetails(id);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedReservation(null);
    setAvailableTables([]);
    fetchReservations();
  };

  /** ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchReservations();
  }, [filterType, pagination.page, pagination.limit]);

  /** ---------------- RENDER ---------------- */
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Reservation Management
      </h1>

      {/* Time Filter */}
      <DateFilterComponent
        filterType={filterType}
        setFilterType={setFilterType}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        onApplyFilter={() => fetchReservations()}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Reservations", value: analytics.totalReservations },
          { title: "Total Guests", value: analytics.totalGuests },
          {
            title: "Completion Rate",
            value: `${(100 - analytics.noShowRate).toFixed(2)}%`,
          },
          {
            title: "Cancellation Rate",
            value: `${analytics.noShowRate.toFixed(2)}%`,
          },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Reservation Trends
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#3B82F6"
                name="Number of Reservations"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* PieChart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {analytics.statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-xl shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Reservation List
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["ID", "Customer", "Guests", "Time", "Status", "Actions"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((res) => (
                <tr key={res._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {res._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {res.customerId?.name || "Walk-in"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {res.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(res.checkInTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        res.status === "Arrived"
                          ? "bg-green-100 text-green-800"
                          : res.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : res.status === "Canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleOpenDetails(res._id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      View
                    </button>
                    {res.status === "Pending" && (
                      <button
                        onClick={() => handleCancelReservation(res._id)}
                        className="text-red-600 hover:text-red-900 mr-2"
                      >
                        Cancel
                      </button>
                    )}
                    {res.status === "Pending" &&
                      res.tableHistory.length > 0 && (
                        <button
                          onClick={() => handleCheckIn(res._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Check-in
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Reservation Details</h3>
            {selectedReservation ? (
              <div className="space-y-3">
                <p>
                  <strong>ID:</strong> {selectedReservation._id}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedReservation.customerId?.name || "Walk-in"}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(selectedReservation.checkInTime).toLocaleString()}
                </p>
                <p>
                  <strong>Guests:</strong> {selectedReservation.quantity}
                </p>
                <p>
                  <strong>Assigned Table:</strong>{" "}
                  {(selectedReservation.tables || [])
                    .map((t) => t.name)
                    .join(", ") || "Not Assigned"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedReservation.status}
                </p>
                <p>
                  <strong>Note:</strong> {selectedReservation.note || "None"}
                </p>

                {/* Assign Table */}
                {selectedReservation.status === "Pending" &&
                  selectedReservation.tableHistory.length === 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Assign Table</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableTables
                          .filter((t) => t.status === "Available")
                          .map((table) => (
                            <button
                              key={table._id}
                              className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
                              onClick={() => handleAssignTable(table._id)}
                            >
                              {table.name} ({table.capacity})
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <p>Loading details...</p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagementTab;
