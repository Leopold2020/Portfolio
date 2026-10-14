import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { db } from "../database/index.js";
import { categories } from "../database/schema.js";
import { AppError } from "../middleware/error.middleware.js";
import type { Category } from "../types/event.js";
import { insertCategory } from "../utils/categories.js";
import { validateCategoryId, validateCategoryName, validateOptionalDescription } from "../utils/input-validation.js";

// POST /event-categories - Create a new category
export const createCategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = request.body;

    const validatedName = validateCategoryName(name);
    const validatedDescription = validateOptionalDescription(description);

    const category = await insertCategory(validatedName, validatedDescription);

    response.status(201).json({
      data: category,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// GET /event-categories - Get all categories
export const getCategories = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);

    response.status(200).json({
      data: allCategories,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// GET /event-categories/:id - Get a category by id
export const getCategoryById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const id = validateCategoryId(request.params["id"]);

    const [category] = await db.select().from(categories).where(eq(categories.id, id));

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    response.status(200).json({
      data: category,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /event-categories/:id - Replace all fields on a category (full update)
export const replaceCategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const id = validateCategoryId(request.params["id"]);
    const { name, description } = request.body;

    const validatedName = validateCategoryName(name);

    const [existingCategory] = await db.select().from(categories).where(eq(categories.id, id));

    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    const validatedDescription = validateOptionalDescription(description);

    const [updatedCategory] = await db
      .update(categories)
      .set({
        description: validatedDescription,
        name: validatedName,
        slug: slugify(validatedName, { lower: true, strict: true }),
      })
      .where(eq(categories.id, id))
      .returning();

    response.status(200).json({
      data: updatedCategory,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /event-categories/:id - Update category fields (partial update)
export const updateCategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const id = validateCategoryId(request.params["id"]);
    const { name, description } = request.body;

    if (name === undefined && description === undefined) {
      throw new AppError("At least one field must be provided to update a category", 400);
    }

    const [existingCategory] = await db.select().from(categories).where(eq(categories.id, id));

    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    const updateData: Partial<Category> = {};
    if (name !== undefined) {
      const validatedName = validateCategoryName(name);
      updateData.name = validatedName;
      updateData.slug = slugify(validatedName, { lower: true, strict: true });
    }
    if (description !== undefined) {
      updateData.description = validateOptionalDescription(description);
    }

    const [updatedCategory] = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning();

    response.status(200).json({
      data: updatedCategory,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /event-categories/:id - Delete a category
export const deleteCategory = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const id = validateCategoryId(request.params["id"]);

    const [existingCategory] = await db.select().from(categories).where(eq(categories.id, id));

    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    await db.delete(categories).where(eq(categories.id, id));

    response.status(200).json({
      message: "Category deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
