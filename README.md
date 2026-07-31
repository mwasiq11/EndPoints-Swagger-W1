# Task API – Week 3 (PostgreSQL & Docker Integration)

## Project Overview

This project is the Week 3 continuation of the Week 2 CRUD API. It is built with Node.js and Express, and the storage layer has been migrated from an embedded SQLite database to PostgreSQL using connection pooling so the API persists data across container and server restarts.

The API behavior remains identical to the Week 2 assignment, but the task data is now stored in a production-ready PostgreSQL database orchestrated via Docker and Docker Compose using multi-stage Alpine builds.

## Features

- Express REST API
- PostgreSQL database integration with connection pooling
- Docker & Docker Compose containerization
- Multi-stage Alpine build architecture
- Persistent storage using Docker named volume (`taskdata`)
- Environment variable configuration (`.env`)
- Automatic table creation on startup
- Automatic non-duplicating seed data initialization
- Full CRUD operations
- Input validation & proper HTTP status codes
- Parameterized SQL queries (zero SQL string concatenation)
- Swagger/OpenAPI documentation

## Technologies Used

- Node.js & Express.js
- PostgreSQL & official `pg` package (node-postgres)
- Docker & Docker Compose
- Swagger UI / OpenAPI

## Why PostgreSQL & Docker?

PostgreSQL and Docker were chosen because they provide:

- robust, production-grade relational data handling
- efficient client connection pooling via `pg.Pool`
- containerized isolation ensuring reproducible builds across machines
- lightweight image footprint using Alpine Linux multi-stage builds
- zero-config multi-container startup using Docker Compose
- seamless persistence using Docker volumes

## Environment Variables

The database connection string is configured via environment variables to avoid hardcoded credentials.

Create a `.env` file in the root directory (copied from `.env.example`):

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

Inside Docker Compose, the API service automatically connects via the internal network hostname using:
`postgres://postgres:dev@db:5432/tasks`

## Running the Project with Docker Compose

The easiest and recommended way to start up the full application suite (API + PostgreSQL Database) is via Docker Compose:

```bash
docker compose up --build
```

To run in detached (background) mode:

```bash
docker compose up -d --build
```

The services will initialize as follows:
- **API Service**: Runs on `http://localhost:3000` (port `3000` exposed)
- **Database Service**: PostgreSQL runs on port `5432` exposed locally and internally as `db:5432`
- **Swagger Documentation**: Available at `http://localhost:3000/docs`

## Local Installation (Without Docker)

If you have a local PostgreSQL instance running on port `5432`:

```bash
git clone <repository-url>
cd <project-folder>
npm install
npm start
```

## Database & Persistence

This project uses PostgreSQL. When the application starts, it automatically connects to the PostgreSQL database with built-in retry logic (handling container startup order in Docker Compose).

No manual database setup is required. The application automatically:
- connects to PostgreSQL
- creates the `tasks` table if it does not already exist
- inserts three example tasks only when the table is completely empty

### Docker Volume Persistence

Data remains persistent across container restarts or teardowns because PostgreSQL data is mounted to a Docker named volume called `taskdata` (`/var/lib/postgresql/data`). Restarting the Docker containers does not duplicate the seed data or wipe created tasks.

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

## Parameterized SQL Examples

All database queries strictly utilize PostgreSQL parameter placeholders (`$1`, `$2`, `$3`) to guarantee security against SQL injection:

```sql
SELECT * FROM tasks;

SELECT * FROM tasks WHERE id = $1;

INSERT INTO tasks(title, done)
VALUES($1, $2)
RETURNING *;

UPDATE tasks
SET title = $1,
    done = $2
WHERE id = $3
RETURNING *;

DELETE FROM tasks
WHERE id = $1;
```

## Database Client Screenshot

![PostgreSQL DB Client view of tasks table](docs/screenshots/postgres-tasks.png)

## Swagger Screenshot

![Swagger UI documentation](docs/screenshots/swagger-ui.png)

## Project Structure

```text
project/
├── src/
│   ├── app.js      (Unmodified route definitions & business logic)
│   ├── db.js       (Migrated PostgreSQL pg pool repository layer)
│   └── server.js   (Unmodified server launcher & graceful shutdown)
├── Dockerfile      (Multi-stage Alpine build configuration)
├── compose.yaml    (Docker Compose orchestration with volume persistence)
├── .env            (Local environment credentials - gitignored)
├── .env.example    (Template environment configuration)
├── openapi.json    (Unmodified OpenAPI specification)
├── package.json    (Updated dependencies: pg installed, sqlite removed)
└── README.md
```

## Git Ignore & Environment Configuration

The local `.env` file containing actual connection URLs is added to `.gitignore` so credentials are never committed. An `.env.example` file is tracked in Git to guide developers on required environment variables.

## Assignment Requirements Covered

This project strictly satisfies the Week 3 assignment requirements by featuring:
- Migration from SQLite to PostgreSQL storage layer
- Official `pg` connection pool implementation
- Complete Docker support (`Dockerfile` and `compose.yaml` with Alpine multi-stage builds)
- Persistent Docker named volume (`taskdata`)
- Environment variable connection configuration (`DATABASE_URL`)
- Automatic table creation and one-time non-duplicating seed initialization
- Identical API behavior, routes, status codes, validation, and Swagger docs as Week 2
- 100% Parameterized SQL queries with zero string concatenation
