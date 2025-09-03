import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    college: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['student', 'college_admin'], 
        default: 'student'                   
    },
    isAccountVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,

    resetOtp: String,
    resetOtpExpiresAt: Date,
}, { timestamps: true });

// Hash password before saving the user model
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;