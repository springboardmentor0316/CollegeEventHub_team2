
import express from "express"
import {login,logout,register,verifyEmail,resetPassword,sendResetOtp} from "../controllers/authController.js"
import userAuth from "../middleware/userAuth.js";

const authRouter=express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
// authRouter.post('/verify-account',userAuth,);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);

export default authRouter;