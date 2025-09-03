import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { 
    authenticateToken, 
    optionalAuth, 
    requireOwnerOrAdmin 
} from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();
const authController = new AuthController();

// Auth routes (công khai - không cần authentication)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh-token', authController.refreshToken);

// Protected auth routes (cần authentication)
router.post('/auth/logout', authenticateToken, authController.logout);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.put('/auth/change-password', authenticateToken, authController.changePassword);

// User management routes
router.get('/users', optionalAuth, userController.getAllUsers);        // Công khai
router.post('/users', authenticateToken, userController.createUser);   // Cần đăng nhập
router.get('/users/:id', optionalAuth, userController.getUserById);    // Công khai
router.put('/users/:id', authenticateToken, requireOwnerOrAdmin, userController.updateUser); // Chỉ owner
router.delete('/users/:id', authenticateToken, requireOwnerOrAdmin, userController.deleteUser); // Chỉ owner

export default router;