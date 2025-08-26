import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type:String, required: true, unique:true},
    password: {type: String, required: true},
    college: { type: String, required: true },   
    role: { 
        type: String, 
        enum: ["student", "college_admin"], 
        default: "student"                   
    },
    verifyOtp: {type: String, default: ''},
    verifyOtpExpiresAt: {type: Number, default: 0},
    isAccountVerified: {type:Boolean, default: false},
    resetOtp: {type: String, default: ''},
    resetOtpExpiresAt: {type: Number, default: 0}
});

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel;