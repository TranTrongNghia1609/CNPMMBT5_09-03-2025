import jwt from 'jsonwebtoken';
import { TokenPayload } from '../interfaces/user.interface';

export class JWTService {
    private accessTokenSecret: string;
    private refreshTokenSecret: string;
    private accessTokenExpiry: string;
    private refreshTokenExpiry: string;

    constructor() {
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access_secret_key';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }

    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(
            JSON.parse(JSON.stringify(payload)), // Convert to plain object
            this.accessTokenSecret,
            { expiresIn: this.accessTokenExpiry } as jwt.SignOptions
        );
    }

    generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(
            JSON.parse(JSON.stringify(payload)), // Convert to plain object
            this.refreshTokenSecret,
            { expiresIn: this.refreshTokenExpiry } as jwt.SignOptions
        );
    }

    verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.accessTokenSecret) as any;
            
            if (decoded && decoded.userId && decoded.email && decoded.username) {
                return {
                    userId: decoded.userId,
                    email: decoded.email,
                    username: decoded.username
                } as TokenPayload;
            }
            
            return null;
        } catch (error) {
            console.error('Access token verification failed:', error);
            return null;
        }
    }

    verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.refreshTokenSecret) as any;
            
            if (decoded && decoded.userId && decoded.email && decoded.username) {
                return {
                    userId: decoded.userId,
                    email: decoded.email,
                    username: decoded.username
                } as TokenPayload;
            }
            
            return null;
        } catch (error) {
            console.error('Refresh token verification failed:', error);
            return null;
        }
    }

    generateTokenPair(payload: TokenPayload): { accessToken: string; refreshToken: string } {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload)
        };
    }
}