
import express from "express";
import { 
    registerForEvent, 
    getEventRegistrations, 
    updateRegistrationStatus, 
    getUserRegistrations,
    cancelRegistration,
    getRegistrationStatus,
    getPendingRegistrations
} from "../controllers/registrationController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Student routes
router.post("/register/:eventId", userAuth, registerForEvent);
router.get("/my-registrations", userAuth, getUserRegistrations);
router.put("/cancel/:registrationId", userAuth, cancelRegistration);
router.get("/event/:eventId/status", userAuth, getRegistrationStatus);

// Admin routes (for event creators to manage their event registrations)
router.get("/event/:eventId", userAuth, getEventRegistrations);
router.put("/:registrationId/status", userAuth, updateRegistrationStatus);
router.get("/pending", userAuth, getPendingRegistrations);

export default router;