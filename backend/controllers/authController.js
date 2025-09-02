import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// --- User Registration ---
export const register = async (req, res) => {
    try {
        const { name, email, password, college, role } = req.body;

        if (!name || !email || !password || !college || !role) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }

        const newUser = new userModel({
            name,
            email: email.toLowerCase(),
            password, // The model's pre-save hook will hash this
            college,
            role
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: savedUser.email,
            subject: 'Welcome to CampusEventHub!',
            text: `Welcome to CampusEventHub! Your account has been created successfully.`
        };
        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "User registered successfully!" });

    } catch (error) {
        console.error("--- REGISTRATION ERROR ---", error);
        return res.status(500).json({ success: false, message: "Server error during registration." });
    }
};

// --- User Login ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("--- LOGIN ERROR ---", error);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
};

// --- User Logout ---
export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("--- LOGOUT ERROR ---", error);
        return res.status(500).json({ success: false, message: "Server error during logout." });
    }
};

// --- Send Password Reset OTP ---
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(200).json({ success: true, message: "If a user with this email exists, a password reset OTP has been sent." });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 600000; // 10 minutes
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP to reset your password is: ${otp}. It will expire in 10 minutes.`
        };
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "If a user with this email exists, a password reset OTP has been sent." });

    } catch (error) {
        console.error("--- SEND RESET OTP ERROR ---", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// --- Reset User Password with OTP ---
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        const user = await userModel.findOne({
            email: email.toLowerCase(),
            resetOtp: otp,
            resetOtpExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid OTP or OTP has expired." });
        }

        user.password = newPassword; // The pre-save hook will hash this
        user.resetOtp = undefined;
        user.resetOtpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "Password has been reset successfully." });

    } catch (error) {
        console.error("--- RESET PASSWORD ERROR ---", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};