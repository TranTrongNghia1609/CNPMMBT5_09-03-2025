import mongoose from 'mongoose';

export interface User {
    _id?: string;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin'; // Thêm role
    isActive: boolean; // Thêm trạng thái active
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface riêng cho MongoDB Document
export interface UserDoc {
    _id: mongoose.Types.ObjectId; // ObjectId trong MongoDB
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    isActive: boolean;
    refreshToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LoginResponse {
    user: Omit<User, 'password' | 'refreshToken'>;
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    iat?: number; // issued at
    exp?: number; // expiration time
}

export interface PaginationResult {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}