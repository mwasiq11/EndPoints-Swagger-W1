# Task API

## Project Overview

This project is a CRUD task API built with Node.js, Express, and SQLite. It preserves the same endpoints and response formats as the original Week 2 assignment while moving storage from an in-memory array to a persistent SQLite database.

## Why SQLite

SQLite is a lightweight, single-file database that requires no separate server setup. It is easy to use for small applications and the database file persists across server restarts.

## Installation

```bash
npm install
npm install better-sqlite3
```

## Run

```bash
npm start
```

The app runs at `http://localhost:3000`.

## Database

The app automatically creates a file named `tasks.db` on startup if it does not already exist. It also creates the `tasks` table automatically and seeds it with three initial tasks the first time the database is created.

## Persistence

Tasks are stored in the SQLite database file, so they survive server restarts and remain available after the process is restarted.

## Project Structure

- `src/app.js` — Express route handlers and validation
- `src/db.js` — SQLite initialization, seeding, and query helpers
- `src/server.js` — server startup and shutdown handling
- `openapi.json` — Swagger/OpenAPI document
- `tasks.db` — SQLite database file created automatically

## Endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | / | Basic API info |
| GET | /health | Health check |
| GET | /tasks | List all tasks |
| GET | /tasks/:id | Return one task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |
| GET | /docs | Swagger UI |
| GET | /openapi.json | OpenAPI file |

## Example SQL

```sql
SELECT * FROM tasks;
```

This returns all tasks stored in the SQLite database.

## DB Browser Screenshot

A screenshot placeholder for assignment submission can be added here once the database is viewed in DB Browser for SQLite.

## Swagger Screenshot Placeholder

A screenshot placeholder for the Swagger UI can be added here for assignment submission.

## Status codes used

- `200` for reads and updates
- `201` for creating a task
- `204` for delete
- `400` for bad input
- `404` when the task id is not found
