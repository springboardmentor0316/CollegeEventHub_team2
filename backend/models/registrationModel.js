import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  notes: { 
    type: String 
  },
  // Additional fields for registration form if needed
  phoneNumber: { type: String },
  collegeId: { type: String },
  department: { type: String },
  year: { type: String }
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);