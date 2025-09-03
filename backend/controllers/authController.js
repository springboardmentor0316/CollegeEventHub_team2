import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// --- User Registration ---
export const register = async (req, res) => {
    try {
        const { name, email, password, college, role } = req.body;
        console.log("Register request body:", req.body);


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

        // Generate a JWT verification token (expires in 1 day)
        const verificationToken = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        newUser.verificationToken = verificationToken;
        newUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

        const savedUser = await newUser.save();
        const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
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
            // subject: 'Welcome to CampusEventHub!',
            // text: `Welcome to CampusEventHub! Your account has been created successfully.`

            subject: 'Verify your CampusEventHub account',
            html: `<p>Welcome ${newUser.name},</p>
                   <p>Please verify your email by clicking the link below:</p>
                   <a href="${verifyLink}">Verify Email</a>`
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

        // Check if account is verified
        if (!user.isAccountVerified) {
            return res.status(200).json({
                success: false,
                message: "Please verify your email before logging in",
                user: { email: user.email, name: user.name } // optional
            });
        }

        // Generate token if verified
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
            user: { name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("--- LOGIN ERROR ---", error);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(400).json({ success: false, message: "No token provided" });

        // Ensure req.user is set via your auth middleware
        const user = await userModel.findById(req.user.id);
        if (user) {
            // Completely remove the token field from the database
            await userModel.updateOne(
                { _id: req.user.id },
                { $unset: { token: "" } } // This deletes the token field
            );
        }

        // Clear cookie
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



export const verifyEmail = async (req, res) => {
    const { token } = req.body;

    // Find user with this token
    const user = await userModel.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ success: false, message: "Invalid token" });

    // Check token expiry
    if (user.verificationTokenExpires < Date.now())
        return res.status(400).json({ success: false, message: "Token expired" });

    // Mark account as verified
    user.isAccountVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Return user role
    return res.status(200).json({ success: true, role: user.role });
}
// --- Send Password Reset OTP ---
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(req.body);
        console.log("EMAIL_USER:", process.env.SMTP_USER);
console.log("EMAIL_PASS:", process.env.SMTP_PASS ? "****" : "MISSING");

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(200).json({ success: false, message: "No user found with this email" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 600000; // 10 minutes
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
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