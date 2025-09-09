import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

const userModel = new UserModel();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            // Kiểm tra email đã tồn tại
            const existingUser = await userModel.findByEmail(req.body.email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const user = await userModel.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            // Nếu có search parameters, redirect to search
            if (req.query.search || req.query.email || req.query.username) {
                return this.searchUsers(req, res);
            }
            
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

    // Tìm kiếm và lọc users
    async searchUsers(req: Request, res: Response) {
        try {
            const {
                search,           // Tìm kiếm chung trong username, email
                username,         // Lọc theo username
                email,           // Lọc theo email
                createdFrom,     // Lọc từ ngày tạo
                createdTo,       // Lọc đến ngày tạo
                sortBy = 'createdAt',        // Sắp xếp theo field nào
                sortOrder = 'desc',          // asc hoặc desc
                page = '1',
                limit = '10'
            } = req.query;

            // Build filter object
            const filters: any = {};
            
            // Search chung trong multiple fields
            if (search) {
                filters.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            // Lọc theo username cụ thể
            if (username) {
                filters.username = { $regex: username, $options: 'i' };
            }

            // Lọc theo email cụ thể
            if (email) {
                filters.email = { $regex: email, $options: 'i' };
            }

            // Lọc theo khoảng thời gian tạo
            if (createdFrom || createdTo) {
                filters.createdAt = {};
                if (createdFrom) {
                    filters.createdAt.$gte = new Date(createdFrom as string);
                }
                if (createdTo) {
                    filters.createdAt.$lte = new Date(createdTo as string);
                }
            }

            // Sort options
            const sortOptions: any = {};
            sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

            // Pagination
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            // Gọi method search trong UserModel
            const result = await userModel.searchUsers(
                filters,
                sortOptions,
                skip,
                limitNum
            );

            res.json({
                message: 'Users fetched successfully',
                data: result.users,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(result.total / limitNum),
                    totalUsers: result.total,
                    usersPerPage: limitNum,
                    hasNextPage: pageNum < Math.ceil(result.total / limitNum),
                    hasPrevPage: pageNum > 1
                },
                filters: filters // Return applied filters for reference
            });

        } catch (error) {
            console.error('Error searching users:', error);
            res.status(500).json({ message: 'Error searching users' });
        }
    }

    // Advanced search với multiple conditions
    async advancedSearch(req: Request, res: Response) {
        try {
            const {
                query,           // JSON string của complex query
                fields,          // Fields cần return
                page = '1',
                limit = '10'
            } = req.query;

            let searchQuery = {};
            let selectFields = '';

            // Parse query nếu có
            if (query) {
                try {
                    searchQuery = JSON.parse(query as string);
                } catch (error) {
                    return res.status(400).json({ 
                        message: 'Invalid query format. Must be valid JSON.' 
                    });
                }
            }

            // Parse fields to select
            if (fields) {
                selectFields = (fields as string);
            }

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const result = await userModel.advancedSearch(
                searchQuery,
                selectFields,
                '', // populateFields not used with current schema
                skip,
                limitNum
            );

            res.json({
                message: 'Advanced search completed',
                data: result.users,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(result.total / limitNum),
                    totalUsers: result.total,
                    usersPerPage: limitNum
                },
                query: searchQuery
            });

        } catch (error) {
            console.error('Error in advanced search:', error);
            res.status(500).json({ message: 'Error in advanced search' });
        }
    }

    // Suggestions cho autocomplete
    async getUserSuggestions(req: Request, res: Response) {
        try {
            const { field, query, limit = '5' } = req.query;

            if (!field || !query) {
                return res.status(400).json({ 
                    message: 'Field and query parameters are required' 
                });
            }

            // Validate field
            const allowedFields = ['username', 'email'];
            if (!allowedFields.includes(field as string)) {
                return res.status(400).json({
                    message: `Field must be one of: ${allowedFields.join(', ')}`
                });
            }

            const suggestions = await userModel.getSuggestions(
                field as string,
                query as string,
                parseInt(limit as string)
            );

            res.json({
                message: 'Suggestions fetched successfully',
                data: suggestions
            });

        } catch (error) {
            console.error('Error getting suggestions:', error);
            res.status(500).json({ message: 'Error getting suggestions' });
        }
    }

    // Filter users by multiple criteria với preset filters
    async filterUsers(req: Request, res: Response) {
        try {
            const { filterType } = req.params;
            const { page = '1', limit = '10' } = req.query;

            let filters = {};

            // Preset filters
            switch (filterType) {
                case 'recent':
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    filters = { createdAt: { $gte: oneWeekAgo } };
                    break;
                case 'today':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    filters = { 
                        createdAt: { 
                            $gte: today, 
                            $lt: tomorrow 
                        } 
                    };
                    break;
                case 'thisweek':
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    filters = { createdAt: { $gte: weekStart } };
                    break;
                case 'thismonth':
                    const monthStart = new Date();
                    monthStart.setDate(1);
                    monthStart.setHours(0, 0, 0, 0);
                    filters = { createdAt: { $gte: monthStart } };
                    break;
                default:
                    return res.status(400).json({ 
                        message: 'Invalid filter type. Available: recent, today, thisweek, thismonth' 
                    });
            }

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const result = await userModel.searchUsers(
                filters,
                { createdAt: -1 }, // Sort by newest first
                skip,
                limitNum
            );

            res.json({
                message: `${filterType} users fetched successfully`,
                data: result.users,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(result.total / limitNum),
                    totalUsers: result.total,
                    usersPerPage: limitNum
                },
                filterType
            });

        } catch (error) {
            console.error('Error filtering users:', error);
            res.status(500).json({ message: 'Error filtering users' });
        }
    }

    // Get user statistics
    async getUserStats(req: Request, res: Response) {
        try {
            const stats = await userModel.getUserStats();
            res.json({
                message: 'User statistics fetched successfully',
                data: stats
            });
        } catch (error) {
            console.error('Error getting user stats:', error);
            res.status(500).json({ message: 'Error getting user stats' });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await userModel.findById(req.params.id);
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
            const success = await userModel.update(req.params.id, req.body);
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
            const success = await userModel.delete(req.params.id);
            if (success) {
                res.json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
}