# Task API – Week 3 (SQLite Database Integration)

## Project Overview

This project is the Week 3 continuation of the Week 2 CRUD API. It is built with Node.js and Express, and the storage layer has been migrated from an in-memory array to SQLite so the API now persists data across server restarts.

The API behavior remains the same as the Week 2 assignment, but the task data is now stored in a real database instead of temporary memory.

## Features

- Express REST API
- SQLite database integration
- Persistent storage
- Automatic database creation
- Automatic table creation
- Automatic seed data initialization
- Full CRUD operations
- Input validation
- Proper HTTP status codes
- Parameterized SQL queries
- Swagger/OpenAPI documentation

## Technologies Used

- Node.js
- Express.js
- better-sqlite3
- SQLite
- Swagger UI / OpenAPI

## Why SQLite?

SQLite was chosen because it is:

- lightweight
- serverless
- easy to set up
- stored in a single database file
- fast for small applications
- ideal for simple CRUD projects
- reliable for persistence across restarts

## Installation

```bash
git clone <repository-url>

cd <project-folder>

npm install
```

The required database dependency is included in the project package configuration.

## Running the Project

```bash
npm start
```

The app runs at `http://localhost:3000`.

## Database

This project uses SQLite.

The database file `tasks.db` is automatically created the first time the application starts.

No manual database setup is required.

The application automatically:

- creates the database file
- creates the `tasks` table
- inserts three example tasks only when the table is empty

Restarting the server does not duplicate the seed data.

## Persistence

In Week 2, data disappeared after the server restarted because the tasks were stored in memory.

In Week 3, data remains after restart because the tasks are stored in the SQLite database file `tasks.db`.

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | / | API information |
| GET | /health | Health check |
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |
| GET | /docs | Swagger UI |
| GET | /openapi.json | OpenAPI documentation |

## Request and Response Examples

### GET /tasks

```json
[
  {
    "id": 1,
    "title": "Learn Express",
    "done": false
  }
]
```

### POST /tasks

```json
{
  "title": "Finish assignment"
}
```

Response:

```json
{
  "id": 4,
  "title": "Finish assignment",
  "done": false
}
```

### PUT /tasks/:id

```json
{
  "done": true
}
```

### DELETE /tasks/:id

Returns no response body and responds with HTTP 204.

## Status Codes

| Status Code | Meaning |
| --- | --- |
| 200 OK | Request succeeded |
| 201 Created | Task successfully created |
| 204 No Content | Task successfully deleted |
| 400 Bad Request | Invalid input or request body |
| 404 Not Found | Task not found |

## SQL Example

```sql
SELECT * FROM tasks;
```

This query returns all tasks stored in the SQLite database.

## DB Browser Screenshot

![DB Browser view of tasks.db](docs/screenshots/tasks-json.png)

## Swagger Screenshot

![Swagger UI documentation](docs/screenshots/swagger-ui.png)

## Project Structure

```text
project/
├── src/
│   ├── app.js
│   ├── db.js
│   └── server.js
├── openapi.json
├── package.json
├── tasks.db  (auto-created)
└── README.md
```

## Automatic Database Creation

Deleting `tasks.db` and restarting the application will automatically recreate:

- the database file
- the `tasks` table
- the seed data

No manual setup is required.

## Git Ignore

The database file `tasks.db` is usually added to `.gitignore` so each cloned copy creates its own local database.

## Assignment Requirements Covered

This project satisfies the Week 3 assignment requirements by including:

- SQLite storage
- Persistent data after restart
- Automatic database creation
- Automatic table creation
- Seed data only once
- Same API behavior as Week 2
- Parameterized SQL queries
- CRUD operations
- Validation
- Correct HTTP status codes
