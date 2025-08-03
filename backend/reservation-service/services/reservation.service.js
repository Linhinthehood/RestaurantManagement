import reservationModel from "../models/reservation.model.js";
import tableHistoryModel from "../models/tableHistory.model.js";
import { mockTables } from "../data/mockTables.js";
import customerModel from "../models/customer.model.js";
import mongoose from "mongoose";
import tableServiceApi from "../utils/axiosInstance.js";

const reservationService = {
  createReservation: async (data) => {
    const {
      customerName,
      customerPhone,
      customerEmail,
      quantity,
      checkInTime,
      note,
      isWalkIn,
    } = data;
    let customerId = null;
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

      const checkIn = new Date(checkInTime);
      const fromTime = new Date(checkIn.getTime() - 2 * 60 * 60 * 1000);
      const toTime = new Date(checkIn.getTime() + 2 * 60 * 60 * 1000);

      const existingReservation = await reservationModel.findOne({
        customerId: customer._id,
        checkInTime: { $gte: fromTime, $lte: toTime },
        status: { $ne: "Cancelled" },
      });
      if (existingReservation) {
        throw new Error("Customer already have reservation at this time!");
      }
    }

    const availableTables = await reservationService.getAvailableTables(
      checkInTime,
      quantity
    );

    if (availableTables.length === 0) {
      throw new Error("No available tables at this time");
    }

    data.deposit = quantity >= 6 ? 100000 : 0;

    const reservation = await reservationModel.create({
      customerId,
      quantity,
      checkInTime,
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

  getAllReservations: async () => {
    const reservations = await reservationModel
      .find()
      .populate('customerId', 'name phone email')
      .populate('tableHistory')
      .sort({ checkInTime: 1 });
    // Lấy danh sách tableId duy nhất
    const allTableIds = [
      ...new Set(
        reservations
          .flatMap(r => r.tableHistory.map(th => th.tableId?.toString()))
          .filter(Boolean)
      )
    ];
    // Gọi sang table-service lấy thông tin các bàn
    let tableMap = {};
    if (allTableIds.length > 0) {
      try {
        const resp = await tableServiceApi.get(`/tables?ids=${allTableIds.join(',')}`);
        if (Array.isArray(resp.data.tables)) {
          tableMap = Object.fromEntries(resp.data.tables.map(t => [t._id, t]));
        }
      } catch (e) {
        console.error('Error fetching tables from table-service:', e.message);
      }
    }
    // Gắn thông tin tên bàn vào từng reservation
    const result = reservations.map(r => {
      const tables = r.tableHistory
        .map(th => tableMap[th.tableId?.toString()])
        .filter(Boolean)
        .map(t => ({ _id: t._id, name: t.name }));
      return {
        ...r.toObject(),
        tables
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
      .populate('customerId', 'name phone email')
      .populate('tableHistory');
    
    if (!reservation) return null;

    // Lấy danh sách tableId duy nhất
    const tableIds = [
      ...new Set(reservation.tableHistory.map(th => th.tableId?.toString()).filter(Boolean))
    ];
    
    // Gọi sang table-service lấy thông tin các bàn
    let tableMap = {};
    if (tableIds.length > 0) {
      try {
        const resp = await tableServiceApi.get(`/tables?ids=${tableIds.join(',')}`);
        if (Array.isArray(resp.data.tables)) {
          tableMap = Object.fromEntries(resp.data.tables.map(t => [t._id, t]));
        }
      } catch (e) {
        console.error('Error fetching tables from table-service:', e.message);
      }
    }
    
    // Gắn thông tin tên bàn vào reservation
    const tables = reservation.tableHistory
      .map(th => tableMap[th.tableId?.toString()])
      .filter(Boolean)
      .map(t => ({ _id: t._id, name: t.name }));
    
    const result = {
      ...reservation.toObject(),
      tables
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
      .populate('customerId', 'name phone email')
      .sort({ checkInTime: 1 });
    
    return reservations;
  },

  getAvailableTables: async (checkInTime, quantity) => {
    if (!checkInTime) {
      throw new Error("Invalid check-in time");
    }
    if (!quantity || isNaN(quantity)) {
      throw new Error("Invalid quantity provided");
    }
    const checkIn = new Date(checkInTime);
    const expectedCheckOutTime = new Date(
      checkIn.getTime() + 2 * 60 * 60 * 1000
    );
    const conflictingHistories = await tableHistoryModel.find({
      checkInTime: { $lte: expectedCheckOutTime },
      expectedCheckOutTime: { $gte: checkIn },
      tableStatus: { $in: ["Pending", "Occupied", "Unavailable"] },
    });
    const reservedTables = new Set(
      conflictingHistories.map((h) => h.tableId.toString())
    );
    const response = await tableServiceApi.get("/tables/");
    const allTables = response.data.tables;
    console.log("Available tables:", allTables);
    if (!Array.isArray(allTables)) {
      throw new Error("Invalid table data received from table service");
    }
    const availableTables = allTables.filter(
      (table) =>
        table.capacity >= Number(quantity) &&
        !reservedTables.has(table._id.toString())
    );
    // const availableTables = mockTables.filter(
    //   (table) =>
    //     table.capacity >= Number(quantity) &&
    //     !reservedTables.has(table._id.toString())
    // );
    return availableTables;
  },

  assignTable: async (reservationId, tableId, staffId) => {
    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) throw new Error("Reservation not found");
    const checkInTime = new Date(reservation.checkInTime);
    const expectedCheckOutTime = new Date(
      checkInTime.getTime() + 2 * 60 * 60 * 1000
    );

    const isAlreadyAssigned = await tableHistoryModel.exists({
      tableId: tableId,
      checkInTime: { $lte: expectedCheckOutTime },
      expectedCheckOutTime: { $gte: checkInTime },
      tableStatus: { $in: ["Pending", "Occupied", "Unavailable"] },
    });

    if (isAlreadyAssigned) {
      throw new Error("Table already assigned during this time");
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
    reservation.tableId = tableId;
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
    const reservation = await reservationModel.findById(reservationId).populate('tableHistory');
    if (!reservation) return [];
    // Lấy danh sách tableId từ tableHistory
    const tableIds = reservation.tableHistory.map(th => th.tableId).filter(Boolean);
    return tableIds;
  },
};

export default reservationService;
