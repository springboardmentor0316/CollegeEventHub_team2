
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import Registration from "../models/registrationModel.js";
import Review from "../models/reviewModel.js";

export const createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const event = new Event({ 
      ...req.body, 
      createdBy: req.user.id,
      creatorName: user.name,
      draft: req.body.draft || false,
      published: !req.body.draft
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
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    console.log("Found events:", events.length);
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error in getMyEvents:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
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
    // Only fetch published events (not drafts)
    const events = await Event.find({ published: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    // Get registration counts for all events
    const eventIds = events.map(event => event._id);
    
    const registrationCounts = await Registration.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          status: { $in: ['pending', 'approved'] }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get review statistics for all events
    const reviewStats = await Review.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          isVisible: true
        }
      },
      {
        $group: {
          _id: '$event',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Create maps for easy lookup
    const registrationCountMap = {};
    registrationCounts.forEach(item => {
      registrationCountMap[item._id.toString()] = item.count;
    });

    const reviewStatsMap = {};
    reviewStats.forEach(item => {
      reviewStatsMap[item._id.toString()] = {
        reviewCount: item.reviewCount,
        averageRating: Math.round(item.averageRating * 10) / 10 || 0
      };
    });

    // Add registration counts and review stats to events
    const eventsWithStats = events.map(event => {
      const eventId = event._id.toString();
      const reviewStat = reviewStatsMap[eventId] || { reviewCount: 0, averageRating: 0 };
      
      return {
        ...event,
        registeredCount: registrationCountMap[eventId] || 0,
        reviewCount: reviewStat.reviewCount,
        averageRating: reviewStat.averageRating
      };
    });

    res.json({ success: true, events: eventsWithStats });

  } catch (err) {
    console.error("Error getting events:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};