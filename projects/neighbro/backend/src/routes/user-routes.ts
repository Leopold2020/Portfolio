import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  reportUser,
  updateUserFull,
  updateUserPartial,
} from "../controllers/user.controllers.js";
import { authenticate, requireSelf } from "../middleware/auth.middleware.js";

const router = Router();

// GET /users - Get all users
router.get("/", authenticate, getAllUsers);

// GET /users/:id - Get a specific user by id
router.get("/:id", authenticate, getUserById);

// GET /users/me - Get currentUser
router.get("/me", authenticate, requireSelf, getCurrentUser);

// PUT /users/:id - Replace all fields on a user
router.put("/:id", authenticate, requireSelf, updateUserFull);

// PATCH /users/:id - Update specific fields on a user
router.patch("/:id", authenticate, requireSelf, updateUserPartial);

// DELETE /users/:id - Delete a user
router.delete("/:id", authenticate, requireSelf, deleteUser);

// POST /users/report - Report a user
router.post("/report", authenticate, reportUser);

export default router;
