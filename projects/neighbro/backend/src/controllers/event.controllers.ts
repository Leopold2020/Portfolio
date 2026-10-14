import { and, count, eq, gte, ilike, inArray, lte, type SQL, sql } from "drizzle-orm";
import type { NextFunction, Response } from "express";
import { db } from "../database/index.js";
import { categories, eventCategories, events, userEvents } from "../database/schema.js";
import { AppError } from "../middleware/error.middleware.js";
import type { AuthRequest } from "../types/auth-request.js";
import type { EventFieldsToUpdate } from "../types/event.js";
import {
  validateCategoryParameter,
  validateEventId,
  validateEventName,
  validateLatitude,
  validateLongitude,
  validateOptionalAddress,
  validateOptionalDescription,
  validateRadius,
  validateStringField,
  validateTimestamp,
  validateUserId,
} from "../utils/input-validation.js";

const EARTH_RADIUS_KM = 6371; // Haversine formula

const eventSelect = {
  address: events.address,
  description: events.description,
  endTime: events.endTime,
  id: events.id,
  latitude: events.latitude,
  longitude: events.longitude,
  name: events.name,
  ownerId: events.ownerId,
  startTime: events.startTime,
};

const verifyCategoriesExist = async (categoryIds: string[]): Promise<void> => {
  if (categoryIds.length === 0) return;
  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.id, categoryIds));
  if (existingCategories.length !== categoryIds.length) {
    throw new AppError("One or more category IDs do not exist", 400);
  }
};

const verifyIsEventOwner = (ownerId: string, userId: string): void => {
  if (ownerId !== userId) {
    throw new AppError("You do not have permission to modify this event", 403);
  }
};

