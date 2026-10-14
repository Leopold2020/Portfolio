# Backend guide

## Start docker and the dev server

```sh
pnpm run server
```

## Some guidelines

### Naming

1. Use kebab-case for files and folders
2. Use camelCase for variables, functions and methods
3. Use PascalCase for class names and constructors
4. Use SCREAMING_SNAKE_CASE for named constants, like fixed primitive values (numbers, strings, and booleans)
5. Use descriptive names for all identifiers. Never use single-letter or abbreviated names like `e`, `err`, `cb`, `res` or `req` (or similar)

### Code structure

1. Use single-responsibility functions (each function should do one thing only)
2. Use guard clauses and early returns (place logical NOT before a condition) by inverting the condition and return early instead of nesting
3. Always define functions before their first use (no hoisting)
4. Use explicit if-else logic. Avoid ternaries and compact expressions. If something can be written as if/else statements, it should be
5. Avoid duplicate code and don't repeat logic: if the same logic exists in more than one place, extract it into a single shared function in the appropriate folder (e.g. utils/, services/, middleware/ et cetera)

### Readability

1. Write code so clear that even a non-developer could follow the broad logic
2. Write code as if the reader has no prior experience with the codebase
3. Prefer clarity over cleverness, at ALL times!
4. Avoid hacky, clever or "magic" solutions - if it needs a comment to explain why it works, you should definitely rewrite it!
5. Aim to write clean, readable and self documenting code (as self-explanatory as possible)
6. Use comments when the logic is non obvious. However, keep comments brief and to the point

### Error handling

1. Use try-catch for operations that might fail and make sure to always use `throw new Error("message")` instead of `throw "message"`

### TypeScript

1. Use interface instead of type when possible
2. Use explicit return types on exported functions (add `: type` after the parameters) to make it clear what we're exporting
3. Define types and interfaces that are shared across multiple files in the types/ folder. Types used only by or within a single file should be defined and live in that file

## Database

### Check if the container is running

```sh
docker ps
```

### Stop the database

```sh
docker compose down
```

### Wipe all data

```sh
docker compose down -v
```

### Connect to the database directly

```sh
docker exec -it cc-db psql -U admin -d cc
```

### Useful psql commands

| Command | Description |
| --- | --- |
| `\dt` | List all tables |
| `\conninfo` | Show current connection info |
| `\q` | Quit |

## Lint and format

```sh
pnpm run lint-format
```

## Current routes

### Health

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **GET** | `/api/health` | Health check |

### Auth

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **POST** | `/api/auth/sign-up` | Create account |
| **POST** | `/api/auth/sign-in` | Login |

### Users

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **GET** | `/api/users` | Get all users |
| **GET** | `/api/users/:id` | Get specific user |
| **PUT** | `/api/users/:id` | Replace user |
| **PATCH** | `/api/users/:id` | Update user fields |
| **DELETE** | `/api/users/:id` | Delete user |

### Events

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **POST** | `/api/events` | Create event |
| **GET** | `/api/events` | Get all events (can be filtered, see further down) |
| **GET** | `/api/events/:id` | Get event with participant count |
| **PUT** | `/api/events/:id` | Replace event (owner only) |
| **PATCH** | `/api/events/:id` | Update event fields (owner only) |
| **DELETE** | `/api/events/:id` | Delete event (owner only) |
| **POST** | `/api/events/:id/join` | Join event |
| **DELETE** | `/api/events/:id/join` | Leave event |

### Categories

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **POST** | `/api/event-categories` | Create category |
| **GET** | `/api/event-categories` | Get all categories |
| **GET** | `/api/event-categories/:id` | Get category by id |
| **PUT** | `/api/event-categories/:id` | Replace category |
| **PATCH** | `/api/event-categories/:id` | Update category fields |
| **DELETE** | `/api/event-categories/:id` | Delete category |

## Testing

Make sure to create/update the table(s) from scratch before you test:

```sh
pnpm run db:push
```

You can test in Thunderclient! The typical testing flow is: sign up, then sign in, copy the token from the sign-in response and use it as a Bearer token for all other requests.

To launch Drizzle Studio, use:

```sh
pnpm run db:studio
```

A DrizzleKit migrate workflow is not yet implemented. If you're having trouble with the database, you can nuke it and start again!

## Nuking the DB

Run from the project's root directory:

### 1. Stop the container

Stop the container if it's running

```sh
docker compose -f backend/docker-compose.yaml down
```

### 2. Remove all Postgres data

Remove the pgdata volume.

