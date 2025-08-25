// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import userModel from '../models/userModel.js';
// import transporter from '../config/nodemailer.js';

// export const register = async (req,res)=>{

//     const {name, email, password}=req.body;

//     if(!name || !email || !password){
//         return res.json({success: false, message: "Missing Details"});
//     }
//     try{
//         const existingUser = await userModel.findOne({email});
//         if(existingUser){
//             return res.json({success: false, message: "User already exists"});
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = new userModel({name, email, password:hashedPassword});
//         await user.save();

//         const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

//         res.cookie('token',token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             same_site: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//             maxAge: 7*24*60*60*1000
//         });
        
//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to:email,
//             subject: 'Account Verification',
//             text: `Welcome to Campus_Hub website. Your account has been created with email id: ${email}. Please verify your account by clicking the link below: http://localhost:3000/verify/${user._id}`
//         }

//         await transporter.sendMail(mailOptions);

//         return res.json({succes:true});

//     } catch(error){
//         res.json({success: false, message: error.message});
//     }
// }
// export const login = async (req,res)=>{
//     const {email, password} = req.body;

//     if(!email || !password){
//         return res.json({success:false, message: 'Email and password are reqired'});
//     }

//     try{
//         const user = await userModel.findOne({email});

//         if(!user){
//             return res.json({success: false, message: 'Invalid email'})
//         }
//         const isMatch = await bcrypt.compare(password, user.password);

//         if(!isMatch){
//             return res.json({success: false, message: 'Invalid password'});
//         }

//         const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'});

//         res.cookie('token',token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             same_site: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//             maxAge: 7*24*60*60*1000
//         });

//         return res.json({succes:true});

//     }catch(error){
//         return res.json({success: false,message: error.message});
//     }
// }

// export const logout = async (req,res)=>{
//     try{
//         res.clearCookie('token',{
//             httpOnly: true,
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//             secure: process.env.NODE_ENV === 'production',
//         })

//         return res.json({success: true, message: "Logged Out"});
        
//     }catch(error){
//         return res.json({success:false, message:error.message});
//     }
// }

// //send Verification otp to the users email
// export const sendVerifyOtp = async (req,res)=>{
//     try{
//         const {userId} = req.body;

//         const user=await userModel.findById(userId);

//         if(!user){
//             return res.json({success:false, message:"User not found"});
//         }

//         if(user.isAccountVerified){
//             return res.json({success:false, message:"Account already verified"});
//         }

//         const otp = String(Math.floor(100000 + Math.random() * 900000));

//         user.verifyOtp = otp;
//         user.verifyOtpExpiresAt = Date.now() + 24*60*60*1000;

//         await user.save();

//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to:user.email,
//             subject: 'Account Verification OTP',
//             text: `Your verification code is: ${otp}.verify your account using this code.`
//         }

//         await transporter.sendMail(mailOptions);

//         return res.json({success:true, message:"Verification code sent to your email"});

//     }catch(error){
//         return res.json({success:false, message:error.message});
//     }
// }

// export const verifyEmail = async(req,res)=>{
//     const {userId,otp} = req.body;
//     if(!userId || !otp){
//             return res.json({success:false, message:"Missing Details"});
//     }
//     try{
//         const user = await userModel.findById(userId);

//         if(!user){
//             return res.json({success:false, message:"User not found"});
//         }

//         if(user.verifyOtp === '' || user.verifyOtp != otp){
//             return res.json({success:false, message:"Invalid OTP"});
//         }

//         if(user.verifyOtpExpiresAt < Date.now()){
//             return res.json({success:false, message:"OTP Expired"});
//         }

//         user.isAccountVerified = true;
//         user.verifyOtp = '';
//         user.verifyOtpExpiresAt = 0;

//         await user.save();
//         return res.json({success:true, message:"Email Verified successfully"});

//     }catch(error){
//         res.json({success:false, message:error.message});
//     }
// }





