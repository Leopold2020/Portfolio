import { relations, sql } from "drizzle-orm";
import {
  date,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// object tables
export const users = pgTable("users", {
  avatarId: integer("avatar_id").default(0),
  bio: varchar("bio", { length: 510 }).notNull().default(""),
  dateOfBirth: date("date_of_birth").notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  eventsJoined: integer("events_joined").default(0),
  id: uuid("id").primaryKey().defaultRandom(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  password: varchar("password", { length: 72 }).notNull(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at", { withTimezone: true }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

export const events = pgTable(
  "events",
  {
    address: text("address"),
    description: text("description"),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    name: varchar("name", { length: 255 }),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  },
  () => [sql`CHECK (end_time > start_time)`],
);

export const categories = pgTable("categories", {
  createdAt: timestamp("created_at").defaultNow(),
  description: varchar("description", { length: 500 }),
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const eventCategories = pgTable(
  "event_categories",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.categoryId, table.eventId] })],
);

export const userEvents = pgTable(
  "user_events",
  {
    createdAt: timestamp("created_at").defaultNow(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })],
);

export const reports = pgTable("reports", {
  createdAt: timestamp("created_at").defaultNow(),
  reason: varchar("reason", {}),
  reportedUserId: uuid("reported_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reporterUserId: uuid("reporter_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// relations
export const eventsRelations = relations(events, ({ many }) => ({
  categories: many(eventCategories),
  users: many(userEvents),
}));

export const userRelations = relations(events, ({ many }) => ({
  events: many(eventCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  events: many(eventCategories),
}));

// union relations

export const eventCategoriesRelations = relations(eventCategories, ({ one }) => ({
  category: one(categories, {
    fields: [eventCategories.categoryId],
    references: [categories.id],
  }),
  events: one(events, {
    fields: [eventCategories.eventId],
    references: [events.id],
  }),
}));

export const userEventsRelations = relations(userEvents, ({ one }) => ({
  events: one(events, {
    fields: [userEvents.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [userEvents.userId],
    references: [users.id],
    relationName: "owner",
  }),
}));
