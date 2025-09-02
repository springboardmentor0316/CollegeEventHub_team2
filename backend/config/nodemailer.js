import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail as the email service
    auth: {
        user: process.env.SENDER_EMAIL,    // Your Gmail address from .env
        pass: process.env.SENDER_PASSWORD, // Your App Password from .env
    },
});

export default transporter;