import express from 'express';
import userRoutes from './routes/user.routes';
import path from 'path';
import cors from 'cors';
import connectDB from './config/db.config';
import { seedAdminAndTestUsers } from './seed/admin.seed';

const app = express();
const port = process.env.PORT || 3000;

// Khởi động server
const startServer = async () => {
    try {
        // Kết nối database
        await connectDB();
        console.log('✅ Database connected successfully');
        
        // Chạy seed admin user
        await seedAdminAndTestUsers();
        
        // Cấu hình CORS
        app.use(cors({
            origin: 'http://localhost:5173', // FE chạy ở port này
            credentials: true
        }));

        // Middleware
        app.use(express.json());
        app.use('/v1/api', userRoutes);

        // View engine setup
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        app.use(express.static(path.join(__dirname, 'public')));

        // Khởi động server
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
            console.log(`📋 API Documentation: http://localhost:${port}/v1/api`);
            console.log('');
            console.log('🔐 Admin Credentials:');
            console.log('   Email: admin@example.com');
            console.log('   Password: admin123');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();