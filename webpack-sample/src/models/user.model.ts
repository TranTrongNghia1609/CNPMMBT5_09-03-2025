import UserSchema, { UserDocument } from './user.schema';
import { User, PaginationResult, LoginResponse } from '../interfaces/user.interface';
import { JWTService } from '../service/jwt.service';

const jwtService = new JWTService();

export class UserModel {
    // Helper method để convert Document thành User (string _id)
    private documentToUser(doc: UserDocument): User {
        return {
            _id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            password: doc.password,
            role: doc.role,
            isActive: doc.isActive,
            refreshToken: doc.refreshToken,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }

    async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const newUser = new UserSchema(userData);
        const savedUser = await newUser.save();
        return this.documentToUser(savedUser);
    }

    async login(email: string, password: string): Promise<LoginResponse | null> {
        try {
            // Tìm user theo email và include password
            const user = await UserSchema.findOne({ email }).select('+password');
            if (!user) {
                return null;
            }

            // Kiểm tra password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return null;
            }

            // Tạo token payload
            const tokenPayload = {
                userId: user._id.toString(),
                email: user.email,
                username: user.username,
                role: user.role
            };

            // Generate tokens
            const { accessToken, refreshToken } = jwtService.generateTokenPair(tokenPayload);

            // Lưu refresh token vào database
            user.refreshToken = refreshToken;
            await user.save();

            // Trả về response
            const userResponse = {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
            return {
                user: userResponse,
                accessToken,
                refreshToken
            };
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
        try {
            // Verify refresh token
            const decoded = jwtService.verifyRefreshToken(refreshToken);
            if (!decoded) {
                return null;
            }

            // Tìm user và kiểm tra refresh token
            const user = await UserSchema.findById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                return null;
            }

            // Tạo access token mới
            const tokenPayload = {
                userId: user._id.toString(),
                email: user.email,
                username: user.username,
                role: user.role
            };

            const accessToken = jwtService.generateAccessToken(tokenPayload);

            return { accessToken };
        } catch (error) {
            console.error('Refresh token error:', error);
            return null;
        }
    }

    async logout(userId: string): Promise<boolean> {
        try {
            const result = await UserSchema.findByIdAndUpdate(
                userId,
                { refreshToken: null },
                { new: true }
            );
            return !!result;
        } catch (error) {
            return false;
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            const user = await UserSchema.findById(userId).select('+password');
            if (!user) {
                return false;
            }

            // Kiểm tra current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return false;
            }

            // Cập nhật password mới
            user.password = newPassword;
            await user.save(); // Pre-save hook sẽ hash password

            return true;
        } catch (error) {
            console.error('Change password error:', error);
            return false;
        }
    }

    async findAll(): Promise<User[]> {
        const users = await UserSchema.find({}).select('-password -refreshToken').sort({ createdAt: -1 });
        return users.map(user => this.documentToUser(user));
    }

    async findAllWithPagination(page: number = 1, limit: number = 10): Promise<PaginationResult> {
        const pageInt = Math.max(1, parseInt(page.toString()));
        const limitInt = Math.max(1, parseInt(limit.toString()));
        const skip = (pageInt - 1) * limitInt;

        const total = await UserSchema.countDocuments({});
        const users = await UserSchema
            .find({})
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitInt);

        const totalPages = Math.ceil(total / limitInt);

        return {
            users: users.map(user => this.documentToUser(user)),
            total,
            page: pageInt,
            limit: limitInt,
            totalPages
        };
    }

    async findById(id: string): Promise<User | null> {
        try {
            const user = await UserSchema.findById(id).select('-password -refreshToken');
            return user ? this.documentToUser(user) : null;
        } catch (error) {
            return null;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserSchema.findOne({ email }).select('-password -refreshToken');
        return user ? this.documentToUser(user) : null;
    }

    async update(id: string, userData: Partial<User>): Promise<boolean> {
        try {
            // Loại bỏ password và refreshToken khỏi update data
            const { password, refreshToken, ...updateData } = userData;
            
            const result = await UserSchema.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true }
            );
            return !!result;
        } catch (error) {
            return false;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await UserSchema.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            return false;
        }
    }
    async searchUsers(
        filters: any = {},
        sortOptions: any = { createdAt: -1 },
        skip: number = 0,
        limit: number = 10
    ): Promise<{ users: User[]; total: number }> {
        try {
            const [users, total] = await Promise.all([
                UserSchema
                    .find(filters)
                    .select('-password -refreshToken')
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit),
                UserSchema.countDocuments(filters)
            ]);

            return {
                users: users.map(user => this.documentToUser(user)),
                total
            };
        } catch (error) {
            console.error('Search users error:', error);
            throw error;
        }
    }

    // Advanced search with custom query and field selection
    async advancedSearch(
        query: any = {},
        selectFields: string = '',
        populateFields: string = '',
        skip: number = 0,
        limit: number = 10
    ): Promise<{ users: User[]; total: number }> {
        try {
            let projection = '-password -refreshToken'; // Default exclude password

            // Parse select fields
            if (selectFields) {
                projection = selectFields.split(',').join(' ');
                // Always exclude password for security
                if (!projection.includes('-password')) {
                    projection += ' -password -refreshToken';
                }
            }

            const [users, total] = await Promise.all([
                UserSchema
                    .find(query)
                    .select(projection)
                    .skip(skip)
                    .limit(limit),
                UserSchema.countDocuments(query)
            ]);

            return {
                users: users.map(user => this.documentToUser(user)),
                total
            };
        } catch (error) {
            console.error('Advanced search error:', error);
            throw error;
        }
    }
    async getSuggestions(field: string, query: string, limit: number = 5): Promise<string[]> {
        try {
            const searchRegex = { $regex: query, $options: 'i' };
            const filter = { [field]: searchRegex };

            const suggestions = await UserSchema
                .find(filter)
                .select(`${field} -_id`)
                .limit(limit)
                .lean();

            // Extract unique values
            const uniqueValues = [...new Set(
                suggestions.map(item => item[field as keyof UserDocument])
                    .filter(value => value) // Remove null/undefined
            )];

            return uniqueValues as string[];
        } catch (error) {
            console.error('Get suggestions error:', error);
            throw error;
        }
    }
    // Count users by different criteria
    async getUserStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        recentUsers: number;
    }> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const [totalUsers, activeUsers, inactiveUsers, recentUsers] = await Promise.all([
                UserSchema.countDocuments({}),
                UserSchema.countDocuments({ isActive: true }),
                UserSchema.countDocuments({ isActive: false }),
                UserSchema.countDocuments({ createdAt: { $gte: oneWeekAgo } })
            ]);

            return {
                totalUsers,
                activeUsers,
                inactiveUsers,
                recentUsers
            };
        } catch (error) {
            console.error('Get user stats error:', error);
            throw error;
        }
    }

    // Search users by text (full-text search)
    async searchByText(searchText: string, limit: number = 10): Promise<User[]> {
        try {
            const users = await UserSchema
                .find({
                    $or: [
                        { username: { $regex: searchText, $options: 'i' } },
                        { email: { $regex: searchText, $options: 'i' } }
                    ]
                })
                .select('-password -refreshToken')
                .limit(limit);

            return users.map(user => this.documentToUser(user));
        } catch (error) {
            console.error('Search by text error:', error);
            throw error;
        }
    }
}