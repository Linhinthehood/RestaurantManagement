import express from "express";
import customerController from "../controllers/customer.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/phone/:phone", customerController.getCustomerByPhone);
router.get("/email/:email", customerController.getCustomerByEmail);

// Protected routes - require authentication
router.use(protect);

router.get("/", customerController.getAllCustomers);
router.put("/:id", customerController.updateCustomer);

export default router; 