import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register=async (req,res)=>{

    const {name,email,password,college,role}=req.body;

    if(!name || !email || !password || !college || !role){
        return res.json({success:false,message:"Missing Details"})
    }

    try{
        const existingUser=await userModel.findOne({email})

        if(existingUser){
            return res.json({success:false,message:"User already exists"});
        }

        const hashedPassword=await bcrypt.hash(password,10); //10 means level of authentication (low)5---15(high)

        const user=new userModel({name,email,password:hashedPassword,college,role});
        await user.save();

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });

        //sending email
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:'welcom to GreatStack',
            text:`Welcom to greatstack website .your account has been created with emailid:${email}`
        }
        await transporter.sendMail(mailOptions);
        res.json({success:true});
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}

export const login=async(req,res)=>{
     const {email,password}=req.body;

     if(!email || !password){
        return res.json({success:false,message:'Email and password are required'})
     }

     try{
        
         const user=await userModel.findOne({email});

         if(!user){
            return res.json({success:false,message:'Invalid email'})
         }

         const isMatch=await bcrypt.compare(password,user.password);
         if(!isMatch){
            return res.json({success:false,message:'Invalid password'});
         }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        });
        res.json({success:true});

     }
     catch(error){
        return res.json({success:false,message:error.message});
     }
}

export const logout=async (req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
        })
        return res.json({success:true,message:"Logged Out"})

    }catch(error){
        return res.json({success:false,message:error.message});
    }
}


export const sendVerifyOtp=async (req,res)=>{
    try{
        const {userId}=req.body;
        const user=await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false,message:"Account already verified!"});
        }
        const otp=String(Math.floor(100000+Math.random()*900000));

        user.verifyOtp=otp;
        user.verifyOtpExpiresAt=Date.now()+24*60*60*1000;

        await user.save();

        const mailOption={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Account Verification OtP',
            text:`your otp is ${otp}. verify your account using this otp`,
        }
        await transporter.sendMail(mailOption);
        res.json({success:true,message:"verification Otp sent on Email"});

    }catch(error){
        res.json({success:false,message:error.message});
    }
}

//verification of otp
export const verifyEmail=async (req,res)=>{
    const {userId,otp}=req.body;

    if(!userId || !otp){
        return res.json({success:false,message:"missing Details"});
    }
    try{
        const user=await userModel.findById(userId);

        if(!user){
            return res.json({success:false,message:"user not found"});
        }
        if(user.verifyOtp==='' || user.verifyOtp!=otp){
            return res.json({success:false,message:"Invalid OTP"});
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false,message:"OTP EXPIRED"});
        }
        user.isAccountVerified=true;
        user.verifyOtp="";
        user.verifyOtpExpireAt=0;

        await user.save();
        return res.json({success:true,message:'Email verified successfully'});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}

//check if user is authenticated
export const isAuthenticated=async (req,res)=>{
    try{
        return res.json({success:true});
    }
    catch(error){
        return res.json({success:false,message:error.message});
    }
}

//send password reset otp
export const sendResetOtp=async (req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({success:false,message:"Email is required"});
    }
    try{
       const user=await userModel.findOne({email});
       if(!user){
        return res.json({success:false,message:"User not found"});
       }

       const otp=String(Math.floor(100000+Math.random()*900000));

        user.resetOtp=otp;
        user.resetOtpExpiresAt=Date.now()+24*60*60*1000;

        await user.save();

        const mailOption={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Password Reset Otp',
            text:`your otp is ${otp}. use this otp to reset your password`,
        }
        await transporter.sendMail(mailOption);
        return res.json({success:true,message:"Password reset otp sent on email"});
    }
    catch(error){
        return res.json({success:false,message:error.message});
    }
}

//reset user password
export const resetPassword=async (req,res)=>{
    const {email,otp,newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false,message:'Email,otp,and new password are required'});
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User not found"});
        }
        if(user.resetOtp=="" || user.resetOtp!=otp){
            return res.json({success:false,message:"Invalid OTP"});
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false,message:"otp Expired"});
        }
        const hashedPassword=await bcrypt.hash(newPassword,10);

        user.password=hashedPassword;
        user.resetOtp='';
        user.resetOtpExpireAt=0;

        await user.save();

        return res.json({success:true, message:"Password has been reset successfully"});
    }
    catch(error){
        return res.json({success:false,message:error.message});
    }
}