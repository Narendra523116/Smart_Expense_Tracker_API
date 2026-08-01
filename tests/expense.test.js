import request from 'supertest';
import app from '../src/app.js';

describe('Expense Tracker API Integration Tests', () => {

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // IDs captured from creation so later describe blocks (GET/DELETE) can use real data
  let foodExpenseId = null;
  let travelExpenseId = null;
  let educationExpenseId = null;

  // ---------------------------------------------------------------------
  // POST /api/expenses
  // ---------------------------------------------------------------------
  describe('POST /api/expenses', () => {

    test('creates a food expense and returns 201 with the expected shape', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Groceries', amount: 200, category: 'food' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Expense succesfully added');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Groceries');
      expect(res.body.data.amount).toBe(200);
      expect(res.body.data.category).toBe('food');
      expect(res.body.data.date.slice(0, 7)).toBe(currentMonth);

      foodExpenseId = res.body.data.id;
    });

    test('creates a travel expense with mixed-case category, stored lowercase', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Bus pass', amount: 50, category: 'Travel' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.category).toBe('travel'); // confirms toLowerCase() normalization

      travelExpenseId = res.body.data.id;
    });

    test('creates an education expense on an explicit past date (used later for delete tests)', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Books', amount: 500, category: 'education', date: '2026-06-15' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.date).toBe('2026-06-15');

      educationExpenseId = res.body.data.id;
    });

    test('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Incomplete Expense' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when amount is negative', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Free Coffee', amount: -10, category: 'food' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when amount is non-numeric', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send({ title: 'Bad Amount', amount: 'abc', category: 'food' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ---------------------------------------------------------------------
  // GET /api/expenses
  // ---------------------------------------------------------------------
  describe('GET /api/expenses', () => {

    test('returns every expense inside data when no filter is applied', async () => {
      const res = await request(app).get('/api/expenses');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    test('filters by an existing category (?category=food)', async () => {
      const res = await request(app).get('/api/expenses?category=food');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.every((e) => e.category === 'food')).toBe(true);
    });

    test('filter is case-insensitive (?category=FOOD)', async () => {
      const res = await request(app).get('/api/expenses?category=FOOD');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.every((e) => e.category === 'food')).toBe(true);
    });

    test('returns an empty array for a category with no expenses', async () => {
      const res = await request(app).get('/api/expenses?category=nonexistent-category');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------
  // GET /api/expenses/totals
  // ---------------------------------------------------------------------
  describe('GET /api/expenses/totals', () => {

    test('returns overall total, count, and a byCategory breakdown', async () => {
      const res = await request(app).get('/api/expenses/totals');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('overallTotal');
      expect(res.body.data).toHaveProperty('totalCount');
      expect(res.body.data.byCategory).toHaveProperty('food');
      expect(res.body.data.byCategory).toHaveProperty('travel');
      expect(res.body.data.byCategory).toHaveProperty('education');
    });

    test('returns the total for a single existing category (?category=food)', async () => {
      const res = await request(app).get('/api/expenses/totals?category=food');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({ category: 'food', total: 200 });
    });

    test('returns 0 for a category that has no expenses', async () => {
      const res = await request(app).get('/api/expenses/totals?category=nonexistent-category');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({ category: 'nonexistent-category', total: 0 });
    });
  });

  // ---------------------------------------------------------------------
  // GET /api/expenses/summary/monthly
  // ---------------------------------------------------------------------
  describe('GET /api/expenses/summary/monthly', () => {

    test('returns an array covering every month that has data, including the seeded past month', async () => {
      const res = await request(app).get('/api/expenses/summary/monthly');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      const months = res.body.data.map((m) => m.month);
      expect(months).toEqual(expect.arrayContaining([currentMonth, '2026-06']));
    });

    test('returns a single month summary for the current month (?month=)', async () => {
      const res = await request(app).get(`/api/expenses/summary/monthly?month=${currentMonth}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.month).toBe(currentMonth);
      expect(res.body.data.total).toBeGreaterThanOrEqual(250); // food (200) + travel (50)
      expect(res.body.data.byCategory).toHaveProperty('food');
      expect(res.body.data.byCategory).toHaveProperty('travel');
    });

    test('returns the seeded past month (2026-06) with the education expense', async () => {
      const res = await request(app).get('/api/expenses/summary/monthly?month=2026-06');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({
        month: '2026-06',
        total: 500,
        count: 1,
        byCategory: { education: 500 }
      });
    });

    test('returns a zeroed summary for a valid but data-less month', async () => {
      const res = await request(app).get('/api/expenses/summary/monthly?month=2020-01');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({ month: '2020-01', total: 0, count: 0, byCategory: {} });
    });

    test('returns 400 for a badly formatted month', async () => {
      const res = await request(app).get('/api/expenses/summary/monthly?month=2026-13');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ---------------------------------------------------------------------
  // DELETE /api/expenses/delete/:id
  // ---------------------------------------------------------------------
  describe('DELETE /api/expenses/delete/:id', () => {

    test('deletes an existing expense and returns 200', async () => {
      const res = await request(app).delete(`/api/expenses/delete/${educationExpenseId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Deletion succesful');
    });

    test('removes the deleted expense from subsequent GET and totals responses', async () => {
      const listRes = await request(app).get('/api/expenses?category=education');
      expect(listRes.body.data).toEqual([]);

      const totalRes = await request(app).get('/api/expenses/totals?category=education');
      expect(totalRes.body.data.total).toBe(0);
    });

    test('returns 404 when the id does not exist (already deleted)', async () => {
      const res = await request(app).delete(`/api/expenses/delete/${educationExpenseId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe(`No expense with id ${educationExpenseId} to delete`);
    });

    test('returns 404 for a completely invalid id', async () => {
      const res = await request(app).delete('/api/expenses/delete/invalid-uuid-1234');

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe('No expense with id invalid-uuid-1234 to delete');
    });
  });

  // ---------------------------------------------------------------------
  // Unmatched route (app.js catch-all)
  // ---------------------------------------------------------------------
  describe('Unmatched routes', () => {
    test('returns 400 for a route that does not exist', async () => {
      const res = await request(app).get('/api/does-not-exist');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});