import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../service/jwt.service';
import { TokenPayload } from '../interfaces/user.interface';

// Extend Request interface để thêm user property
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

const jwtService = new JWTService();

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Access token is required' 
            });
        }

        const decoded = jwtService.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ 
                message: 'Invalid or expired access token' 
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ 
            message: 'Token verification failed' 
        });
    }
};

// Middleware cho optional authentication (không bắt buộc phải login)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwtService.verifyAccessToken(token);
            if (decoded) {
                req.user = decoded;
            }
        }

        next();
    } catch (error) {
        // Không throw error, chỉ bỏ qua authentication
        next();
    }
};

// Middleware kiểm tra quyền (có thể mở rộng sau)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ 
            message: 'Authentication required' 
        });
    }
    next();
};

// Middleware kiểm tra owner hoặc admin
export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ 
            message: 'Authentication required' 
        });
    }

    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;

    // Cho phép user sửa/xóa chính mình hoặc admin (có thể mở rộng logic admin sau)
    if (currentUserId !== targetUserId) {
        return res.status(403).json({ 
            message: 'Access denied. You can only modify your own account.' 
        });
    }

    next();
};