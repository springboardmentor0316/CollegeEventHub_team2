// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Using Gmail as the email service
//     auth: {
//         user: process.env.SMTP_USER,    // Your Gmail address from .env
//         pass: process.env.SMTP_PASS, // Your App Password from .env
//     },
// });

// export default transporter;


import nodemailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config();

const transporter=nodemailer.createTransport({
    host:"smtp-relay.brevo.com",
    port:587,
    secure:false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
});

export default transporter;