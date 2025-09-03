import pool from '../config/db.config';
import { User } from '../interfaces/user.interface';
export interface PaginationResult {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export class UserModel {
    async create(user: User): Promise<User> {
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [user.username, user.email, user.password]
        );
        return { ...user, id: (result as any).insertId };
    }

    async findAll(): Promise<User[]> {
        const [rows] = await pool.execute('SELECT * FROM users');
        return rows as User[];
    }
     async findAllWithPagination(page: number = 1, limit: number = 10): Promise<PaginationResult> {
    try {
        console.log('Starting pagination query with page:', page, 'limit:', limit);
        
        // Đảm bảo page và limit là số nguyên
        const pageInt = parseInt(page.toString());
        const limitInt = parseInt(limit.toString());
        const offset = (pageInt - 1) * limitInt;
        
        console.log('Converted values - page:', pageInt, 'limit:', limitInt, 'offset:', offset);
        
        // Lấy tổng số users
        console.log('Executing count query...');
        const [countResult]: any = await pool.execute('SELECT COUNT(*) as total FROM users');
        const total = countResult[0].total;
        console.log('Total users found:', total);
        
        // Lấy users với phân trang - KHÔNG dùng ? cho LIMIT và OFFSET
        console.log('Executing pagination query...');
        const [rows] = await pool.execute(
            `SELECT * FROM users LIMIT ${limitInt} OFFSET ${offset}`
        );
        console.log('Users found:', rows);
        
        const totalPages = Math.ceil(total / limitInt);
        
        return {
            users: rows as User[],
            total,
            page: pageInt,
            limit: limitInt,
            totalPages
        };
    } catch (error) {
        console.error('Error in findAllWithPagination:', error);
        throw error;
    }
}

    async findById(id: number): Promise<User | null> {
        const [rows]: any = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    async update(id: number, user: Partial<User>): Promise<boolean> {
        const [result] = await pool.execute(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [user.username, user.email, id]
        );
        return (result as any).affectedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return (result as any).affectedRows > 0;
    }
}