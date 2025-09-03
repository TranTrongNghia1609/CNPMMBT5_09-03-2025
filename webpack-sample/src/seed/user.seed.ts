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
    }
];

const seedUsers = async () => {
    try {
        await connectDB();
        await UserSchema.deleteMany({});
        const createdUsers = await UserSchema.insertMany(sampleUsers);
        console.log(`Created ${createdUsers.length} sample users`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();