```sh
docker volume rm backend_pgdata
```

### 3. Rebuild and start the container

```sh
docker compose -f backend/docker-compose.yaml up -d
```

### 4. Sync the schema to the database

Go into the backend folder and run `pnpm run db:push`

```sh
cd backend && pnpm run db:push

```

## Scripts

There are some scripts in `backend/scripts/` for quick and dirty testing (`;-)`). Run them with`node <script-name>.js` from the `backend/scripts/` folder.

- create-user.js
- create-category.js
- create-event.js
- nuke-database.js

### Create scripts

#### Create user

This script creates a user, signs that user in and prints the token to the console. Keep the prefilled info in `USER_DATA` or fill in your own.

Copy the token and use it in the other scripts to create categories and events.

```sh
node create-user.js
```

#### Create category

This script creates a category. Fill in `TOKEN` with the token from `create-user.js` and update `CATEGORY_DATA` with the category you want to create.

A UUID for the category will be printed to the console, save/copy it and use it when creating an event.

```sh
node create-category.js
```

#### Create event

This script creates an event. Fill in `TOKEN` with the token from `create-user.js`, fill in "categories" in`EVENT_DATA` with the category UUID (or remove it) and update `EVENT_DATA` with the event you want to create.

Keep in mind that adding a category is optional.

```sh
node create-event.js
```

### Nuke script

#### Nuke database

This script stops the container, wipes all data, rebuilds the container and re-syncs the schema. Use this when you want to nuke EVERYTHING with absolutely no way to recover any data.

```sh
node nuke-database.js
```

### 1. Sign up

#### 1.1 Request

Send a POST request to: <http://localhost:3000/api/auth/sign-up>.

##### 1.1.1 Request Body

```json
{
  "username": "michaelscott",
  "email": "manager@dundermifflin.com",
  "password": "threatlevelmidnight",
  "displayName": "Michael",
  "dateOfBirth": "2000-01-01"
}
```

#### 1.2 Response

##### 1.2.1 Response Body

```json
{
  "message": "User created successfully",
  "success": true
}
```

### 2. Sign in

#### 2.1 Request

Send a POST request to: <http://localhost:3000/api/auth/sign-in>.

##### 2.1.1 Request Body

```json
{
  "username": "michaelscott",
  "password": "threatlevelmidnight"
}
```

#### 2.2 Response

##### 2.2.1 Response Body

```json
{
  "message": "User signed in successfully",
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "<id>",
    "username": "michaelscott"
  }
}
```

### 3. Get all users

#### 3.1 Request

Send a GET request to: <http://localhost:3000/api/users>. Add the token from sign-in as a header:

##### 3.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

#### 3.2 Response

##### 3.2.1 Response Body

```json
{
  "message": "Users fetched successfully",
  "success": true,
  "result": [
    {
      "avatarId": null,
      "dateOfBirth": "2000-01-01",
      "displayName": "Michael",
      "email": "manager@dundermifflin.com",
      "eventsJoined": 0,
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "joinedAt": "2026-04-17T12:00:00.000Z",
      "lastActiveAt": "2026-04-17T12:00:00.000Z",
      "username": "michaelscott",
      "verifiedAt": null
    }
  ]
}
```

### 4. Get specific user

#### 4.1 Request

Send a GET request to: <http://localhost:3000/api/users/id>. Add the token from sign-in as a header:

##### 4.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

id (or UUID) is the massive alpha numeric string that represents each unique user in the database.

#### 4.2 Response

##### 4.2.1 Response Body

```json
{
  "message": "User fetched successfully",
  "success": true,
  "user": {
    "avatarId": null,
    "dateOfBirth": "2000-01-01",
    "displayName": "Michael",
    "email": "manager@dundermifflin.com",
    "eventsJoined": 0,
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "joinedAt": "2026-04-17T12:00:00.000Z",
    "lastActiveAt": "2026-04-17T12:00:00.000Z",
    "username": "michaelscott",
    "verifiedAt": null
  }
}
```

### 5. Replace user (PUT)

Replaces all fields on the user. You can only update your own account.

#### 5.1 Request

Send a PUT request to <http://localhost:3000/api/users/id> (replace with the actual user id). Add the token from sign-in as a header. Add the json as a body.

##### 5.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

##### 5.1.2 Request Body

```json
{
  "username": "newusername",
  "email": "newemail@dundermifflin.com",
  "displayName": "newdisplayname",
  "dateOfBirth": "2001-01-01",
  "avatarId": null,
  "eventsJoined": 0,
  "lastActiveAt": "2026-04-17T12:00:00.000Z",
  "isVerified": false
}
```

