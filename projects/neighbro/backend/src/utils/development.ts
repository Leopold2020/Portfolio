import "dotenv/config";
import bcrypt from "bcrypt";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { reset, seed } from "drizzle-seed";
import { DatabaseError } from "pg";
import { v5 as uuidv5 } from "uuid";
import { db } from "../database/index.js";
import * as schema from "../database/schema.js";
import { AppError } from "../middleware/error.middleware.js";

const { events, userEvents, users } = schema;
const NAMESPACE = "7ff3ae50-6daa-453e-853c-26d1257d5ab9";

// Placed around stockholm
const EVENT_BOUNDS = {
  lat: { max: 59.4, min: 59.275 },
  lng: { max: 18.2, min: 17.95 },
};

export const resetDatabase = async (): Promise<void> => {
  console.log("Resetting database");
  return reset(db, schema);
};
interface TestUserDetails {
  username: string;
  password: string;
  email: string;
  displayName: string;
  dateOfBirth: string;
}

const getTestUserDetails = (): TestUserDetails => {
  const username = process.env["TESTUSER_USERNAME"] ?? "testuser";
  const password = process.env["TESTUSER_PASSWORD"] ?? "testuser";
  const email = process.env["TESTUSER_EMAIL"] ?? "test@example.com";
  const displayName = process.env["TESTUSER_DISPLAY_NAME"] ?? "Bobson Dugnutt";
  const dateOfBirth = process.env["TESTUSER_DATE_OF_BIRTH"] ?? "1970-01-01";

  return { dateOfBirth, displayName, email, password, username };
};

const createTestUser = async (): Promise<
  ({ unhashedPassword?: string } & typeof schema.users.$inferSelect) | undefined
> => {
  console.log("Creating test user...");
  if (process.env["NODE_ENV"] !== "development") {
    throw new AppError("Cannot create test user in non-development environment");
  }
  const testUserDetails = getTestUserDetails();

  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, testUserDetails.email))
    .limit(1);
  if (existingUser.length > 0) {
    console.log("Test user already exists, skipping creation");
    return existingUser[0];
  }

  const [createdUser] = await db
    .insert(schema.users)
    .values({
      ...testUserDetails,
      // Should be deterministic based on username, also helps avoid collisions with uuidv4
      id: uuidv5(testUserDetails.username, NAMESPACE),
      password: await bcrypt.hash(testUserDetails.password, 10),
    })
    .returning();
  if (!createdUser) {
    throw new AppError("Failed to create test user");
  }
  console.log("Test user created");
  return { ...createdUser, unhashedPassword: testUserDetails.password };
};

const seedUser = async (userId: string): Promise<void> => {
  // get existing events
  const existingEventsIds = await db
    .select({ id: events.id })
    .from(events)
    .then((result) => result.map((event) => event.id));

  // Seed with 5 events for the test user to own and join
  // a different seed is used to avoid conflicts with existing data
  await seed(db, { events, userEvents }, { count: 5, seed: 2 }).refine((funcs) => ({
    // Make the testuser own 5 events
    events: {
      columns: {
        description: funcs.loremIpsum(),
        endTime: funcs.date({ minDate: new Date() }),
        latitude: funcs.number({ maxValue: EVENT_BOUNDS.lat.max, minValue: EVENT_BOUNDS.lat.min, precision: 100000 }),
        longitude: funcs.number({ maxValue: EVENT_BOUNDS.lng.max, minValue: EVENT_BOUNDS.lng.min, precision: 100000 }),
        name: funcs.companyName(),
        ownerId: funcs.default({ defaultValue: userId }),
        startTime: funcs.date({ minDate: new Date() }),
      },
    },
    // Make the testuser join some events
    userEvents: {
      columns: {
        eventId: funcs.valuesFromArray({ values: existingEventsIds }),
        userId: funcs.default({ defaultValue: userId }),
      },
    },
  }));
};

export const seedDatabase = async (reset: boolean, testUser: boolean): ReturnType<typeof createTestUser> => {
  try {
    if (reset) {
      await resetDatabase();
    }
    console.log("Seeding database");
    await seed(db, { events, userEvents, users }).refine((funcs) => ({
      events: {
        columns: {
          description: funcs.loremIpsum(),
          // I wonder if you can make better ranges for start and end times
          endTime: funcs.date({ minDate: new Date() }),
          // should be valid geo coordinates atleast
          // we can try to make more locally focused later
          latitude: funcs.number({ maxValue: EVENT_BOUNDS.lat.max, minValue: EVENT_BOUNDS.lat.min, precision: 100000 }),
          longitude: funcs.number({
            maxValue: EVENT_BOUNDS.lng.max,
            minValue: EVENT_BOUNDS.lng.min,
            precision: 100000,
          }),
          // Might be funnier than more lorem ipsum
          name: funcs.companyName(),
          startTime: funcs.date({ minDate: new Date() }),
        },
      },
      users: {
        columns: {
          // Not sure how many avatars we are gonna end up with
          avatarId: funcs.int({ maxValue: 5, minValue: 0 }),
          // Just ensure everyone is 18+, too hard to do dynamically
          dateOfBirth: funcs.date({ maxDate: new Date("2008-01-01") }),
          // limit to a reasonable number of events
          eventsJoined: funcs.int({ maxValue: 50, minValue: 0 }),
          // the rest are already configured properly or don't matter to us
        },
        with: {
          events: 10,
        },
      },
    }));
    console.log("Database seeded successfully");

    // if testuser should be created and seeded
    if (testUser) {
      const createdTestUser = await createTestUser();
      if (!createdTestUser) throw new AppError("Could not create or find test user");
      const testUserId = createdTestUser.id;
      await seedUser(testUserId);
      console.log("Test user seeded successfully");
      // unhashedPassword is only available after the user is created
      if (createdTestUser.unhashedPassword) {
        console.log("Test User Credentials:");
        console.log("Username:", createdTestUser.username);
        console.log("Password:", createdTestUser.unhashedPassword);
      }
      return createdTestUser;
    }
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      const cause = error.cause;
      // unique violation in Postgres, usually fine here since drizzle tries to insert the same data every time
      if (cause instanceof DatabaseError && cause.code === "23505") {
        console.log("Could not seed database due to conflicts, if this is unexpected, try resetting the database");
        return;
      }
    }
    throw error; // Re-throw other errors
  }
};
