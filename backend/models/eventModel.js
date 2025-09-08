import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  capacity: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  price: { type: Number, default: 0 },
  regDeadline: { type: Date },
  image: { type: String },
  requirements: { type: String },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  draft: { type: Boolean, default: false },
  published: { type: Boolean, default: false }
});

export default mongoose.model("Event", eventSchema);