#### 5.2 Response

##### 5.2.1 Response Body

```json
{
  "user": {
    "avatarId": null,
    "dateOfBirth": "2001-01-01",
    "displayName": "newdisplayname",
    "email": "newemail@dundermifflin.com",
    "eventsJoined": 0,
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "joinedAt": "2026-04-17T12:00:00.000Z",
    "lastActiveAt": "2026-04-17T12:00:00.000Z",
    "username": "newusername",
    "verifiedAt": null
  }
}
```

### 6. Update user fields (PATCH)

Updates only the fields provided. You can only update your own account.

#### 6.1 Request

Send a PATCH request to <http://localhost:3000/api/users/id> (replace with your user id). Add the token from sign-in as a header:

##### 6.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

##### 6.1.2 Request Body

```json
{
  "username": "mike"
}
```

#### 6.2 Response

##### 6.2.1 Response Body

```json
{
  "message": "User partially updated successfully!",
  "success": true,
  "user": {
    "avatarId": null,
    "dateOfBirth": "2000-01-01",
    "displayName": "Michael",
    "email": "manager@dundermifflin.com",
    "eventsJoined": 0,
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "joinedAt": "2026-04-17T12:00:00.000Z",
    "lastActiveAt": "2026-04-17T12:00:00.000Z",
    "username": "mike",
    "verifiedAt": null
  }
}
```

### 7. Delete user

You can only delete your own account.

#### 7.1 Request

Send a DELETE request to: <http://localhost:3000/api/users/id> (replace with your user id). Add the token from sign-in as a header:

##### 7.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

#### 7.2 Response

##### 7.2.1 Response Body

```json
{
  "message": "User deleted successfully",
  "success": true,
  "user": {
    "email": "manager@dundermifflin.com",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "mike"
  }
}
```

### 8. Create event

Before you can create an event, there must exist at least one category. If no categories are set up, you can create one by sending a POST request to <http://localhost:3000/api/event-categories> with a valid user JWT token:

```json
{
  "name": "The Dundies",
  "description": "Annual Dunder Mifflin awards ceremony"
}
```

#### 8.1 Request

Send a POST request to: <http://localhost:3000/api/events>. Add the token from sign-in as a header.

##### 8.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

##### 8.1.2 Request Body

```json
{
  "name": "Office Olympics",
  "description": "Dunder Mifflin Office Olympics",
  "startTime": "2026-12-20T18:00:00.000Z",
  "endTime": "2026-12-20T22:00:00.000Z",
  "latitude": 41.4993,
  "longitude": -75.6603,
  "address": "1725 Slough Avenue, Scranton, PA 18503",
  "categories": "a97da218-0c4a-4dc1-96b2-cc24ed3da91e"
}
```

Required fields: name, startTime, endTime, latitude, longitude. startTime must be in the future and endTime must be after startTime. description, address, and categories are optional and can be omitted or set to null. Categories accepts a comma-separated list of category UUIDs. All provided category UUIDs must exist, otherwise a 400 error is returned.

#### 8.2 Response

##### 8.2.1 Response Body

```json
{
  "event": {
    "description": "Dunder Mifflin Office Olympics",
    "endTime": "2026-12-20T22:00:00.000Z",
    "id": "14cdfbe2-3ac3-42df-8ea0-c40fa671a204",
    "latitude": 41.4993,
    "longitude": -75.6603,
    "name": "Office Olympics",
    "ownerId": "be775a49-3d50-4051-8d92-90863b6fb4b9",
    "startTime": "2026-12-20T18:00:00.000Z"
  },
  "message": "Event created successfully",
  "success": true
}
```

### 9. Get all events

Returns all events. All query parameters are optional and can be combined freely.

Keep in mind that when you fetch for instance a name, you might need to encode the URL with "%20" (space) if the name contains spaces. E.g. "The Annual Dundie Awards" would become <http://localhost:3000/api/events?name=The%20Annual%20Dundie%20Awards>

#### 9.1 Latitude

This is part of the geo filter and must be used together with both longitude and radius.

- Parameter: latitude
- Type: Number
- Format: ?latitude=67.6767
- Example use: ?latitude=41.4993&longitude=-75.6603&radius=10

#### 9.2 Longitude

This is part of the geo filter and must be used together with both latitude and radius.

- Parameter: longitude
- Type: Number
- Format: ?longitude=-75.6603
- Example use: ?latitude=41.4993&longitude=-75.6603&radius=10

