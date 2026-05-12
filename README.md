# SoilFLO API

SoilFLO API is a NestJS/TypeScript REST service for construction site dispatch ticketing.

The project loads the provided site and truck JSON data into PostgreSQL, then exposes endpoints for creating and reading material dispatch tickets. Tickets are created in bulk for a truck, assigned sequential ticket numbers per site, and always use `Soil` as the material.

## What is included

- REST API built with NestJS and TypeScript
- PostgreSQL persistence through TypeORM
- Database migrations for sites, trucks, tickets, and per-site ticket counters
- Seed script for `SitesJSONData.json` and `TrucksJSONData.json`
- Swagger documentation at `http://localhost:3000/api`
- Validation for request payloads and query parameters
- Unit and E2E tests for ticket creation and filtering behavior

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL running locally

The default database settings are:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=soilflo
PORT=3000
```

Update `.env` if your local PostgreSQL credentials are different.

## Project setup

Install dependencies:

```bash
npm install
```

Create the local development database:

```bash
psql -U postgres -c "CREATE DATABASE soilflo;"
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

If you are on Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Run migrations:

```bash
npm run migration:run
```

Seed sites, trucks, and ticket counters:

```bash
npm run seed
```

The seed command reads:

- `SitesJSONData.json`
- `TrucksJSONData.json`

It is safe to run more than once; existing site and truck rows are ignored.

## Run the API

Start the app in development watch mode:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000/api/v1
```

Swagger UI is available at:

```text
http://localhost:3000/api
```

Production-style local run:

```bash
npm run build
npm run start:prod
```

## Main endpoints

### Tickets

Create tickets in bulk:

```http
POST /api/v1/tickets/bulk
```

Example body:

```json
{
  "truckId": 1,
  "tickets": [
    { "dispatchedAt": "2024-03-15T09:00:00Z" },
    { "dispatchedAt": "2024-03-15T10:00:00Z" }
  ]
}
```

List tickets with optional filters:

```http
GET /api/v1/tickets?siteIds=1,2&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50
```

Ticket responses include:

- Site name
- Truck license plate
- Ticket number
- Dispatched time
- Material name

## Ticket rules

- A truck can have many tickets.
- A ticket belongs to exactly one truck and one dispatch site.
- Ticket numbers increment independently per site.
- Material is always `Soil`.
- A truck cannot have two tickets with the same dispatched time.
- Tickets cannot be dispatched in the future.
- Bulk ticket creation is atomic: if one ticket is invalid, none of the tickets in that request are saved.

## Tests

Run unit tests:

```bash
npm test
```

Run E2E tests:

```bash
psql -U postgres -c "CREATE DATABASE soilflo_test;"
```

```bash
NODE_ENV=test npm run migration:run
NODE_ENV=test npm run test:e2e
```

On Windows PowerShell:

```powershell
psql -U postgres -c "CREATE DATABASE soilflo_test;"
$env:NODE_ENV="test"; npm run migration:run
$env:NODE_ENV="test"; npm run test:e2e
```

Run test coverage:

```bash
npm run test:cov
```

## Useful scripts

```bash
npm run start        # start the NestJS app
npm run start:dev    # start in watch mode
npm run build        # compile TypeScript
npm run lint         # run ESLint with fixes
npm run format       # run Prettier
npm run migration:run
npm run migration:revert
npm run seed
npm test
npm run test:e2e
```

## Notes for reviewers

The primary workflow to review the project locally is:

```bash
npm install
cp .env.example .env
psql -U postgres -c "CREATE DATABASE soilflo;"
npm run migration:run
npm run seed
npm run start:dev
```

Then open `http://localhost:3000/api` to explore the API through Swagger.
