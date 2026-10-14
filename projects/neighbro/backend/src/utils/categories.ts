import { reset } from "drizzle-seed";
import slugify from "slugify";
import { db } from "../database/index.js";
import { categories } from "../database/schema.js";

export const insertCategory = async (name: string, description?: string | null, uuid?: string) => {
  // Auto-generate slug from name
  const slug = slugify(name, { lower: true, strict: true });

  const [category] = await db
    .insert(categories)
    .values({
      description,
      id: uuid,
      name,
      slug,
    })
    .returning();

  return category;
};

/**
 * resets categories and inserts predefined categories
 */
export const createCategories = async () => {
  try {
    await reset(db, { categories });
    for (const category of PREDEFINED_CATEGORIES) {
      await insertCategory(category.name, category.description, category.uuid);
    }
  } catch (error) {
    console.error("Failed to create categories:", error);
  }
};

/*
 * Predefined categories
 * uuids generated using https://www.uuidgenerator.net/
 * uuids are generated before insertion to ensure they stay the same
 * This means we can update the categories here without it generating a new uuid
 */
export const PREDEFINED_CATEGORIES = [
  {
    description: "Dinners, coffee breaks, cooking, or tasting events. Anything enjoyed around a table.",
    name: "Food & Drinks",
    uuid: "b50cef03-33b9-43b6-9405-7f1ace6c8c88",
  },
  {
    description: "Casual drinks, food, and socializing with colleagues or friends.",
    name: "After Work",
    uuid: "e7939cb1-ec9f-43f1-9af7-8f00b388b4b5",
  },
  {
    description: "Catch a live match, visit the arena, or gather around a screen to cheer for your favorite team.",
    name: "Sports Event",
    uuid: "de7eb1c5-052b-405d-8e93-edde46e71c40",
  },
  {
    description: "Anything that gets your heart rate up",
    name: "Exercise & Phyiscal Activity",
    uuid: "53dfb4a6-2eab-43b4-acc8-cd9b59fa5e59",
  },

  {
    description: "Museums, theater, movies, concerts, and exhibitions. For experiencing art and creativity.",
    name: "Cultural",
    uuid: "41d5bd19-8908-4dc5-8a89-8c96183bc2b9",
  },
  {
    description: "Casual get-togethers, board game nights, good conversations, or just relaxing in good company.",
    name: "Social, Hangout & Company",
    uuid: "336ccc07-1197-421f-bd48-af755949ebc2",
  },
  {
    description: "Dive into your passions—whether it's gaming, crafting, tinkering, or creative projects.",
    name: "Hobbies & Interests",
    uuid: "66d394a3-05ec-4d62-b95b-07fe945cf9b3",
  },
  {
    description: "Give or get a helping hand with moving, rides, assembling furniture, or everyday chores.",
    name: "Help & Favours",
    uuid: "898fced4-7b6d-4cb3-8ba7-0bba8b913c9e",
  },
  {
    description: "Study sessions, coding groups, skill-sharing, or learning something new together.",
    name: "Studies, Homework & Workshops",
    uuid: "2ebc7221-551c-454d-8803-837419629202",
  },
  {
    description: "Dog walks, hiking, camping, and everything connected to the outdoors and wildlife",
    name: "Animals & Nature",
    uuid: "05b4932b-5049-41df-bf63-dde36450e287",
  },
] as const;
