import express from 'express';
import AuthController from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post ('/register', AuthController.registerUser);
router.post('/login',AuthController.loginUser);

router.get('/users', protect, authorize('Manager'), AuthController.getUsers); 
router.get('/profile', protect, AuthController.getMyProfile); 
router.put('/update/:id', protect, authorize('Manager'), AuthController.updateUser);
router.delete('/delete/:id', protect, authorize('Manager'), AuthController.deleteUser);

export default router;