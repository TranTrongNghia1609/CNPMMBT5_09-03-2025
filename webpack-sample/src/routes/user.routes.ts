import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { 
    authenticateToken, 
    optionalAuth, 
    requireOwnerOrAdmin,
    requireAdmin
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
router.get('/users', authenticateToken, requireAdmin, userController.getAdminUsers); // Admin only
router.post('/users', authenticateToken, requireAdmin, userController.createUser);   // Admin only
router.get('/users/:id', authenticateToken, requireOwnerOrAdmin, userController.getUserById); // Owner hoặc Admin
router.put('/users/:id', authenticateToken, requireOwnerOrAdmin, userController.updateUser); // Owner hoặc Admin
router.delete('/users/:id', authenticateToken, requireAdmin, userController.deleteUser); // Admin only

// Admin only routes
router.put('/users/:id/admin', authenticateToken, requireAdmin, userController.updateUserByAdmin); // New admin update route
router.put('/users/:id/status', authenticateToken, requireAdmin, userController.toggleUserStatus);
router.put('/users/:id/role', authenticateToken, requireAdmin, userController.changeUserRole);

// Public routes (không cần authentication)
router.get('/public/users', optionalAuth, userController.getAllUsers); // Công khai xem danh sách

// Search và filter routes
router.get('/search', userController.searchUsers.bind(userController));
router.get('/advanced-search', userController.advancedSearchUsers.bind(userController));
router.get('/suggestions', userController.getUserSuggestions.bind(userController));
router.get('/filter/:filterType', userController.filterUsers.bind(userController));

// Admin statistics
router.get('/admin/stats', authenticateToken, requireAdmin, userController.getUserStats);

export default router;