#### 9.3 Radius

This is part of the geo filter and must be used together with both latitude and longitude. The value is in kilometers.

- Parameter: radius
- Type: Number
- Format: ?radius=10
- Example use: ?latitude=41.4993&longitude=-75.6603&radius=10

#### 9.4 Name

Case-insensitive partial match on event name.

- Parameter: name
- Type: String
- Format: ?name=party
- Example use: ?name=party

#### 9.5 Description

Case-insensitive partial match on event description.

- Parameter: description
- Type: String
- Format: ?description=dunder
- Example use: ?description=dunder

#### 9.6 ownerId

Filter by a specific user's event(s), which is identified by UUID. Use when viewing another users profile or event list.

- Parameter: ownerId
- Type: UUID
- Format: ?ownerId=
- Example use: ?ownerId=550e8400-e29b-41d4-a716-446655440001

#### 9.7 attending

Filters events to only those the current user has joined. Must be the string "true" to take effect.

- Parameter: attending
- Type: Boolean string
- Format: ?attending=true
- Example use: ?attending=true

#### 9.8 owned

Filters events for the current user, without needing any UUID. This is basically "ownerId=UUID". Must be the string "true" to take effect.

- Parameter: owned
- Type: Boolean string
- Format: ?owned=true
- Example use: ?owned=true

#### 9.9 startAfter

Returns events starting after this timestamp.

- Parameter: startAfter
- Type: ISO 8601
- Format: ?startAfter=
- Example use: ?startAfter=2026-12-01T00:00:00.000Z

#### 9.10 startBefore

Returns events starting before this timestamp.

- Parameter: startBefore
- Type: ISO 8601
- Format: ?startBefore=
- Example use: ?startBefore=2026-12-31T23:59:59.999Z

#### 9.11 endAfter

Returns events ending after this timestamp.

- Parameter: endAfter
- Type: ISO 8601
- Format: ?endAfter=
- Example use: ?endAfter=2026-12-01T00:00:00.000Z

#### 9.12 endBefore

Returns events ending before this timestamp.

- Parameter: endBefore
- Type: ISO 8601
- Format: ?endBefore=
- Example use: ?endBefore=2026-12-31T23:59:59.999Z

#### 9.13 categories

Comma-separated list of category UUIDs (accepts only one category as well). Returns events matching any of the provided categories.

- Parameter: categories
- Type: UUID list
- Format: ?categories=uuid1,uuid2
- Example use: ?categories=550e8400-e29b-41d4-a716-446655440010,550e8400-e29b-41d4-a716-446655440011

#### 9.14 Request

Send a GET request to: <http://localhost:3000/api/events>. Add the token from sign-in as a header.

##### 9.14.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 9.15 Response

##### 9.15.1 Response Body

```json
{
  "message": "Events fetched successfully",
  "result": [
    {
      "categories": ["550e8400-e29b-41d4-a716-446655440010"],
      "description": "Annual Dunder Mifflin office party",
      "endTime": "2026-12-20T22:00:00.000Z",
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "latitude": 41.4993,
      "longitude": -75.6603,
      "name": "Office Party",
      "ownerId": "550e8400-e29b-41d4-a716-446655440001",
      "startTime": "2026-12-20T18:00:00.000Z"
    }
  ],
  "success": true
}
```

#### 9.16 Example filter combinations

- Geo filter (all three required together): `?latitude=41.4993&longitude=-75.6603&radius=10`
- Name search: `?name=fun%20fun`
- My attended events: `?attending=true`
- My upcoming attended events: `?attending=true&startAfter=2026-12-01T00:00:00.000Z`
- My owned events: `?owned=true`
- Combination: `?name=party&startAfter=2026-12-01T00:00:00.000Z&categories=68e0119d-2c81-49be-8b98-ed1a5a8dff17`

### 10. Get event by id

Returns a single event including the current number of participants.

#### 10.1 Request

Send a GET request to: <http://localhost:3000/api/events/id> (replace with the event id). Add the token from sign-in as a header.

##### 10.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 10.2 Response

##### 10.2.1 Response Body

```json
{
  "event": {
    "categories": ["550e8400-e29b-41d4-a716-446655440010"],
    "description": "Annual Dunder Mifflin office party",
    "endTime": "2026-12-20T22:00:00.000Z",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "latitude": 41.4993,
    "longitude": -75.6603,
    "name": "Office Party",
    "ownerId": "550e8400-e29b-41d4-a716-446655440001",
    "participantCount": 3,
    "startTime": "2026-12-20T18:00:00.000Z"
  },
  "message": "Event fetched successfully",
  "success": true
}
```

