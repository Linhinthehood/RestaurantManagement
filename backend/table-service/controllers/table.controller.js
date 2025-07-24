import tableModel from "../models/table.model.js";
import tableService from "../services/table.service.js";

const tableController = {
  createTable: async (req, res) => {
    try {
      const { name, capacity, type } = req.body;
      if (!name || !capacity || !type) {
        return res.status(400).json({ message: "Required table information" });
      }
      const table = await tableModel.create({
        name: name,
        capacity: capacity,
        type: type,
      });

      res.status(200).json({
        message: "Create table successfully",
        table: table,
        success: true,
      });
    } catch (error) {
      console.error("Error creating table: ", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },

  getAllTable: async (req, res) => {
    try {
      const tables = await tableModel.find();
      res.status(200).json({
        message: "Get all table successfully",
        tables: tables,
        success: true,
      });
    } catch (error) {
      console.error("Error getting all table: ", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  updateTable: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, capacity, type } = req.body;
      if (!name || !capacity || !type) {
        return res
          .status(400)
          .json({ message: "Required table information", success: false });
      }
      const updatedTable = await tableModel.findByIdAndUpdate(
        id,
        {
          name,
          capacity: Number(capacity),
          type,
        },
        { new: true }
      );

      if (!updatedTable) {
        return res.status(404).json({
          message: "Table not found",
          success: false,
        });
      }
      res.status(200).json({
        message: "Update table successfully",
        table: updatedTable,
        success: true,
      });
    } catch (error) {
      console.error("Error updating table: ", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },

  deleteTable: async (req, res) => {
    try {
      const { id } = req.params;
      const table = await tableModel.findByIdAndDelete(id);
      res
        .status(200)
        .json({ message: "Delete table successfully", table, success: true });
    } catch (error) {
      console.error("Error deleting table: ", error);
      res
        .status(500)
        .json({ message: "Internal server error", success: false });
    }
  },
};

export default tableController;
