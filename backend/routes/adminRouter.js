
import express from "express";
import { 
    getDashboardStats,
    getRecentActivities,
    getMyEvents,
    getAdminPendingRegistrations  // Add this
} from "../controllers/adminController.js";
import { getAnalytics } from '../controllers/analyticsController.js';
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/dashboard/stats", userAuth, getDashboardStats);
router.get("/dashboard/activities", userAuth, getRecentActivities);
router.get("/my-events", userAuth, getMyEvents);
router.get("/pending-registrations", userAuth, getAdminPendingRegistrations); // Add this route
router.get('/analytics', userAuth, getAnalytics);

export default router;