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
                username: user.username
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
                username: user.username
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
}