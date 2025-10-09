
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
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
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Prevent duplicate reviews for same registration
reviewSchema.index({ registration: 1 }, { unique: true });

// Compound index for event ratings
reviewSchema.index({ event: 1, rating: 1 });

// Index for admin queries
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVisible: 1 });

export default mongoose.model("Review", reviewSchema);