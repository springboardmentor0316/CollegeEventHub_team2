
import express from "express";
import { createEvent, getMyEvents ,deleteEvent ,updateEvent} from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create_event", userAuth, createEvent);
router.post("/my_events", userAuth, getMyEvents);
router.delete("/delete_event/:eventId", userAuth, deleteEvent);
router.put("/update_event/:eventId", userAuth, updateEvent);

export default router;
