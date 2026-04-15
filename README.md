# Project Task Board

A full-stack task management application built for the Junior Full-Stack Developer take-home assignment.

Users can:
- Organize tasks under projects
- Track progress through statuses
- Add comments to tasks

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: ASP.NET Core Web API (.NET 10)
- Database: SQLite
- ORM: Entity Framework Core + migrations

## Implemented Requirements

### Data Model

- `Project`: `Id`, `Name` (unique), `Description`, `CreatedAt`
- `Task`: `Id`, `ProjectId`, `Title`, `Description`, `Priority`, `Status`, `DueDate`, `CreatedAt`, `UpdatedAt`
- `Comment`: `Id`, `TaskId`, `Author`, `Body`, `CreatedAt`

### Relationships and Cascade Rules

- `Project` -> many `Tasks`
- `Task` -> one `Project`
- `Task` -> many `Comments`
- Delete `Project` -> deletes related `Tasks` and `Comments`
- Delete `Task` -> deletes related `Comments`

### API Endpoints

#### Projects
- `GET /api/projects` (includes per-project `taskCount` and status summary)
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

#### Tasks
- `GET /api/projects/{projectId}/tasks`
- `POST /api/projects/{projectId}/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

#### Comments
- `GET /api/tasks/{taskId}/comments`
- `POST /api/tasks/{taskId}/comments`
- `DELETE /api/comments/{id}`

#### Dashboard
- `GET /api/dashboard`
- Returns: total projects, total tasks, tasks by status, overdue tasks, tasks due within 7 days

### Filtering, Sorting, Pagination

Task list endpoint supports:
- `status`
- `priority`
- `sortBy`: `dueDate`, `priority`, `createdAt`
- `sortDir`: `asc`, `desc`
- `page` (default `1`)
- `pageSize` (default `10`, max `50`)

Pagination response format:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 10,
  "totalCount": 50,
  "totalPages": 5
}
```

### Validation and Error Handling

- Status codes used: `200`, `201`, `400`, `404`, `409`, `500`
- Structured model validation errors in JSON
- Global exception middleware
- No stack trace exposed in API responses

### Persistence

- SQLite database
- EF Core migrations
- At least one migration (`InitialCreate`)
- Migrations auto-applied on startup
- Seed data on first run
- Auto timestamps handled in `SaveChangesAsync`

## Frontend Views

- Dashboard
  - Total tasks/projects, status breakdown, overdue tasks, upcoming tasks
- Project List
  - Project cards with name, description, task summary
- Task Board
  - List/Kanban style board, filters, sorting, pagination, task preview
- Task Detail
  - Full task info, edit form, comments section
- Add/Edit Forms
  - Project form and task form with validation errors

## Frontend Technical Notes

- Functional components only
- Hooks used: `useState`, `useEffect`, `useContext`
- Custom hook: `useApi`
- React Context: shared app refresh/theme state
- React Router: `/dashboard`, `/projects`, `/projects/:id`, `/tasks/:id`
- Loading and error handling across pages
- Confirmation dialogs for destructive actions

## Project Structure

```text
project-task-board/
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/
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

## How to Run

### Prerequisites

- .NET SDK `10.x`
- Node.js + npm

### 1) Start Backend

From repository root:

```bash
dotnet run --project backend/backend.csproj
```

Backend URL:
- `http://localhost:5062`

### 2) Start Frontend

In a second terminal from repository root:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Frontend URL:
- `http://localhost:5173`

### Frontend Environment Variable (Optional)

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5062/api
```

If not set, frontend defaults to `http://localhost:5062/api`.

## Build Commands

From repository root:

```bash
dotnet build backend/backend.csproj
npm --prefix frontend run build
```

## Notes

- Build artifacts under `backend/bin` and `backend/obj` are generated files and should not be committed as source changes.

## Frontend Screenshots

### Light Theme
![Light Theme - Dashboard](<screenshots/Screenshot 2026-04-15 at 1.29.54 PM.png>)
![Light Theme - Projects Page](<screenshots/Screenshot 2026-04-15 at 1.36.33 PM.png>)
![Light Theme - Task Board](<screenshots/Screenshot 2026-04-15 at 1.37.21 PM.png>)
![Light Theme - Task Board Filters](<screenshots/Screenshot 2026-04-15 at 1.38.09 PM.png>)
![Light Theme - Task Detail](<screenshots/Screenshot 2026-04-15 at 1.38.48 PM.png>)
![Light Theme - Create/Edit Task Form](<screenshots/Screenshot 2026-04-15 at 1.39.26 PM.png>)

### Dark Theme
![Dark Theme - Dashboard](<screenshots/Screenshot 2026-04-15 at 1.36.03 PM.png>)
![Dark Theme - Projects Page](<screenshots/Screenshot 2026-04-15 at 1.36.55 PM.png>)
![Dark Theme - Task Board](<screenshots/Screenshot 2026-04-15 at 1.37.45 PM.png>)
![Dark Theme - Task Board Kanban View](<screenshots/Screenshot 2026-04-15 at 1.38.26 PM.png>)
![Dark Theme - Task Detail](<screenshots/Screenshot 2026-04-15 at 1.39.05 PM.png>)
![Dark Theme - Comments Section](<screenshots/Screenshot 2026-04-15 at 1.39.50 PM.png>)
