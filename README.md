# Project Task Board

Full-stack task management app built with React, ASP.NET Core Web API, SQLite, and Entity Framework Core.

## Features

- Manage projects (create, list, update, delete)
- Manage tasks under each project
- Task filtering (status/priority), sorting, and pagination
- Task comments (add/delete)
- Dashboard statistics:
  - Total projects
  - Total tasks
  - Tasks by status
  - Overdue tasks
  - Tasks due in next 7 days
- Global exception handling and structured validation responses
- Seed data and automatic timestamps via `SaveChangesAsync`

## Tech Stack

- Frontend: React + Hooks + React Router + Axios
- Backend: ASP.NET Core Web API (.NET 10)
- DB: SQLite
- ORM: Entity Framework Core

## Project Structure

```text
Project_Task/
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── SeedData.cs
│   ├── Middleware/
│   ├── Migrations/
│   └── Program.cs
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        ├── context/
        ├── services/
        └── App.jsx
```

## Prerequisites

- .NET SDK (`10.x`)
- Node.js + npm

## Backend Setup

```bash
cd backend
PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/dotnet restore
PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/dotnet build
PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/dotnet run
```

Backend runs on:

- `http://localhost:5062`

Database migrations are automatically applied at startup, and seed data is inserted if database is empty.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

## Environment (Frontend)

Optional `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5062/api
```

If not provided, frontend defaults to `http://localhost:5062/api`.

## API Endpoints

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

### Tasks

- `GET /api/projects/{projectId}/tasks`
- `POST /api/projects/{projectId}/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

### Comments

- `GET /api/tasks/{taskId}/comments`
- `POST /api/tasks/{taskId}/comments`
- `DELETE /api/comments/{id}`

### Dashboard

- `GET /api/dashboard`

## Pagination Format

```json
{
  "data": [],
  "page": 1,
  "pageSize": 10,
  "totalCount": 50,
  "totalPages": 5
}
```

## Validation and Error Handling

- Uses status codes: `200`, `201`, `400`, `404`, `409`, `500`
- Structured validation responses for invalid model state
- Global exception middleware prevents stack trace leaks in API responses
