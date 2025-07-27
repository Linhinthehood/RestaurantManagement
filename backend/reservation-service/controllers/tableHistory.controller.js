import tableHistoryModel from "../models/tableHistory.model.js";
import { tableService } from "../services/externalService.js";

const tableHistoryController = {
  // Tạo TableHistory thủ công từ tables có sẵn trong table service
  createTableHistoryFromTables: async (req, res) => {
    try {
      // Lấy tất cả tables từ table service
      let tables = [];
      try {
        const tablesResponse = await tableService.getAllTables();
        console.log('Tables response:', tablesResponse);
        
        // Kiểm tra cấu trúc response
        if (tablesResponse && tablesResponse.tables) {
          tables = tablesResponse.tables;
        } else if (Array.isArray(tablesResponse)) {
          tables = tablesResponse;
        } else if (tablesResponse && tablesResponse.data) {
          tables = tablesResponse.data;
        } else {
          console.error('Unexpected response structure:', tablesResponse);
          return res.status(500).json({
            message: "Unexpected response structure from table service",
            success: false,
          });
        }
      } catch (error) {
        console.error("Error fetching tables from table service:", error);
        return res.status(500).json({
          message: "Unable to fetch tables from table service",
          success: false,
        });
      }

      console.log('Tables found:', tables.length);

      if (tables.length === 0) {
        return res.status(404).json({
          message: "No tables found in table service",
          success: false,
        });
      }

      // Tạo TableHistory records cho mỗi table với status "Available"
      const tableHistoryRecords = [];
      for (const table of tables) {
        const tableHistoryData = {
          tableId: table._id,
          tableStatus: "Available", // Default status
          assignedTime: new Date(),
          note: "Created manually from table service - no reservation assigned yet",
          // Không cần reservationId và checkInTime khi tạo thủ công
        };

        const tableHistory = await tableHistoryModel.create(tableHistoryData);
        tableHistoryRecords.push(tableHistory);
      }

      res.status(201).json({
        message: `Created ${tableHistoryRecords.length} TableHistory records successfully`,
        tableHistories: tableHistoryRecords,
        success: true,
      });
    } catch (error) {
      console.error("Error creating TableHistory records:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Lấy tất cả TableHistory
  getAllTableHistories: async (req, res) => {
    try {
      const tableHistories = await tableHistoryModel.find()
        .sort({ assignedTime: -1 });
      
      res.status(200).json({
        message: "Table histories fetched successfully",
        tableHistories: tableHistories,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching table histories:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Lấy TableHistory theo tableId
  getTableHistoryByTableId: async (req, res) => {
    try {
      const { tableId } = req.params;
      const tableHistories = await tableHistoryModel.find({ tableId: tableId })
        .sort({ assignedTime: -1 });
      
      res.status(200).json({
        message: "Table histories fetched successfully",
        tableHistories: tableHistories,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching table histories:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Lấy TableHistory theo reservationId
  getTableHistoryByReservationId: async (req, res) => {
    try {
      const { reservationId } = req.params;
      const tableHistories = await tableHistoryModel.find({ reservationId: reservationId })
        .sort({ assignedTime: -1 });
      
      res.status(200).json({
        message: "Table histories fetched successfully",
        tableHistories: tableHistories,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching table histories:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Cập nhật TableHistory
  updateTableHistory: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const tableHistory = await tableHistoryModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!tableHistory) {
        return res.status(404).json({
          message: "Table history not found",
          success: false,
        });
      }
      
      res.status(200).json({
        message: "Table history updated successfully",
        tableHistory: tableHistory,
        success: true,
      });
    } catch (error) {
      console.error("Error updating table history:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Xóa TableHistory
  deleteTableHistory: async (req, res) => {
    try {
      const { id } = req.params;
      
      const tableHistory = await tableHistoryModel.findByIdAndDelete(id);
      
      if (!tableHistory) {
        return res.status(404).json({
          message: "Table history not found",
          success: false,
        });
      }
      
      res.status(200).json({
        message: "Table history deleted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error deleting table history:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Lấy TableHistory theo status
  getTableHistoryByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      const tableHistories = await tableHistoryModel.find({ tableStatus: status })
        .sort({ assignedTime: -1 });
      
      res.status(200).json({
        message: `Table histories with status '${status}' fetched successfully`,
        tableHistories: tableHistories,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching table histories by status:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Tạo TableHistory cho một table cụ thể
  createTableHistoryForTable: async (req, res) => {
    try {
      const { tableId } = req.params;
      const { tableStatus = "Available", note = "" } = req.body;

      // Kiểm tra xem table có tồn tại trong table service không
      try {
        await tableService.getAllTables(); // Có thể cần endpoint kiểm tra table cụ thể
      } catch (error) {
        return res.status(404).json({
          message: "Table not found in table service",
          success: false,
        });
      }

      const tableHistoryData = {
        tableId: tableId,
        tableStatus: tableStatus,
        assignedTime: new Date(),
        note: note,
      };

      const tableHistory = await tableHistoryModel.create(tableHistoryData);

      res.status(201).json({
        message: "Table history created successfully",
        tableHistory: tableHistory,
        success: true,
      });
    } catch (error) {
      console.error("Error creating table history:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
};

export default tableHistoryController; 