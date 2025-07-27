import express from "express";
import tableController from "../controllers/table.controller.js";

const route = express.Router();

route.get("/", tableController.getAllTable);
route.get("/:id", tableController.getTableById);
route.post("/create", tableController.createTable);
route.put("/:id/update", tableController.updateTable);
route.delete("/:id/delete", tableController.deleteTable);

export default route;
