# Bucks2Bar

Bucks2Bar is a React dashboard for the i-Transform mentoring program. It organizes
the August 2026 report by mentor and training batch, displays candidate assessment
and progress results, and tracks university and placement details as they become
available.

## Stack

- React and Vite frontend
- Java 8 / Spring Boot 2.7 REST API
- Hibernate/JPA backed by an embedded SQLite database

## Run locally

Prerequisites: Node.js 20.19+ and npm for the frontend; Java 8 and Maven 3.6.3+
for the backend.

1. From the repository root, install and start the frontend:

   ```powershell
   npm ci
   npm run dev
   ```

2. In a second terminal, start the API:

   ```powershell
   cd backend
   mvn spring-boot:run
   ```

3. Open the Vite URL printed in the first terminal (normally
   `http://localhost:5173`). The frontend proxies `/api` requests to
   `http://localhost:8080`.

To create the static frontend bundle, run `npm run build`; the files are written
to `dist/`. The SQLite database is created at `backend/bucks2bar.db` when the
backend starts from the `backend` directory.

## Report data and score mapping

The included seed data is sourced from the workbook's consolidated `Worksheet`
tab. It contains 112 young professionals across five batches and five mentors.
Candidate emails are not included; local IDs (`YP-001`, etc.) are generated for
the dashboard.

- **M11** is mapped to `Grade S1` (session 1 / first attempt).
- **L1** is mapped to `Grade S2` (session 2).
- **Final score** and **assessment outcome** use `Final Grade` and `Final Status`.
- **Progress rating** uses the workbook's Week 2 mentor performance rating.
- University, mentor comments, batch dates, bench dates/status, deployment dates,
  and project details were not in the source and are left blank, not inferred.

Batch dates and candidate university/placement details can be added from the
batch and candidate detail views. The seed file is applied only when the
database has no candidates; later app starts preserve database edits. To restore
the original report snapshot, stop the backend and remove
`backend/bucks2bar.db`.

The report is a single snapshot, so the insights page shows YP counts by batch
and the M11 score distribution rather than implying a historical month-by-month
trend. University breakdowns appear once university details have been added.

## Data handling

The local seed includes candidate names and assessment outcomes from the supplied
workbook. Keep the repository and SQLite database within the team's approved
access controls; this demonstration does not implement authentication or
authorization and should not be exposed as a public service.
