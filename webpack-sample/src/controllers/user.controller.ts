import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

const userModel = new UserModel();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const user = await userModel.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
    try {
        // Đảm bảo chuyển đổi thành số nguyên
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
        
        if (req.query.page || req.query.limit) {
            const result = await userModel.findAllWithPagination(page, limit);
            res.json(result);
        } else {
            const users = await userModel.findAll();
            res.json(users);
        }
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
}

    async getUserById(req: Request, res: Response) {
        try {
            const user = await userModel.findById(Number(req.params.id));
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const success = await userModel.update(Number(req.params.id), req.body);
            if (success) {
                res.json({ message: 'User updated successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating user' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const success = await userModel.delete(Number(req.params.id));
            if (success) {
                res.json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user' });
        }
    }

    // View rendering methods
    async renderIndex(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await userModel.findAllWithPagination(page, limit);
            res.render('users/index', { 
                users: result.users,
                pagination: {
                    currentPage: result.page,
                    totalPages: result.totalPages,
                    total: result.total,
                    limit: result.limit
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users' });
        }
    }

    async renderCreate(req: Request, res: Response) {
        res.render('users/create');
    }

    async renderEdit(req: Request, res: Response) {
        const user = await userModel.findById(Number(req.params.id));
        if (user) {
            res.render('users/edit', { user });
        } else {
            res.redirect('/users');
        }
    }
}