### 11. Replace event (PUT)

Replaces all fields on an event. You can only update events you own.

#### 11.1 Request

Send a PUT request to: <http://localhost:3000/api/events/id> (replace with the event id). Add the token from sign-in as a header.

##### 11.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

##### 11.1.2 Request Body

All fields except description and categories are required. startTime must be in the future and endTime must be after startTime. Omitting categories clears all existing categories from the event. All provided category UUIDs must exist, otherwise a 400 error is returned.

```json
{
  "name": "Office Party (Updated)",
  "description": null,
  "startTime": "2026-12-21T18:00:00.000Z",
  "endTime": "2026-12-21T23:00:00.000Z",
  "latitude": 41.4993,
  "longitude": -75.6603,
  "categories": "550e8400-e29b-41d4-a716-446655440010"
}
```

#### 11.2 Response

##### 11.2.1 Response Body

```json
{
  "event": {
    "description": null,
    "endTime": "2026-12-21T23:00:00.000Z",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "latitude": 41.4993,
    "longitude": -75.6603,
    "name": "Office Party (Updated)",
    "ownerId": "550e8400-e29b-41d4-a716-446655440001",
    "startTime": "2026-12-21T18:00:00.000Z"
  },
  "message": "Event replaced successfully",
  "success": true
}
```

### 12. Update event fields (PATCH)

Updates only the fields that are provided. You can only update events you own. At least one field must be provided.

#### 12.1 Request

Send a PATCH request to: <http://localhost:3000/api/events/id> (replace with the event id). Add the token from sign-in as a header.

##### 12.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

##### 12.1.2 Request Body

At least one field must be provided. If startTime is provided, it must be in the future and endTime must be after startTime. Categories accepts a comma-separated list of category UUIDs and replaces all existing categories when provided. All provided category UUIDs must exist, otherwise a 400 error is returned.

```json
{
  "name": "Holiday Party",
  "categories": "550e8400-e29b-41d4-a716-446655440010"
}
```

#### 12.2 Response

##### 12.2.1 Response Body

```json
{
  "event": {
    "description": null,
    "endTime": "2026-12-20T22:00:00.000Z",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "latitude": 41.4993,
    "longitude": -75.6603,
    "name": "Holiday Party",
    "ownerId": "550e8400-e29b-41d4-a716-446655440001",
    "startTime": "2026-12-20T18:00:00.000Z"
  },
  "message": "Event updated successfully",
  "success": true
}
```

### 13. Delete event

You can only delete events you own.

#### 13.1 Request

Send a DELETE request to: <http://localhost:3000/api/events/id> (replace with the event id). Add the token from sign-in as a header.

##### 13.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 13.2 Response

##### 13.2.1 Response Body

```json
{
  "event": {
    "description": "Annual Dunder Mifflin office party",
    "endTime": "2026-12-20T22:00:00.000Z",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "latitude": 41.4993,
    "longitude": -75.6603,
    "name": "Office Party",
    "ownerId": "550e8400-e29b-41d4-a716-446655440001",
    "startTime": "2026-12-20T18:00:00.000Z"
  },
  "message": "Event deleted successfully",
  "success": true
}
```

### 14. Join event

Adds the current user as a participant of an event. Returns 409 if the user has already joined.

#### 14.1 Request

Send a POST request to: <http://localhost:3000/api/events/id/join> (replace with the event id). Add the token from sign-in as a header.

##### 14.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 14.2 Response

##### 14.2.1 Response Body

```json
{
  "message": "Joined event successfully",
  "success": true
}
```

### 15. Leave event

Removes the current user as a participant from an event. Returns 404 if the user is not a participant.

#### 15.1 Request

Send a DELETE request to: <http://localhost:3000/api/events/id/join> (replace with the event id). Add the token from sign-in as a header.

##### 15.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 15.2 Response

##### 15.2.1 Response Body

```json
{
  "message": "Left event successfully",
  "success": true
}
```

### 16. Create category

Creates a new category. The slug is auto-generated from the name. Returns 409 if a category with the same name already exists.

#### 16.1 Request

Send a POST request to: <http://localhost:3000/api/event-categories>. Add the token from sign-in as a header.

##### 16.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

##### 16.1.2 Request Body

A description is optional and can be omitted.

```json
{
  "name": "Music",
  "description": "Events related to music and concerts"
}
```

