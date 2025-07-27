import reservationModel from "../models/reservation.model.js";
import tableHistoryModel from "../models/tableHistory.model.js";
import customerController from "./customer.controller.js";
import { tableService, userService } from "../services/externalService.js";
import mongoose from "mongoose";

const reservationController = {
  createReservation: async (req, res) => {
    try {
      const data = req.body;
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
        // Sử dụng customer controller để tìm hoặc tạo customer
        const customer = await customerController.findOrCreateCustomer({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        });
        
        customerId = customer._id;

        const checkIn = new Date(checkInTime);
        const fromTime = new Date(checkIn.getTime() - 2 * 60 * 60 * 1000);
        const toTime = new Date(checkIn.getTime() + 2 * 60 * 60 * 1000);

        const existingReservation = await reservationModel.findOne({
          customerId: customerId,
          checkInTime: { $gte: fromTime, $lte: toTime },
          status: { $ne: "Cancelled" },
        });
        if (existingReservation) {
          return res.status(400).json({
            message: "Customer already have reservation at this time!",
            success: false,
          });
        }
      }

      // Check available tables through table service
      const checkIn = new Date(checkInTime);
      const expectedCheckOutTime = new Date(
        checkIn.getTime() + 2 * 60 * 60 * 1000
      );

      try {
        const availableTablesResponse = await tableService.getAvailableTables(
          quantity,
          checkIn.toISOString(),
          expectedCheckOutTime.toISOString()
        );

        if (!availableTablesResponse.data || availableTablesResponse.data.length === 0) {
          return res.status(400).json({
            message: "No available tables at this time",
            success: false,
          });
        }
      } catch (error) {
        // Fallback to local table availability check
        const conflictingHistories = await tableHistoryModel.find({
          checkInTime: { $lte: expectedCheckOutTime },
          expectedCheckOutTime: { $gte: checkIn },
          tableStatus: { $in: ["Pending", "Occupied", "Unavailable"] },
        });
        
        if (conflictingHistories.length > 0) {
          return res.status(400).json({
            message: "No available tables at this time",
            success: false,
          });
        }
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

      res.status(201).json({
        message: "Reservation created successfully",
        reservation: reservation,
        success: true,
      });
    } catch (error) {
      console.error("Error creating reservation: ", error);
      res.status(500).json({ 
        message: "Internal server error", 
        success: false 
      });
    }
  },

  assignTable: async (req, res) => {
    try {
      const { id } = req.params;
      const { tableId } = req.body;
      const staffId = req.user?.id;
      
      const reservation = await reservationModel.findById(id);
      if (!reservation) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }
      
      const checkInTime = new Date(reservation.checkInTime);
      const expectedCheckOutTime = new Date(
        checkInTime.getTime() + 2 * 60 * 60 * 1000
      );

      // Check table availability through table service
      try {
        await tableService.checkTableAvailability(
          tableId,
          checkInTime.toISOString(),
          expectedCheckOutTime.toISOString()
        );
      } catch (error) {
        return res.status(400).json({
          message: "Table already assigned during this time",
          success: false,
        });
      }

      // Assign table through table service
      try {
        await tableService.assignTable(
          tableId,
          reservation._id.toString(),
          checkInTime.toISOString(),
          expectedCheckOutTime.toISOString(),
          staffId
        );
      } catch (error) {
        return res.status(400).json({
          message: "Failed to assign table",
          success: false,
        });
      }

      // Update local reservation record
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
      
      res.status(200).json({
        message: "Table assigned successfully",
        reservation: reservation,
        success: true,
      });
    } catch (error) {
      console.error("Error assigning table: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  checkInReservation: async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await reservationModel.findById(id);
      if (!reservation) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }
      
      reservation.status = "Arrived";
      reservation.statusHistory.push({
        status: "Arrived",
        changeAt: new Date(),
      });
      await reservation.save();

      // Update table status through table service if table is assigned
      if (reservation.tableId) {
        try {
          await tableService.assignTable(
            reservation.tableId,
            reservation._id.toString(),
            new Date(reservation.checkInTime).toISOString(),
            new Date(new Date(reservation.checkInTime).getTime() + 2 * 60 * 60 * 1000).toISOString(),
            req.user?.id
          );
        } catch (error) {
          console.error("Error updating table status:", error);
        }
      }

      await tableHistoryModel.updateMany(
        { reservationId: reservation._id },
        { tableStatus: "Occupied" }
      );
      
      res.status(200).json({
        message: "Reservation checked in successfully",
        reservation: reservation,
        success: true,
      });
    } catch (error) {
      console.error("Error checking in reservation: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  getAllReservations: async (req, res) => {
    try {
      const reservations = await reservationModel.find().sort({ checkInTime: 1 });
      res.status(200).json({
        message: "Reservations fetched successfully",
        reservations: reservations,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching reservations: ", error);
      res.status(500).json({ 
        message: "Internal server error", 
        success: false 
      });
    }
  },

  getReservationByPhone: async (req, res) => {
    try {
      const { phone } = req.params;
      const reservations = await reservationModel
        .find({ customerPhone: phone })
        .sort({ checkInTime: 1 });
        
      if (!reservations || reservations.length === 0) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }
      
      res.status(200).json({
        message: `Found ${reservations.length} reservation(s) for phone ${phone}`,
        reservations: reservations,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching reservation by phone: ", error);
      res.status(500).json({ 
        message: "Internal server error", 
        success: false 
      });
    }
  },

  getAvailableTables: async (req, res) => {
    try {
      const { checkInTime, quantity } = req.query;
      
      if (!checkInTime) {
        return res.status(400).json({
          message: "Invalid check-in time",
          success: false,
        });
      }
      if (!quantity || isNaN(quantity)) {
        return res.status(400).json({
          message: "Invalid quantity provided",
          success: false,
        });
      }
      
      const checkIn = new Date(checkInTime);
      const expectedCheckOutTime = new Date(
        checkIn.getTime() + 2 * 60 * 60 * 1000
      );

      try {
        const availableTablesResponse = await tableService.getAvailableTables(
          quantity,
          checkIn.toISOString(),
          expectedCheckOutTime.toISOString()
        );
        
        res.status(200).json({
          message: "Available tables fetched successfully",
          tables: availableTablesResponse.data || [],
          success: true,
        });
      } catch (error) {
        // Fallback to local table availability check
        const conflictingHistories = await tableHistoryModel.find({
          checkInTime: { $lte: expectedCheckOutTime },
          expectedCheckOutTime: { $gte: checkIn },
          tableStatus: { $in: ["Pending", "Occupied", "Unavailable"] },
        });
        
        res.status(200).json({
          message: "Available tables fetched successfully (fallback)",
          tables: [],
          success: true,
        });
      }
    } catch (error) {
      console.error("Error fetching available tables: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  cancelReservation: async (req, res) => {
    try {
      const { id } = req.params;
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
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }

      // Release table through table service if table is assigned
      if (reservation.tableId) {
        try {
          await tableService.releaseTable(
            reservation.tableId,
            reservation._id.toString()
          );
        } catch (error) {
          console.error("Error releasing table:", error);
        }
      }

      await tableHistoryModel.updateMany(
        { reservationId: reservation._id },
        { tableStatus: "Available" }
      );
      
      res.status(200).json({
        message: "Reservation canceled successfully",
        reservation: reservation,
        success: true,
      });
    } catch (error) {
      console.error("Error canceling reservation: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },
};

export default reservationController;
