import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';

const app=express();
const port=process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}));

//API Endpoints
app.get('/',(req,res)=>{
    res.send("API is working");
});
app.use('/api/auth',authRouter);

app.listen(port,()=>console.log(`Server started on ${port}`));