#### 16.2 Response

##### 16.2.1 Response Body

```json
{
  "data": {
    "createdAt": "2026-04-17T12:00:00.000Z",
    "description": "Events related to music and concerts",
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Music",
    "slug": "music"
  },
  "success": true
}
```

### 17. Get all categories

Returns all categories ordered by name.

#### 17.1 Request

Send a GET request to: <http://localhost:3000/api/event-categories>. Add the token from sign-in as a header.

##### 17.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 17.2 Response

##### 17.2.1 Response Body

```json
{
  "data": [
    {
      "createdAt": "2026-05-05T20:29:15.698Z",
      "description": "Michael Scotts Dunder Mifflin Scranton Meredith Palmer Memorial Celebrity Rabies Awareness Pro-Am Fun Run Race For the Cure",
      "id": "68e0119d-2c81-49be-8b98-ed1a5a8dff17",
      "name": "Fun Run",
      "slug": "fun-run"
    },
    {
      "createdAt": "2026-05-05T19:45:30.406Z",
      "description": "Annual Dunder Mifflin awards ceremony",
      "id": "a97da218-0c4a-4dc1-96b2-cc24ed3da91e",
      "name": "The Dundies",
      "slug": "the-dundies"
    }
  ],
  "success": true
}
```

### 18. Get category by id

Returns a single category by its UUID. Returns 404 if not found.

#### 18.1 Request

Send a GET request to: <http://localhost:3000/api/event-categories/id> (replace with the category id). Add the token from sign-in as a header.

##### 18.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 18.2 Response

##### 18.2.1 Response Body

```json
{
  "data": {
    "createdAt": "2026-05-05T20:29:15.698Z",
    "description": "Michael Scotts Dunder Mifflin Scranton Meredith Palmer Memorial Celebrity Rabies Awareness Pro-Am Fun Run Race For the Cure",
    "id": "68e0119d-2c81-49be-8b98-ed1a5a8dff17",
    "name": "Fun Run",
    "slug": "fun-run"
  },
  "success": true
}
```

### 19. Replace category (PUT)

Replaces all category fields. Name is required. Description is cleared if not provided. The slug is automatically regenerated from the name. Returns 404 if not found.

#### 19.1 Request

Send a PUT request to: <http://localhost:3000/api/event-categories/id> (replace with the category id). Add the token from sign-in as a header.

##### 19.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

##### 19.1.2 Request Body

```json
{
  "name": "Carbo Loading"
}
```

#### 19.2 Response

##### 19.2.1 Response Body

```json
{
  "data": {
    "createdAt": "2026-05-05T20:29:15.698Z",
    "description": null,
    "id": "68e0119d-2c81-49be-8b98-ed1a5a8dff17",
    "name": "Carbo Loading",
    "slug": "carbo-loading"
  },
  "success": true
}
```

### 20. Update category fields (PATCH)

Updates only the fields provided. At least one of name or description must be provided. The slug is automatically regenerated if the name is updated. Returns 404 if not found.

#### 20.1 Request

Send a PATCH request to: <http://localhost:3000/api/event-categories/id> (replace with the category id). Add the token from sign-in as a header.

##### 20.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

##### 20.1.2 Request Body

At least one field must be provided.

```json
{
  "name": "Support the Rabid",
  "description": "Michael has created an event to alleviate his guilt over the accident and to address his superstitious belief that the office is cursed."
}
```

#### 20.2 Response

##### 20.2.1 Response Body

```json
{
  "data": {
    "createdAt": "2026-05-05T20:29:15.698Z",
    "description": "Michael has created an event to alleviate his guilt over the accident and to address his superstitious belief that the office is cursed.",
    "id": "68e0119d-2c81-49be-8b98-ed1a5a8dff17",
    "name": "Support the Rabid",
    "slug": "support-the-rabid"
  },
  "success": true
}
```

### 21. Delete category

Deletes a category by its UUID. Returns 404 if not found.

#### 21.1 Request

Send a DELETE request to: <http://localhost:3000/api/event-categories/id> (replace with the category id). Add the token from sign-in as a header.

##### 21.1.1 Request Header

- Key: Authorization
- Value: Bearer `token`

If this isn't working, and you're testing in Thunder Client, go to "Auth", select "Bearer" and paste the token (without the Bearer) into the field. The header will then get automatically added with your request.

#### 21.2 Response

##### 21.2.1 Response Body

```json
{
  "message": "Category deleted successfully",
  "success": true
}
```
