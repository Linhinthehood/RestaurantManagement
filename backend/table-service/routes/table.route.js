import express from "express";
import tableController from "../controllers/table.controller.js";
import { protect, authorize, requireTableManagement, requireTableAccess } from "../middlewares/authMiddleware.js";

const route = express.Router();

route.get("/", tableController.getAllTable);
route.post("/create",protect, authorize('Manager'), tableController.createTable);
route.put("/:id/update",protect, authorize('Manager'), tableController.updateTable);
route.delete("/:id/delete",protect, authorize('Manager'), tableController.deleteTable);

export default route;
