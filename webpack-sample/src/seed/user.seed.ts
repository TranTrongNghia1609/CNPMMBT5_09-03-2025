import mongoose from 'mongoose';
import UserSchema from '../models/user.schema';
import connectDB from '../config/db.config';

const sampleUsers = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
    },
    {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
    },
    {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password456'
    },
    {
        username: 'bob_wilson',
        email: 'bob@example.com',
        password: 'password789'
    },
    {
        username: 'bob_wilson1',
        email: 'bob1@example.com',
        password: 'password789'
    },
    {
        username: 'bob_wilson2',
        email: 'bob2@example.com',
        password: 'password789'
    },
    {
        username: 'bob_wilson3',
        email: 'bob3@example.com',
        password: 'password789'
    },
    {
        username: 'bob_wilson4',
        email: 'bob4@example.com',
        password: 'password789'
    },
    {
        username: 'bob_wilson5',
        email: 'bob5@example.com',
        password: 'password789'
    },
    {
        username: 'alice_brown',
        email: 'alice@example.com',
        password: 'password101'
    },
    {
        username: 'mike_johnson',
        email: 'mike@example.com',
        password: 'password202'
    },
    {
        username: 'sarah_davis',
        email: 'sarah@example.com',
        password: 'password303'
    },
    {
        username: 'david_miller',
        email: 'david@example.com',
        password: 'password404'
    },
    {
        username: 'lisa_garcia',
        email: 'lisa@example.com',
        password: 'password505'
    },
    {
        username: 'mark_martinez',
        email: 'mark@example.com',
        password: 'password606'
    },
    {
        username: 'emma_rodriguez',
        email: 'emma@example.com',
        password: 'password707'
    },
    {
        username: 'chris_lopez',
        email: 'chris@example.com',
        password: 'password808'
    },
    {
        username: 'olivia_wilson',
        email: 'olivia@example.com',
        password: 'password909'
    },
    {
        username: 'james_taylor',
        email: 'james@example.com',
        password: 'password111'
    },
    {
        username: 'sophia_anderson',
        email: 'sophia@example.com',
        password: 'password222'
    }
];

const clearExistingData = async () => {
    try {
        console.log('🗑️ Clearing existing data from database...');
        
        // Đếm số lượng users hiện tại
        const existingUsersCount = await UserSchema.countDocuments();
        console.log(`📊 Found ${existingUsersCount} existing users in database`);
        
        if (existingUsersCount > 0) {
            // Xóa tất cả users
            const deleteResult = await UserSchema.deleteMany({});
            console.log(`✅ Deleted ${deleteResult.deletedCount} users from database`);
            
            // Xóa indexes (nếu có)
            try {
                await UserSchema.collection.dropIndexes();
                console.log('🧹 Dropped all indexes');
            } catch (indexError) {
                console.log('ℹ️ No indexes to drop or already dropped');
            }
            
            // Reset collection - sử dụng connection với null check
            try {
                // Kiểm tra xem connection và db có tồn tại không
                if (mongoose.connection && mongoose.connection.db) {
                    await mongoose.connection.db.collection('users').drop();
                    console.log('🔄 Dropped users collection completely');
                } else {
                    console.log('⚠️ Database connection not available for collection drop');
                }
            } catch (dropError) {
                console.log('ℹ️ Collection already clean or does not exist');
            }
        } else {
            console.log('✨ Database is already clean, no users to delete');
        }
        
        console.log('🎯 Database cleanup completed successfully\n');
        
    } catch (error) {
        console.error('❌ Error clearing existing data:', error);
        throw error;
    }
};

const seedUsers = async () => {
    try {
        console.log('🌱 Starting user seeding process...\n');
        
        // Kết nối database
        console.log('🔗 Connecting to database...');
        await connectDB();
        
        // Verify connection state
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection failed');
        }
        
        console.log('✅ Database connected successfully\n');
        
        // Clear dữ liệu cũ
        await clearExistingData();
        
        // Tạo users mới
        console.log('👤 Creating new sample users...');
        console.log(`📦 Preparing to insert ${sampleUsers.length} users\n`);
        
        const createdUsers = await UserSchema.insertMany(sampleUsers);
        
        console.log(`✅ Successfully created ${createdUsers.length} sample users:`);
        console.log('='.repeat(60));
        
        createdUsers.forEach((user, index) => {
            console.log(`${String(index + 1).padStart(2, ' ')}. ${user.username.padEnd(20)} | ${user.email}`);
        });
        
        console.log('='.repeat(60));
        console.log('🎉 User seeding completed successfully!');
        console.log('💡 You can now test the application with these sample users');
        console.log('🔐 Default admin credentials: admin@example.com / admin123\n');
        
        // Verify seeding
        const finalCount = await UserSchema.countDocuments();
        console.log(`📊 Final database count: ${finalCount} users`);
        
        // Đóng connection sau khi hoàn thành
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Error seeding users:');
        console.error('Error details:', error);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Make sure MongoDB is running');
        console.log('2. Check your database connection string');
        console.log('3. Verify database permissions');
        console.log('4. Ensure UserSchema model is properly defined');
        
        // Đóng connection nếu có lỗi
        try {
            await mongoose.connection.close();
        } catch (closeError) {
            console.log('Could not close database connection');
        }
        
        process.exit(1);
    }
};

// Export function for use in other files
export { seedUsers, clearExistingData };

// Run seeding if this file is executed directly
if (require.main === module) {
    seedUsers();
}