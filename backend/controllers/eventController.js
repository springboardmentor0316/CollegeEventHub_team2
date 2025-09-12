
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";

export const createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const event = new Event({ 
      ...req.body, 
      createdBy: req.user.id,
      creatorName: user.name, // Store creator name
      draft: req.body.draft || false,
      published: !req.body.draft // If it's not a draft, it's published
    });
    
    await event.save();
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    console.log("Incoming GET my_events"); 
    // Use req.user.id instead of req.body.userId
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    console.log("Found events:", events.length);
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error in getMyEvents:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add this controller function
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check if the user owns this event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
    }
    
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this event" });
    }
    
    // Handle draft/published status correctly
    const updateData = { ...req.body };
    
    if (updateData.draft !== undefined) {
      updateData.published = !updateData.draft;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    // Get all events, populate creator info
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};