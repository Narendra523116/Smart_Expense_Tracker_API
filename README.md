# Smart Expense Tracker API

A lightweight REST API for tracking personal expenses - add, list, delete, and total expenses by category and by month. Built with Node.js, Express, and an in-memory `Map`-based storage engine (no database dependency required for this project scope).

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

This runs the Jest + Supertest integration suite (`tests/expense.test.js`) against the live Express app in-process. All 23 tests should pass, organized one `describe` block per endpoint.

## API Endpoints
 
Base path: `/api/expenses`
 
Every route that accepts an optional query parameter is listed as two separate rows below — once for the bare route, once for the filtered variant — since they return meaningfully different response shapes.
 
| Method | Endpoint                                   | Description                                              | Rate limit            |
|--------|----------------------------------------------|------------------------------------------------------------|-------------------------|
| POST   | `/api/expenses`                              | Add a new expense                                          | 10 requests / min      |
| GET    | `/api/expenses`                              | List **all** expenses                                      | 100 requests / 15 min  |
| GET    | `/api/expenses?category={category}`          | List expenses **filtered by category** (case-insensitive)  | 100 requests / 15 min  |
| GET    | `/api/expenses/totals`                       | Get the **overall** total, count, and per-category breakdown | 100 requests / 15 min |
| GET    | `/api/expenses/totals?category={category}`   | Get the total for **one category only**                    | 100 requests / 15 min  |
| GET    | `/api/expenses/summary/monthly`              | Get spend summaries for **every month** with data           | 100 requests / 15 min |
| GET    | `/api/expenses/summary/monthly?month={YYYY-MM}` | Get the spend summary for **one month only**             | 100 requests / 15 min  |
| DELETE | `/api/expenses/delete/:id`                   | Delete an expense by ID                                     | 10 requests / min      |
 
---
 
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
 
> **Note:** Do not include an `id` field in the request — it's always generated server-side with `crypto.randomUUID()` and returned in the response.
 
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
 
---
 
### GET `/api/expenses`
 
Returns every expense currently stored. No query parameters.
 
Response (`200`):
```json
{
  "message": "here is the expenses as you requested",
  "data": [ /* array of every expense object */ ]
}
```
 
### GET `/api/expenses?category={category}`
 
Same endpoint, filtered to a single category via the `category` query parameter. Matching is case-insensitive (`?category=FOOD` and `?category=food` return the same results). Returns an empty array, not an error, if the category has no expenses.
 
Response (`200`):
```json
{
  "message": "here is the expenses as you requested",
  "data": [ /* array of expense objects matching this category only */ ]
}
```
 
---
 
### GET `/api/expenses/totals`
 
Returns the overall total, total count, and a full per-category breakdown. No query parameters.
 
Response (`200`):
```json
{
  "data": {
    "overallTotal": 750,
    "totalCount": 3,
    "byCategory": { "education": 500, "food": 200, "travel": 50 }
  }
}
```
 
### GET `/api/expenses/totals?category={category}`
 
Same endpoint, scoped to a single category via the `category` query parameter. Returns `{ category, total: 0 }` (not an error) if the category has no expenses.
 
Response (`200`):
```json
{
  "data": {
    "category": "food",
    "total": 200
  }
}
```
 
---
 
### GET `/api/expenses/summary/monthly`
 
Returns spending grouped by month (`YYYY-MM`, derived from each expense's `date`), for every month that has data, oldest first. No query parameters.
 
Response (`200`):
```json
{
  "message": "here is the monthly summary as you requested",
  "data": [
    { "month": "2026-06", "total": 500, "count": 1, "byCategory": { "education": 500 } },
    { "month": "2026-08", "total": 250, "count": 2, "byCategory": { "food": 200, "travel": 50 } }
  ]
}
```
 
### GET `/api/expenses/summary/monthly?month={YYYY-MM}`
 
Same endpoint, scoped to a single month via the `month` query parameter (e.g. `?month=2026-07`).
 
- `month` must match `YYYY-MM` — anything else returns `400`.
- A validly formatted month with no expenses returns a zeroed-out summary, not an error.
Response (`200`), month with data:
```json
{
  "message": "here is the summary for 2026-06",
  "data": { "month": "2026-06", "total": 500, "count": 1, "byCategory": { "education": 500 } }
}
```
 
Response (`200`), valid month with no data:
```json
{
  "message": "here is the summary for 2020-01",
  "data": { "month": "2020-01", "total": 0, "count": 0, "byCategory": {} }
}
```
 
Response (`400`), badly formatted month:
```json
{ "error": "month must be in YYYY-MM format, e.g. 2026-07" }
```
 
---
 
### DELETE `/api/expenses/delete/:id`
 
Deletes the expense with the given `id`.
 
- `200` — `{ "message": "Deletion succesful" }`
- `404` — `{ "message": "No expense with id <id> to delete" }` if the ID doesn't exist (including if it was already deleted)

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
- **Monthly totals:** A running `monthlyTotals` object (keyed by `YYYY-MM`) is updated on every add/delete, so the monthly summary endpoint is O(1) rather than recomputing from scratch on every request.
- **IDs:** Expense IDs are server-generated with `crypto.randomUUID()`,  clients cannot supply their own ID to ensure uniqueness in the ID for deletion

## Known Limitations

- Data does not persist across server restarts (in-memory only, by design for this project).
- No authentication/authorization layer, all endpoints are open.

---
