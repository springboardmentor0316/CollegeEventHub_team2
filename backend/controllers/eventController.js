
import Event from "../models/eventModel.js";
export const createEvent = async (req, res) => {
  try {
    // Use req.user.id instead of req.body.userId
    const event = new Event({ ...req.body, createdBy: req.user.id });
    if (req.body.draft) {
      event.draft = true;
      event.published = false;
    } else {
      event.draft = false;
      event.published = true;
    }
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
    res.json({ success: true, events });
  } catch (err) {
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


// Add this controller function
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check if the user owns this event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this event" });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      { ...req.body },
      { new: true }
    );
    
    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};