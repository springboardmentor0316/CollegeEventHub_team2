
import express from "express";
import { createEvent, getMyEvents ,deleteEvent ,updateEvent ,getAllEvents} from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create_event", userAuth, createEvent);
router.get("/my_events", userAuth, getMyEvents);
router.delete("/delete_event/:eventId", userAuth, deleteEvent);
router.put("/update_event/:eventId", userAuth, updateEvent);
router.get("/all_events", userAuth, getAllEvents);

export default router;
