import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

const userModel = new UserModel();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    message: 'Username, email, and password are required' 
                });
            }

            if (password.length < 6) {
                return res.status(400).json({ 
                    message: 'Password must be at least 6 characters long' 
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'Invalid email format' 
                });
            }

            // Kiểm tra email đã tồn tại
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Tạo user mới
            const user = await userModel.create({ username, email, password });
            
            res.status(201).json({ 
                message: 'User created successfully',
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Email and password are required' 
                });
            }

            // Thực hiện login
            const loginResult = await userModel.login(email, password);
            if (!loginResult) {
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }

            res.json({
                message: 'Login successful',
                ...loginResult
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Login failed' });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ 
                    message: 'Refresh token is required' 
                });
            }

            const result = await userModel.refreshAccessToken(refreshToken);
            if (!result) {
                return res.status(401).json({ 
                    message: 'Invalid refresh token' 
                });
            }

            res.json({
                message: 'Token refreshed successfully',
                ...result
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({ message: 'Token refresh failed' });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(400).json({ message: 'User ID not found' });
            }

            const success = await userModel.logout(userId);
            if (success) {
                res.json({ message: 'Logout successful' });
            } else {
                res.status(500).json({ message: 'Logout failed' });
            }
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ message: 'Logout failed' });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(400).json({ message: 'User ID not found' });
            }

            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                message: 'Profile retrieved successfully',
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Error retrieving profile' });
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const { currentPassword, newPassword } = req.body;

            if (!userId) {
                return res.status(400).json({ message: 'User ID not found' });
            }

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    message: 'Current password and new password are required' 
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    message: 'New password must be at least 6 characters long' 
                });
            }

            const success = await userModel.changePassword(userId, currentPassword, newPassword);
            if (!success) {
                return res.status(400).json({ 
                    message: 'Current password is incorrect' 
                });
            }

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Error changing password' });
        }
    }
}