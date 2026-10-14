import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  replaceCategory,
  updateCategory,
} from "../controllers/category.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", replaceCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
