import express from 'express';
import AuthController from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);

// Protected routes - require authentication
router.use('/profile', protect);
router.use('/change-password', protect);
router.use('/users', protect);

// User profile routes
router.get('/profile', AuthController.getMyProfile);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);

// Manager only routes
router.get('/users', authorize('Manager','Receptionist','Waiter','Chef'), AuthController.getUsers);
router.get('/users/:id', authorize('Manager','Receptionist','Waiter','Chef'), AuthController.getUserById);
router.put('/users/:id', authorize('Manager','Receptionist','Waiter','Chef'), AuthController.updateUser);
router.delete('/users/:id', authorize('Manager','Receptionist','Waiter','Chef'), AuthController.deleteUser);

export default router;