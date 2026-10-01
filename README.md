# HireHub — MERN Job Portal

Full-stack job portal with a Node/Express/MongoDB backend and a React (Vite) frontend. Job seekers can search, save, and apply to jobs. Recruiters can post jobs and manage applicants.

## Tech stack

- Frontend: React, Vite, React Router, Context API
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt

## Run locally

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

Server: `http://localhost:5000`

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Client: `http://localhost:5173`

`client/.env`:

```
VITE_API_URL=http://localhost:5000
```

Vite exposes only variables that start with `VITE_` to the browser via `import.meta.env`.

## Main routes

| Path | Who |
|---|---|
| `/` | Public home |
| `/jobs` | Public job search |
| `/jobs/:id` | Job details |
| `/login` `/register` | Auth |
| `/dashboard/jobseeker` | Job seeker |
| `/saved-jobs` `/my-applications` `/profile` | Job seeker |
| `/dashboard/recruiter` `/create-job` `/my-jobs` | Recruiter |
| `/jobs/:jobId/applicants` | Recruiter |

## Architecture

```
React page
  → src/services/api.js
  → fetch + Authorization: Bearer <token>
  → Express route
  → JWT middleware / role middleware
  → controller
  → MongoDB
  → JSON
  → React state → UI
```

The frontend does not use mock data. Dashboards, pagination, and profile completion come from the backend.
