import { UserModel } from '../models/user.model';

const userModel = new UserModel();

export const createAdminUser = async () => {
    try {
        console.log('🔍 Checking for existing admin user...');
        
        // Kiểm tra xem email admin đã tồn tại chưa
        const existingAdminByEmail = await userModel.findByEmail('admin@example.com');
        
        if (existingAdminByEmail) {
            console.log('✅ Admin user already exists');
            console.log('📧 Email:', existingAdminByEmail.email);
            console.log('👤 Username:', existingAdminByEmail.username);
            console.log('🔰 Role:', existingAdminByEmail.role || 'user (need to update)');
            
            // Nếu user đã tồn tại nhưng không phải admin, cập nhật role
            if (existingAdminByEmail.role !== 'admin') {
                console.log('🔄 Updating existing user to admin role...');
                await userModel.update(existingAdminByEmail._id!, {
                    role: 'admin',
                    isActive: true
                });
                console.log('✅ User updated to admin successfully!');
            }
            return;
        }

        console.log('👤 Creating default admin user...');
        
        // Tạo admin user mặc định
        const adminUser = await userModel.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // Sẽ được hash tự động bởi pre-save hook
            role: 'admin',
            isActive: true
        });

        console.log('🎉 Admin user created successfully!');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Username: admin');
        console.log('⚠️  Please change the default password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    }
};

// Tạo thêm một số test users
export const createTestUsers = async () => {
    try {
        console.log('👥 Creating test users...');
        
        const testUsers = [
            {
                username: 'testuser1',
                email: 'test1@example.com',
                password: 'password123',
                role: 'user' as const,
                isActive: true
            },
            {
                username: 'testuser2',
                email: 'test2@example.com',
                password: 'password123',
                role: 'user' as const,
                isActive: true
            },
            {
                username: 'testadmin2',
                email: 'admin2@example.com',
                password: 'admin123',
                role: 'admin' as const,
                isActive: true
            }
        ];

        for (const userData of testUsers) {
            try {
                // Kiểm tra user đã tồn tại chưa
                const existingUser = await userModel.findByEmail(userData.email);
                if (!existingUser) {
                    await userModel.create(userData);
                    console.log(`✅ Created test user: ${userData.email}`);
                } else {
                    console.log(`⏭️  Test user already exists: ${userData.email}`);
                }
            } catch (error) {
                console.log(`⚠️  Error creating test user ${userData.email}:`, error);
            }
        }
        
    } catch (error) {
        console.error('❌ Error creating test users:', error);
    }
};

export const seedAdminAndTestUsers = async () => {
    try {
        await createAdminUser();
        await createTestUsers();
        console.log('🎯 Admin and test users seeding completed!');
    } catch (error) {
        console.error('❌ Error in seeding process:', error);
    }
};