
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        console.log("📊 Fetching dashboard stats for user:", req.user.id);
        
        // Get events created by current user
        const userEvents = await Event.find({ createdBy: req.user.id });
        const userEventIds = userEvents.map(event => event._id);

        // Total events created by user
        const totalEvents = userEvents.length;
        
        // Active users (users who have registered for user's events)
        const activeUsers = await Registration.distinct('user', {
            event: { $in: userEventIds }
        });

        // This month's registrations for user's events
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyRegistrations = await Registration.countDocuments({
            event: { $in: userEventIds },
            createdAt: { $gte: startOfMonth }
        });

        // Event completion rate (events that have ended vs total events)
        const completedEvents = await Event.countDocuments({
            createdBy: req.user.id,
            endDate: { $lt: new Date() }
        });
        
        const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

        console.log("✅ Stats calculated:", {
            totalEvents,
            activeUsers: activeUsers.length,
            monthlyRegistrations,
            completionRate
        });

        res.json({
            totalEvents,
            activeUsers: activeUsers.length,
            monthlyRegistrations,
            completionRate
        });

    } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending registrations for admin's events only
export const getAdminPendingRegistrations = async (req, res) => {
    try {
        console.log("📋 Fetching pending registrations for admin:", req.user.id);
        
        // Get events created by current user
        const userEvents = await Event.find({ createdBy: req.user.id });
        const userEventIds = userEvents.map(event => event._id);

        console.log("🎯 User event IDs:", userEventIds);

        const registrations = await Registration.find({ 
            status: 'pending',
            event: { $in: userEventIds }
        })
        .populate('event', 'title startDate startTime venue')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

        console.log(`✅ Found ${registrations.length} pending registrations for admin`);

        res.json({ 
            success: true, 
            registrations 
        });

    } catch (error) {
        console.error("❌ Error fetching admin pending registrations:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get recent activities for admin's events
export const getRecentActivities = async (req, res) => {
    try {
        console.log("📝 Fetching recent activities for admin:", req.user.id);
        
        // Get events created by current user
        const userEvents = await Event.find({ createdBy: req.user.id });
        const userEventIds = userEvents.map(event => event._id);

        // Get recent registrations for user's events (last 5)
        const recentRegistrations = await Registration.find({
            event: { $in: userEventIds }
        })
        .populate('event', 'title')
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

        // Get recent events created by user (last 5)
        const recentEvents = await Event.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Format activities
        const activities = [
            // From registrations
            ...recentRegistrations.map(reg => ({
                message: `New registration for "${reg.event?.title || 'Unknown Event'}"`,
                by: reg.user?.name || 'Unknown User',
                timestamp: formatRelativeTime(reg.createdAt)
            })),
            // From events
            ...recentEvents.map(event => ({
                message: `Event "${event.title}" ${event.published ? 'published' : 'created'}`,
                by: 'You',
                timestamp: formatRelativeTime(event.createdAt)
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
         .slice(0, 10); // Get top 10 most recent

        console.log(`✅ Found ${activities.length} recent activities`);

        res.json({ success: true, activities });

    } catch (error) {
        console.error("❌ Error fetching activities:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get events created by current user
export const getMyEvents = async (req, res) => {
    try {
        console.log("🎯 Fetching events created by user:", req.user.id);
        
        const events = await Event.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${events.length} events for user`);

        res.json({ 
            success: true, 
            events 
        });
    } catch (error) {
        console.error("❌ Error fetching user events:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching events" 
        });
    }
};

// Get all events for admin management
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, events });

    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get event analytics
export const getEventAnalytics = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify the event belongs to the current user
        const event = await Event.findOne({ 
            _id: eventId, 
            createdBy: req.user.id 
        });
        
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const registrations = await Registration.find({ event: eventId })
            .populate('user', 'name email');

        const statusCounts = {
            pending: registrations.filter(r => r.status === 'pending').length,
            approved: registrations.filter(r => r.status === 'approved').length,
            rejected: registrations.filter(r => r.status === 'rejected').length,
            cancelled: registrations.filter(r => r.status === 'cancelled').length
        };

        res.json({
            success: true,
            analytics: {
                event: {
                    title: event.title,
                    capacity: event.capacity,
                    registered: registrations.length,
                    availability: event.capacity - registrations.filter(r => 
                        r.status === 'pending' || r.status === 'approved').length
                },
                statusCounts,
                registrations: registrations.slice(0, 50) // Limit for performance
            }
        });

    } catch (error) {
        console.error("Error fetching event analytics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all users who registered for admin's events
export const getAllUsers = async (req, res) => {
    try {
        // Get events created by current user
        const userEvents = await Event.find({ createdBy: req.user.id });
        const userEventIds = userEvents.map(event => event._id);

        // Get unique users who registered for admin's events
        const userRegistrations = await Registration.find({
            event: { $in: userEventIds }
        }).populate('user', 'name email college createdAt');

        const uniqueUsersMap = new Map();
        userRegistrations.forEach(reg => {
            if (reg.user && !uniqueUsersMap.has(reg.user._id.toString())) {
                uniqueUsersMap.set(reg.user._id.toString(), {
                    ...reg.user.toObject(),
                    registrationCount: 1
                });
            } else if (reg.user) {
                const user = uniqueUsersMap.get(reg.user._id.toString());
                user.registrationCount += 1;
            }
        });

        const users = Array.from(uniqueUsersMap.values());

        res.json({ success: true, users });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Utility function to format relative time
function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return new Date(date).toLocaleDateString();
}