import express from 'express';
import AuthController from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);

// Protected routes - require authentication

// User profile routes
router.get('/profile', AuthController.getMyProfile);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);

// Manager only routes
router.get('/users', AuthController.getUsers);
router.get('/users/:id', AuthController.getUserById);
router.put('/users/:id', AuthController.updateUser);
router.delete('/users/:id', AuthController.deleteUser);

export default router;