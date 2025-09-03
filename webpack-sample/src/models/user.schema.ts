import mongoose, { Schema, Document } from 'mongoose';
import { UserDoc } from '../interfaces/user.interface';
import bcrypt from 'bcryptjs';

// Loại bỏ _id từ UserDoc để tránh conflict với Document._id
export interface UserDocument extends Omit<UserDoc, '_id'>, Document {
    _id: mongoose.Types.ObjectId; // Explicit định nghĩa _id
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<UserDocument> = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    refreshToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            // Destructure để loại bỏ password, refreshToken, __v
            const { password, refreshToken, __v, _id, ...userObject } = ret;
            
            // Trả về object mới với _id là string
            return {
                _id: _id.toString(), // Convert ObjectId to string
                ...userObject
            };
        }
    },
    toObject: {
        transform: function(doc, ret) {
            // Tương tự cho toObject
            const { _id, ...restObject } = ret;
            return {
                _id: _id.toString(),
                ...restObject
            };
        }
    }
});

// Hash password trước khi save
UserSchema.pre<UserDocument>('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method so sánh password
UserSchema.methods.comparePassword = async function(this: UserDocument, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>('User', UserSchema);