// POST /events - Create a new event
export const createEvent = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const ownerId = validateUserId(request.userId);

    const { name, description, startTime, endTime, latitude, longitude, address, categories } = request.body;

    if (
      name === undefined ||
      startTime === undefined ||
      endTime === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      throw new AppError("name, startTime, endTime, latitude, and longitude are required", 400);
    }

    const validatedName = validateEventName(name);
    const validatedStartTime = validateTimestamp(startTime, "startTime");
    const validatedEndTime = validateTimestamp(endTime, "endTime");

    if (validatedStartTime <= new Date()) {
      throw new AppError("startTime must be in the future", 400);
    }

    if (validatedEndTime <= validatedStartTime) {
      throw new AppError("endTime must be after startTime", 400);
    }

    const validatedLatitude = validateLatitude(latitude);
    const validatedLongitude = validateLongitude(longitude);
    const validatedDescription = validateOptionalDescription(description);
    const validatedAddress = validateOptionalAddress(address);

    let validatedCategoryIds: string[] = [];
    if (categories !== undefined) {
      validatedCategoryIds = validateCategoryParameter(categories);
    }

    await verifyCategoriesExist(validatedCategoryIds);

    const result = await db
      .insert(events)
      .values({
        address: validatedAddress,
        description: validatedDescription,
        endTime: validatedEndTime,
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        name: validatedName,
        ownerId,
        startTime: validatedStartTime,
      })
      .returning(eventSelect);

    const event = result[0];
    if (event?.id) {
      await db.insert(userEvents).values({ eventId: event.id, userId: ownerId });

      if (validatedCategoryIds.length > 0) {
        await Promise.all(
          validatedCategoryIds.map((id) =>
            db.insert(eventCategories).values({
              categoryId: id,
              eventId: event.id,
            }),
          ),
        );
      }
    }

    response.status(201).json({ event: result[0], message: "Event created successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// GET /events - List all events (use ?filter= with a filter to filter, HA!)
export const getEvents = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      latitude,
      longitude,
      radius,
      name,
      description,
      ownerId,
      startBefore,
      startAfter,
      endBefore,
      endAfter,
      categories,
      attending,
      owned,
    } = request.query;

    // Cannot leave out any geo, must use all!

    const hasAnyGeoParam = latitude !== undefined || longitude !== undefined || radius !== undefined;
    const hasAllGeoParams = latitude !== undefined && longitude !== undefined && radius !== undefined;

    if (hasAnyGeoParam && !hasAllGeoParams) {
      throw new AppError("latitude, longitude, and radius must all be provided together", 400);
    }

    const appliedFilters: SQL<unknown>[] = [];

    if (hasAllGeoParams) {
      const validatedLatitude = validateLatitude(latitude);
      const validatedLongitude = validateLongitude(longitude);
      const validatedRadius = validateRadius(radius);

      // Ladies and gentlemen: The Haversine formula!
      appliedFilters.push(sql`${EARTH_RADIUS_KM} * acos(
        LEAST(1.0,
          cos(radians(${validatedLatitude})) * cos(radians(${events.latitude})) * cos(radians(${events.longitude}) - radians(${validatedLongitude})) +
          sin(radians(${validatedLatitude})) * sin(radians(${events.latitude}))
        )
      ) <= ${validatedRadius}`);
    }

    if (name !== undefined) {
      const validatedName = validateEventName(name);
      appliedFilters.push(ilike(events.name, `%${validatedName}%`));
    }

    if (description !== undefined) {
      const validatedDescription = validateStringField(description, "description");
      appliedFilters.push(ilike(events.description, `%${validatedDescription}%`));
    }

    if (ownerId !== undefined) {
      const validatedOwnerId = validateUserId(ownerId);
      appliedFilters.push(eq(events.ownerId, validatedOwnerId));
    }

    if (startAfter !== undefined) {
      const validatedStartAfter = validateTimestamp(startAfter, "startAfter");
      appliedFilters.push(gte(events.startTime, validatedStartAfter));
    }

    if (startBefore !== undefined) {
      const validatedStartBefore = validateTimestamp(startBefore, "startBefore");
      appliedFilters.push(lte(events.startTime, validatedStartBefore));
    }

    if (endAfter !== undefined) {
      const validatedEndAfter = validateTimestamp(endAfter, "endAfter");
      appliedFilters.push(gte(events.endTime, validatedEndAfter));
    }

    if (endBefore !== undefined) {
      const validatedEndBefore = validateTimestamp(endBefore, "endBefore");
      appliedFilters.push(lte(events.endTime, validatedEndBefore));
    }

    if (categories !== undefined) {
      const categoryIds = validateCategoryParameter(categories);
      appliedFilters.push(
        inArray(
          events.id,
          db
            .select({ id: eventCategories.eventId })
            .from(eventCategories)
            .where(inArray(eventCategories.categoryId, categoryIds)),
        ),
      );
    }

    if (attending === "true" || owned === "true") {
      const userId = validateUserId(request.userId);

      if (attending === "true") {
        appliedFilters.push(
          inArray(
            events.id,
            db.select({ id: userEvents.eventId }).from(userEvents).where(eq(userEvents.userId, userId)),
          ),
        );
      }

      if (owned === "true") {
        appliedFilters.push(eq(events.ownerId, userId));
      }
    }

    const result = await db
      .select({
        ...eventSelect,
        categories:
          sql`COALESCE(array_agg(DISTINCT ${eventCategories.categoryId}) FILTER (WHERE ${eventCategories.categoryId} IS NOT NULL), '{}'::uuid[])`.as(
            "categories",
          ),
      })
      .from(events)
      .leftJoin(eventCategories, eq(events.id, eventCategories.eventId))
      .where(and(...appliedFilters))
      .groupBy(events.id);

    response.json({ message: "Events fetched successfully", result, success: true });
  } catch (error) {
    next(error);
  }
};

