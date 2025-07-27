import express from "express";
import {
  getCustomerById,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customer.controller.js";

const route = express.Router();

// Customer routes
route.get("/", getAllCustomers);
route.get("/:id", getCustomerById);
route.post("/", createCustomer);
route.put("/:id", updateCustomer);
route.delete("/:id", deleteCustomer);

export default route; 