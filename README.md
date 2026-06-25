# nextHome

Web application for posting and finding nearby rental vacancies in the US.

## Architecture

- **nexthome-app (Spring Boot, port 8080)** — single monolithic backend
  - `POST /api/vacancies` to post vacancy and receive a management token
  - `GET /api/vacancies` to view vacancies (supports optional `city` filter)
  - `GET /api/vacancies/{id}` to view a specific vacancy by id
  - `PUT /api/vacancies/{id}` to modify a vacancy with its management token (`X-Management-Token` header or `token` query param)
  - `DELETE /api/vacancies/{id}` to delete a vacancy with its management token (`X-Management-Token` header or `token` query param)
  - optional nearby filtering via query params: `latitude`, `longitude`, `radiusKm`
  - `GET /api/search/nearby` (nearby search shorthand)
- **frontend (React + Vite)**
  - Landing screen with two big options: **Post Vacancy**, **View Vacancy**

## Data model

`Vacancy`
- `id`
- `title`
- `description`
- `roomType`
- `rent`
- `city`
- `address`
- `latitude` (optional)
- `longitude` (optional)
- `createdBy`
- `managementToken` (used for future modify/delete)
- `createdAt`

Indexes are configured on `(latitude, longitude)` and `createdAt`.

## Run with Docker Compose

From repository root:

```bash
docker compose up --build
```

Services:
- MySQL: `localhost:3306`
- nexthome-app: `localhost:8080`

## Run locally without Docker

### Backend

```bash
cd backend
mvn clean test
mvn -pl nexthome-app spring-boot:run
```

### Database setup (required for vacancy-service)

Option 1: Start MySQL with Docker:

```bash
docker run --name nexthome-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=vacancy_db -p 3306:3306 -d mysql:8.4
```

Option 2: Use an existing MySQL server and create DB/user:

```sql
CREATE DATABASE IF NOT EXISTS vacancy_db;
CREATE USER IF NOT EXISTS 'nexthome'@'%' IDENTIFIED BY 'nexthome';
GRANT ALL PRIVILEGES ON vacancy_db.* TO 'nexthome'@'%';
FLUSH PRIVILEGES;
```

Set DB env vars for vacancy-service:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Example:

```bash
export DB_URL=jdbc:mysql://localhost:3306/vacancy_db
export DB_USERNAME=root
export DB_PASSWORD=root
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional API base URL:
- `VITE_API_BASE_URL` (default: `http://localhost:8080`)

## Backend deployment to Google Cloud Run

Backend deployment files are included:

- `cloudbuild.backend.yaml` (builds + deploys nexthome-app to Cloud Run)
- `.github/workflows/deploy-backend-cloud-run.yml` (GitHub Actions workflow that triggers Cloud Build)

### Required GitHub repository secrets

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

### Required GitHub repository variables

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_ARTIFACT_REPOSITORY`
- `APP_SERVICE_NAME`
- `DB_URL` (example: `jdbc:mysql://<host>:3306/vacancy_db`)
- `DB_USERNAME_SECRET_NAME`
- `DB_PASSWORD_SECRET_NAME`
- `CORS_ALLOWED_ORIGINS`
  - Comma-separated list of allowed origins (example: `http://localhost:5173,http://localhost:4173,https://nexthome-live.github.io`)

### Notes

- `DB_USERNAME_SECRET_NAME` and `DB_PASSWORD_SECRET_NAME` must already exist in Google Secret Manager.
- The workflow deploys only the backend (nexthome-app), not the frontend.
- The app is publicly reachable on port 8080.

## Phase coverage

Implemented now:
- Vacancy token-based post/list/update/delete
- Nearby filtering support
- Monolithic backend (search and vacancy in a single app)
- React UI for post/view/modify/delete flows
- Basic validation, CORS, health endpoints
- Backend tests for vacancy API

Not included yet:
- Authentication/JWT
- Service discovery/config server
- Map integration
