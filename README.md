# Smart Expense Tracker API

A lightweight REST API for tracking personal expenses — add, list, delete, and total expenses by category. Built with Node.js, Express, and an in-memory `Map`-based storage engine (no database dependency required for this project scope).

## Tech Stack

- Node.js + Express 5
- In-memory `Map` storage (no DB setup needed)
- `express-rate-limit` for basic abuse protection
- Jest + Supertest for integration testing

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

## Installation

Clone the repo (or unzip the project), then from the project root:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root (or use the existing one) with:

```
PORT=5000
```

If no `.env` file is present, the server defaults to port `8080`.

## Running the Server

```bash
npm start
```

You should see:

```
the server is online http://localhost:5000
```

For development with auto-restart on file changes:

```bash
npm run dev
```

## Running Tests

```bash
npm test
```

This runs the Jest + Supertest integration suite (`tests/expense.test.js`) against the live Express app in-process. All 7 tests should pass.

## API Endpoints

Base path: `/api/expenses`

| Method | Endpoint                        | Description                                  | Rate limit        |
|--------|----------------------------------|-----------------------------------------------|--------------------|
| POST   | `/api/expenses`                  | Add a new expense                             | 10 requests / min  |
| GET    | `/api/expenses`                  | List all expenses (optional `?category=`)     | 100 requests / 15 min |
| GET    | `/api/expenses/totals`           | Get total spend, overall or by `?category=`   | 100 requests / 15 min |
| DELETE | `/api/expenses/delete/:id`       | Delete an expense by ID                       | 10 requests / min  |

### POST `/api/expenses`

Request body:
```json
{
  "title": "Books",
  "amount": 500,
  "category": "Education",
  "date": "2026-07-30"
}
```
`date` is optional and defaults to today's date. `category` is stored lowercase for consistent lookups.

Response (`201`):
```json
{
  "message": "Expense succesfully added",
  "data": {
    "id": "generated-uuid",
    "title": "Books",
    "amount": 500,
    "category": "education",
    "date": "2026-07-30"
  }
}
```

Validation errors return `400` if `title`, `amount`, or `category` are missing, or if `amount` is not a positive number.

### GET `/api/expenses`

Optional query param `?category=food` filters by category (case-insensitive).

Response (`200`):
```json
{
  "message": "here is the expenses as you requested",
  "data": [ /* array of expense objects */ ]
}
```

### GET `/api/expenses/totals`

Optional query param `?category=food` returns the total for that category only; without it, returns the overall total, count, and a per-category breakdown.

Response (`200`), no category:
```json
{
  "data": {
    "overallTotal": 500,
    "totalCount": 1,
    "byCategory": { "education": 500 }
  }
}
```

### DELETE `/api/expenses/delete/:id`

Deletes the expense with the given `id`.

- `200` — `{ "message": "Deletion succesful" }`
- `404` — `{ "message": "No expense with id <id> to delete" }` if the ID doesn't exist

## Project Structure

```
Smart_Expense_Tracker_API/
├── src/
│   ├── app.js                        # Express app setup, middleware, routing
│   ├── server.js                     # Entry point, starts the HTTP server
│   ├── controllers/
│   │   └── expenseController.js      # Request handlers
│   ├── services/
│   │   └── expenseServices.js        # In-memory data layer (Map-based storage)
│   ├── routes/
│   │   └── expenseRoutes.js          # Route definitions
│   └── middlewares/
│       └── rateLimiter.js            # Read/write rate limiting rules
├── tests/
│   └── expense.test.js               # Jest + Supertest integration tests
├── package.json
└── .env
```

## Design Notes

- **Storage:** Expenses live in memory (`Map`), not on disk, so data resets on server restart.
- **Category index:** A secondary `Map` keyed by category is maintained alongside the main store so category filtering and category totals stay O(1) instead of scanning the full expense list.
- **IDs:** Expense IDs are server-generated with `crypto.randomUUID()` — clients cannot supply their own ID to ensure uniquness in the ID for deletion

## Known Limitations

- Data does not persist across server restarts (in-memory only, by design for this project).
- No authentication/authorization layer — all endpoints are open.

---