// GET /events/:id - Get a single event with participant count
export const getEventById = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = validateEventId(request.params["id"]);

    const result = await db
      .select({
        ...eventSelect,
        categories:
          sql`COALESCE(array_agg(DISTINCT ${eventCategories.categoryId}) FILTER (WHERE ${eventCategories.categoryId} IS NOT NULL), '{}'::uuid[])`.as(
            "categories",
          ),
        participantCount: count(userEvents.userId),
      })
      .from(events)
      .where(eq(events.id, eventId))
      .leftJoin(eventCategories, eq(events.id, eventCategories.eventId))
      .leftJoin(userEvents, eq(events.id, userEvents.eventId))
      .groupBy(
        events.address,
        events.description,
        events.endTime,
        events.id,
        events.latitude,
        events.longitude,
        events.name,
        events.ownerId,
        events.startTime,
      );

    if (result.length === 0) {
      throw new AppError("No event with that id could be found", 404);
    }

    response.json({ event: result[0], message: "Event fetched successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// PUT /events/:id - Replace all event fields (owner only)
export const replaceEvent = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = validateEventId(request.params["id"]);
    const userId = validateUserId(request.userId);

    const [existingEvent] = await db.select({ ownerId: events.ownerId }).from(events).where(eq(events.id, eventId));

    if (!existingEvent) {
      throw new AppError("No event with that id could be found", 404);
    }

    verifyIsEventOwner(existingEvent.ownerId, userId);

    const { name, description, startTime, endTime, latitude, longitude, address, categories } = request.body;

    if (
      name === undefined ||
      startTime === undefined ||
      endTime === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      throw new AppError("name, startTime, endTime, latitude, and longitude are required", 400);
    }

    const validatedName = validateEventName(name);
    const validatedStartTime = validateTimestamp(startTime, "startTime");
    const validatedEndTime = validateTimestamp(endTime, "endTime");

    if (validatedStartTime <= new Date()) {
      throw new AppError("startTime must be in the future", 400);
    }

    if (validatedEndTime <= validatedStartTime) {
      throw new AppError("endTime must be after startTime", 400);
    }

    const validatedLatitude = validateLatitude(latitude);
    const validatedLongitude = validateLongitude(longitude);
    const validatedDescription = validateOptionalDescription(description);
    const validatedAddress = validateOptionalAddress(address);

    let validatedCategoryIds: string[] = [];
    if (categories !== undefined) {
      validatedCategoryIds = validateCategoryParameter(categories);
    }

    await verifyCategoriesExist(validatedCategoryIds);

    const result = await db
      .update(events)
      .set({
        address: validatedAddress,
        description: validatedDescription,
        endTime: validatedEndTime,
        latitude: validatedLatitude,
        longitude: validatedLongitude,
        name: validatedName,
        startTime: validatedStartTime,
      })
      .where(eq(events.id, eventId))
      .returning(eventSelect);

    const event = result[0];
    if (event?.id) {
      // Replace all categories (PUT semantics: full replacement, so always clear first)
      await db.delete(eventCategories).where(eq(eventCategories.eventId, event.id));

      if (validatedCategoryIds.length > 0) {
        const values = validatedCategoryIds.map((categoryId) => ({
          categoryId,
          eventId: event.id,
        }));
        await db.insert(eventCategories).values(values);
      }
    }

    response.json({ event: result[0], message: "Event replaced successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// PATCH /events/:id - Partially update an event (owner only)
export const updateEvent = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = validateEventId(request.params["id"]);
    const userId = validateUserId(request.userId);

    const [existingEvent] = await db
      .select({ endTime: events.endTime, ownerId: events.ownerId, startTime: events.startTime })
      .from(events)
      .where(eq(events.id, eventId));

    if (!existingEvent) {
      throw new AppError("No event with that id could be found", 404);
    }

    verifyIsEventOwner(existingEvent.ownerId, userId);

    const { name, description, startTime, endTime, latitude, longitude, address, categories } = request.body;

    if (
      name === undefined &&
      description === undefined &&
      startTime === undefined &&
      endTime === undefined &&
      latitude === undefined &&
      longitude === undefined &&
      address === undefined &&
      categories === undefined
    ) {
      throw new AppError("At least one field must be provided to update an event", 400);
    }

    const fieldsToUpdate: EventFieldsToUpdate = {};

    if (name !== undefined) {
      fieldsToUpdate.name = validateEventName(name);
    }

    if (description !== undefined) {
      fieldsToUpdate.description = validateOptionalDescription(description);
    }

    if (startTime !== undefined) {
      fieldsToUpdate.startTime = validateTimestamp(startTime, "startTime");
    }

    if (endTime !== undefined) {
      fieldsToUpdate.endTime = validateTimestamp(endTime, "endTime");
    }

    let effectiveStartTime: Date;
    if (fieldsToUpdate.startTime !== undefined) {
      if (fieldsToUpdate.startTime <= new Date()) {
        throw new AppError("startTime must be in the future", 400);
      }
      effectiveStartTime = fieldsToUpdate.startTime;
    } else {
      effectiveStartTime = existingEvent.startTime;
    }

    let effectiveEndTime: Date;
    if (fieldsToUpdate.endTime !== undefined) {
      effectiveEndTime = fieldsToUpdate.endTime;
    } else {
      effectiveEndTime = existingEvent.endTime;
    }

    if (effectiveEndTime <= effectiveStartTime) {
      throw new AppError("endTime must be after startTime", 400);
    }

    if (latitude !== undefined) {
      fieldsToUpdate.latitude = validateLatitude(latitude);
    }

    if (longitude !== undefined) {
      fieldsToUpdate.longitude = validateLongitude(longitude);
    }

    if (address !== undefined) {
      fieldsToUpdate.address = validateOptionalAddress(address);
    }

    if (Object.keys(fieldsToUpdate).length > 0) {
      await db.update(events).set(fieldsToUpdate).where(eq(events.id, eventId));
    }

    if (categories !== undefined) {
      const validatedCategoryIds = validateCategoryParameter(categories);
      await verifyCategoriesExist(validatedCategoryIds);
      await db.delete(eventCategories).where(eq(eventCategories.eventId, eventId));
      if (validatedCategoryIds.length > 0) {
        const values = validatedCategoryIds.map((categoryId) => ({ categoryId, eventId }));
        await db.insert(eventCategories).values(values);
      }
    }

    const [updatedEvent] = await db.select(eventSelect).from(events).where(eq(events.id, eventId));
    response.json({ event: updatedEvent, message: "Event updated successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// DELETE /events/:id - Delete an event (owner only)
export const deleteEvent = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = validateEventId(request.params["id"]);
    const userId = validateUserId(request.userId);

    const [existingEvent] = await db.select({ ownerId: events.ownerId }).from(events).where(eq(events.id, eventId));

    if (!existingEvent) {
      throw new AppError("No event with that id could be found", 404);
    }

    verifyIsEventOwner(existingEvent.ownerId, userId);

    const [deletedEvent] = await db.delete(events).where(eq(events.id, eventId)).returning(eventSelect);

    response.json({ event: deletedEvent, message: "Event deleted successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// POST /events/:id/join - Current user joins an event
export const joinEvent = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = validateEventId(request.params["id"]);
    const userId = validateUserId(request.userId);

    const [event] = await db.select({ id: events.id }).from(events).where(eq(events.id, eventId));

    if (!event) {
      throw new AppError("No event with that id could be found", 404);
    }

    const [existingParticipation] = await db
      .select({ eventId: userEvents.eventId })
      .from(userEvents)
      .where(and(eq(userEvents.eventId, eventId), eq(userEvents.userId, userId)));

    if (existingParticipation) {
      throw new AppError("You have already joined this event", 409);
    }

    await db.insert(userEvents).values({ eventId, userId });

    response.status(201).json({ message: "Joined event successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// DELETE /events/:id/join - Current user leaves an event
export const leaveEvent = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = validateEventId(request.params["id"]);
    const userId = validateUserId(request.userId);

    const [event] = await db.select({ ownerId: events.ownerId }).from(events).where(eq(events.id, eventId));

    if (!event) {
      throw new AppError("No event with that id could be found", 404);
    }

    if (event.ownerId === userId) {
      throw new AppError("An event owner cannot leave their own event", 403);
    }

    const result = await db
      .delete(userEvents)
      .where(and(eq(userEvents.eventId, eventId), eq(userEvents.userId, userId)))
      .returning({ eventId: userEvents.eventId });

    if (result.length === 0) {
      throw new AppError("You are not a participant of this event", 404);
    }

    response.json({ message: "Left event successfully", success: true });
  } catch (error) {
    next(error);
  }
};
