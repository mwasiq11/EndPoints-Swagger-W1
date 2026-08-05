# FlyRank Backend W4 - Auth, Public, and Protected APIs

## Project Overview

This repository extends the existing FlyRank backend project with Supabase authentication, public and protected routes, Swagger bearer auth, and reusable middleware while preserving the earlier task API used in previous weeks.

The application uses Node.js, Express, PostgreSQL, Supabase Auth, dotenv, and swagger-ui-express.

## Installation

```bash
npm install
```

If you are starting from a clean environment, copy the example environment file first:

```bash
copy .env.example .env
```

## Environment Variables

Create a root `.env` file with the following values:

```env
DATABASE_URL=postgres://username:password@localhost:5432/tasks
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

Security notes:

- Keep `.env` uncommitted.
- Use the Supabase anon key only.
- Do not log passwords or tokens.

## Run Commands

```bash
npm start
```

If you use Docker:

```bash
docker compose up --build
```

## API Summary

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | /auth/signup | No | Create a new Supabase user |
| POST | /auth/login | No | Authenticate and return JWT tokens |
| POST | /auth/logout | Yes | Sign the current user out |
| GET | /public/info | No | Public informational message |
| GET | /protected/profile | Yes | Return the authenticated user's profile |
| GET | /protected/dashboard | Yes | Return a protected dashboard response |
| GET | /tasks | No | Existing task list endpoint |
| GET | /tasks/:id | No | Existing single task endpoint |
| POST | /tasks | No | Existing create task endpoint |
| PUT | /tasks/:id | No | Existing update task endpoint |
| DELETE | /tasks/:id | No | Existing delete task endpoint |
| GET | /docs | No | Swagger UI |
| GET | /openapi.json | No | Raw OpenAPI document |

## Authentication Flow

1. Sign up with `POST /auth/signup`.
2. Log in with `POST /auth/login`.
3. Copy the returned `access_token`.
4. Click **Authorize** in Swagger and paste the token as a Bearer token.
5. Call `GET /protected/profile`, `GET /protected/dashboard`, or `POST /auth/logout`.
6. After logout, the same token should be rejected on protected routes.

## Swagger

Swagger UI is available at `/docs` and exposes bearer authentication for protected routes.

![Swagger UI screenshot placeholder](docs/screenshots/swagger-ui.png)

## Folder Structure

```text
project/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── swagger/
│   ├── utils/
│   ├── app.js
│   ├── db.js
│   └── server.js
├── docs/
│   └── screenshots/
├── Dockerfile
├── compose.yaml
├── openapi.json
├── package.json
├── README.md
├── .env
└── .env.example
```

## Testing Instructions

Use these manual checks after providing valid Supabase credentials:

### Signup

- Valid email and password returns `201`.
- Missing email returns `400`.
- Missing password returns `400`.
- Duplicate email returns an error response.

### Login

- Valid credentials return `access_token`, `refresh_token`, and `user`.
- Wrong password returns `401`.
- Unknown email returns `401`.
- Empty fields return `400`.

### Public Route

- `GET /public/info` works without authentication.

### Protected Routes

- Missing token returns `401`.
- Malformed token returns `401`.
- Tampered or expired token returns `401`.
- Valid token returns profile and dashboard data.

### Logout

- Valid token returns `204`.
- Invalid or missing token returns `401`.

### Swagger

- Bearer auth lock icon is visible.
- Authorize works with a JWT.
- Protected endpoints can be called from Swagger after authorization.

## Git Commit Suggestions

- `feat(auth): add Supabase signup, login, and logout`
- `feat(routes): add public and protected endpoints with middleware`
- `docs: refresh README and OpenAPI specification`
- `chore: add environment example and Supabase dependencies`

## Security Notes

- `.env` is ignored by Git.
- `.env.example` is committed for setup only.
- No password or token should be returned outside the required auth responses.
- No service role key is used in this implementation.

## Legacy Task API

The existing task endpoints remain available to preserve earlier assignment behavior and container workflow.
