import reservationModel from "../models/reservation.model.js";
import tableHistoryModel from "../models/tableHistory.model.js";
import customerModel from "../models/customer.model.js";
import mongoose from "mongoose";
import { tableServiceApi, paymentServiceApi } from "../utils/axiosInstance.js";
import parseDateTime from "../utils/formatDateTime.js";

const reservationService = {
  createReservation: async (data) => {
    const {
      customerName,
      customerPhone,
      customerEmail,
      quantity,
      dateStr,
      timeStr,
      note,
      isWalkIn,
    } = data;
    let customerId = null;
    const checkIn = parseDateTime(dateStr, timeStr);
    if (!isWalkIn) {
      let customer = await customerModel.findOne({
        phone: customerPhone,
        email: customerEmail,
      });
      if (!customer) {
        customer = await customerModel.create({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        });
      }

      customerId = customer._id;

      const fromTime = new Date(checkIn.getTime() - 2 * 60 * 60 * 1000);
      const toTime = new Date(checkIn.getTime() + 2 * 60 * 60 * 1000);

      const existingReservation = await reservationModel.findOne({
        customerId: customer._id,
        checkInTime: { $gte: fromTime, $lte: toTime },
        status: { $ne: "Canceled" },
      });
      if (existingReservation) {
        throw new Error("Customer already have reservation at this time!");
      }
    }

    const availableTables = await reservationService.getAvailableTables(
      dateStr,
      timeStr,
      quantity,
      true
    );

    if (availableTables.length === 0) {
      throw new Error("No available tables at this time!");
    }

    data.deposit = quantity >= 6 ? 100000 : 0;

    const reservation = await reservationModel.create({
      customerId,
      quantity,
      checkInTime: checkIn,
      note: note || "",
      isWalkIn: isWalkIn === true,
      deposit: data.deposit,
      statusHistory: [
        {
          status: "Pending",
          changeAt: new Date(),
        },
      ],
    });

    return reservation;
  },

  getAllReservations: async ({ dateStr, startDate, endDate, status }) => {
    console.log("Received status:", status);
    const filter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Đặt giờ phút giây của endDate về cuối ngày để bao gồm cả ngày đó
      end.setHours(23, 59, 59, 999);
      filter.checkInTime = {
        $gte: start,
        $lte: end,
      };
    }
    // Giữ nguyên logic cũ: Lọc theo một ngày (dateStr)
    else if (dateStr) {
      const date = new Date(dateStr);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      filter.checkInTime = {
        $gte: date,
        $lt: nextDay,
      };
    }

    let reservations = [];
    if (status === "Completed") {
      try {
        const resp = await paymentServiceApi.get(
          `?status=Completed&filterType=custom&startDate=${dateStr}&endDate=${dateStr}`
        );
        console.log("Response from payment service:", resp.data);
        const reservationIds = resp.data.payments.map((p) => p.reservationId);
        console.log("Mapped reservation IDs:", reservationIds);
        reservations = await reservationModel
          .find({
            ...filter,
            _id: { $in: reservationIds },
          })
          .populate("customerId", "name phone email")
          .populate("tableHistory")
          .sort({ checkInTime: 1 });
      } catch (error) {
        console.error("Error fetching completed reservtions: ", error.message);
        return [];
      }
    } else {
      if (status && status !== "All") {
        filter.status = status;
      }

      reservations = await reservationModel
        .find(filter)
        .populate("customerId", "name phone email")
        .populate("tableHistory")
        .sort({ checkInTime: 1 });
    }

    // Lấy danh sách tableId duy nhất
    const allTableIds = [
      ...new Set(
        reservations
          .flatMap((r) => r.tableHistory.map((th) => th.tableId?.toString()))
          .filter(Boolean)
      ),
    ];
    // Gọi sang table-service lấy thông tin các bàn
    let tableMap = {};
    if (allTableIds.length > 0) {
      try {
        const resp = await tableServiceApi.get(
          `/tables?ids=${allTableIds.join(",")}`
        );
        if (Array.isArray(resp.data.tables)) {
          tableMap = Object.fromEntries(
            resp.data.tables.map((t) => [t._id, t])
          );
        }
      } catch (e) {
        console.error("Error fetching tables from table-service:", e.message);
      }
    }
    // Gắn thông tin tên bàn vào từng reservation
    const result = reservations.map((r) => {
      const tables = r.tableHistory
        .map((th) => tableMap[th.tableId?.toString()])
        .filter(Boolean)
        .map((t) => ({ _id: t._id, name: t.name }));
      const checkInDate = new Date(r.checkInTime);
      const date = checkInDate.toISOString().split("T")[0];
      const time = checkInDate.toTimeString().split(" ")[0].slice(0, 5);
      return {
        ...r.toObject(),
        tables,
        dateStr: date,
        timeStr: time,
      };
    });
    return result;
  },

  getReservationById: async (id) => {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const reservation = await reservationModel
      .findById(id)
      .populate("customerId", "name phone email")
      .populate("tableHistory");

    if (!reservation) return null;

    // Lấy danh sách tableId duy nhất
    const tableIds = [
      ...new Set(
        reservation.tableHistory
          .map((th) => th.tableId?.toString())
          .filter(Boolean)
      ),
    ];

    // Gọi sang table-service lấy thông tin các bàn
    let tableMap = {};
    if (tableIds.length > 0) {
      try {
        const resp = await tableServiceApi.get(
          `/tables?ids=${tableIds.join(",")}`
        );
        if (Array.isArray(resp.data.tables)) {
          tableMap = Object.fromEntries(
            resp.data.tables.map((t) => [t._id, t])
          );
        }
      } catch (e) {
        console.error("Error fetching tables from table-service:", e.message);
      }
    }

    const tables = reservation.tableHistory
      .map((th) => tableMap[th.tableId?.toString()])
      .filter(Boolean)
      .map((t) => ({ _id: t._id, name: t.name }));

    const result = {
      ...reservation.toObject(),
      tables,
    };

    return result;
  },

  getReservationByPhone: async (phone) => {
    // First find customer by phone
    const customer = await customerModel.findOne({ phone: phone });

    if (!customer) {
      return [];
    }

    // Then find reservations by customerId
    const reservations = await reservationModel
      .find({ customerId: customer._id })
      .populate("customerId", "name phone email")
      .sort({ checkInTime: 1 });

    return reservations;
  },

  getAvailableTables: async (dateStr, timeStr) => {
    if (!dateStr || !timeStr) {
      throw new Error("Date and time are required");
    }
    const checkIn = parseDateTime(dateStr, timeStr);
    const expectedCheckOutTime = new Date(
      checkIn.getTime() + 2 * 60 * 60 * 1000
    );
    const conflictingHistories = await tableHistoryModel
      .find({
        checkInTime: { $lte: expectedCheckOutTime },
        expectedCheckOutTime: { $gte: checkIn },
        tableStatus: { $in: ["Occupied", "Pending", "Unavailable"] },
      })
      .select("tableId tableStatus reservationId");

    const reservationIds = conflictingHistories
      .map((h) => h.reservationId)
      .filter(Boolean);

    const reservationsWithCustomer = await reservationModel
      .find({
        _id: { $in: reservationIds },
      })
      .populate("customerId");

    const reservationMap = new Map();
    reservationsWithCustomer.forEach((r) => {
      const history = conflictingHistories.find((h) =>
        h.reservationId.equals(r._id)
      );
      if (history) {
        conflictingHistories.forEach((h) => {
          reservationMap.set(h.tableId.toString(), {
            reservationId: r._id,
            customerName: r.customerId?.name || "Walk-in Customer",
          });
        });
      }
    });

    const tableStatusMap = new Map();
    conflictingHistories.forEach((h) => {
      tableStatusMap.set(h.tableId.toString(), h.tableStatus);
    });
    const response = await tableServiceApi.get("/tables/");
    const allTables = response.data.tables;
    if (!Array.isArray(allTables)) {
      throw new Error("Invalid table data received from table service");
    }

    const tablesWithStatus = allTables.map((table) => {
      const status = tableStatusMap.get(table._id.toString()) || "Available";
      const assignedReservation = reservationMap.get(table._id.toString());
      return {
        ...table,
        status,
        assignedReservation: assignedReservation || null,
      };
    });

    return tablesWithStatus;
  },

  assignTable: async (reservationId, tableId, staffId) => {
    const reservation = await reservationModel
      .findById(reservationId)
      .populate("tableHistory");
    if (!reservation) throw new Error("Reservation not found");
    const checkInTime = new Date(reservation.checkInTime);
    const now = new Date();

    if (now > checkInTime) {
      throw new Error(
        "Cannot assign table to a reservation that is past its check-in time."
      );
    }

    const expectedCheckOutTime = new Date(
      checkInTime.getTime() + 2 * 60 * 60 * 1000
    );

    // Gọi sang table-service để lấy thông tin bàn
    let tableInfo = null;
    try {
      const res = await tableServiceApi.get(`/tables/${tableId}`);
      tableInfo = res.data.table;
      console.log("TableInfo: ", tableInfo);
    } catch (e) {
      console.error("Error fetching table info:", e.message);
      throw new Error("Cannot fetch table info");
    }

    if (tableInfo.capacity < reservation.quantity) {
      throw new Error(
        `Table capacity (${tableInfo.capacity}) is not enough for this reservation (${reservation.quantity} people).`
      );
    }

    const isAlreadyAssigned = await tableHistoryModel.exists({
      tableId: tableId,
      checkInTime: { $lt: expectedCheckOutTime },
      expectedCheckOutTime: { $gt: checkInTime },
      tableStatus: { $in: ["Pending", "Occupied", "Unavailable"] },
    });

    if (isAlreadyAssigned) {
      throw new Error("Table already assigned during this time");
    }

    const isTableAlreadyInReservation = reservation.tableHistory.some(
      (h) => h.tableId._id.toString() === tableId.toString()
    );

    if (isTableAlreadyInReservation) {
      throw new Error(
        `Table ${tableInfo.name} already assigned to this reservation`
      );
    }

    const historyData = {
      reservationId: reservation._id,
      tableId,
      checkInTime,
      expectedCheckOutTime,
      assignedTime: new Date(),
      tableStatus: "Pending",
    };
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      historyData.assignedBy = staffId;
    }
    const history = await tableHistoryModel.create(historyData);
    reservation.tableHistory.push(history._id);
    await reservation.save();
    return {
      ...reservation.toObject(),
      newTable: tableInfo, // Trả về thông tin bàn
    };
  },

  unassignTable: async (reservationId) => {
    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const activeHistory = await tableHistoryModel.findOneAndDelete({
      reservationId,
      tableStatus: { $in: ["Pending", "Available", "Occupied"] },
    });

    if (!activeHistory) {
      console.log(
        `[Unassign] No pending assignment for reservation ${reservationId}`
      );
      throw new Error("No active table assignment found");
    }

    reservation.tableHistory = reservation.tableHistory.filter(
      (id) => id.toString() !== activeHistory._id.toString()
    );

    await reservation.save();
    return reservation;
  },

  cancelReservation: async (id) => {
    const reservation = await reservationModel.findByIdAndUpdate(
      id,
      {
        status: "Canceled",
        $push: {
          statusHistory: {
            status: "Canceled",
            changeAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    await tableHistoryModel.updateMany(
      { reservationId: reservation._id },
      { tableStatus: "Available" }
    );
    return reservation;
  },

  checkInReservation: async (reservationId) => {
    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }
    const isAssignReservation = await reservationModel
      .findById(reservationId)
      .populate("tableHistory");
    if (!isAssignReservation) {
      throw new Error("Reservation didn't assigned");
    }
    const now = new Date();
    const nowVietnamEquivalent = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const checkInTime = new Date(reservation.checkInTime);
    const lowerBound = new Date(checkInTime.getTime() - 30 * 60 * 1000);
    const upperBound = new Date(checkInTime.getTime() + 30 * 60 * 1000);

    if (
      nowVietnamEquivalent < lowerBound ||
      nowVietnamEquivalent > upperBound
    ) {
      throw new Error(
        "Check-in is only allowed within 30 minutes before or after the reservation time."
      );
    }
    (reservation.status = "Arrived"),
      reservation.statusHistory.push({
        status: "Arrived",
        changeAt: new Date(),
      });
    await reservation.save();

    await tableHistoryModel.updateMany(
      { reservationId: reservation._id },
      { tableStatus: "Occupied" }
    );
    return reservation;
  },

  getTablesByReservationId: async (reservationId) => {
    // Lấy reservation và tableHistory (không populate tableId vì không có model Table)
    const reservation = await reservationModel
      .findById(reservationId)
      .populate("tableHistory");
    if (!reservation) return [];
    // Lấy danh sách tableId từ tableHistory
    const tableIds = reservation.tableHistory
      .map((th) => th.tableId)
      .filter(Boolean);
    return tableIds;
  },

  // Cập nhật tableStatus khi payment hoàn thành
  updateTableStatus: async (reservationId, tableStatus) => {
    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // Tìm tableHistory active (có tableStatus là Pending hoặc Occupied)
    const activeHistory = await tableHistoryModel.findOne({
      reservationId,
      tableStatus: { $in: ["Pending", "Occupied"] },
    });

    if (!activeHistory) {
      throw new Error("No active table assignment found");
    }

    // Cập nhật tableStatus
    activeHistory.tableStatus = tableStatus;
    await activeHistory.save();

    return {
      reservation: reservation,
      updatedTableHistory: activeHistory,
    };
  },
};

export default reservationService;
