import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  joinEvent,
  leaveEvent,
  replaceEvent,
  updateEvent,
} from "../controllers/event.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// POST /events - Create a new event
router.post("/", authenticate, createEvent);

// GET /events - List all events (optional bounding box: ?latitude=&longitude=&radius=)
router.get("/", authenticate, getEvents);

// GET /events/:id - Get a single event with participant count
router.get("/:id", authenticate, getEventById);

// PUT /events/:id - Replace all event fields (owner only)
router.put("/:id", authenticate, replaceEvent);

// PATCH /events/:id - Partially update an event (owner only)
router.patch("/:id", authenticate, updateEvent);

// DELETE /events/:id - Delete an event (owner only)
router.delete("/:id", authenticate, deleteEvent);

// POST /events/:id/join - Current user joins an event
router.post("/:id/join", authenticate, joinEvent);

// DELETE /events/:id/join - Current user leaves an event
router.delete("/:id/join", authenticate, leaveEvent);

export default router;
