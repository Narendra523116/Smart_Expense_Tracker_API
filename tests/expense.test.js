import request from 'supertest';
import app from '../src/app.js';

describe('Expense Tracker API Integration Tests', () => {

  let createdExpenseId = null;

  // Test 1: POST /api/expenses (Creation)
  test('POST /api/expenses - should create a new expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        title: 'Books',
        amount: 500,
        category: 'education'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Expense succesfully added');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Books');
    expect(res.body.data.amount).toBe(500);

    // Save ID for deletion test
    createdExpenseId = res.body.data.id;
  });

  // Test 2: Validation error handling
  test('POST /api/expenses - should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        title: 'Incomplete Expense'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test 3: Validation error handling for invalid/negative amount
  test('POST /api/expenses - should return 400 if amount is invalid or <= 0', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        title: 'Free Coffee',
        amount: -10,
        category: 'food'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test 4: GET /api/expenses (Fetch All - structured under res.body.data)
  test('GET /api/expenses - should return expenses list inside data property', async () => {
    const res = await request(app).get('/api/expenses');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Test 5: GET /api/expenses/totals (Calculations wrapped under res.body.data)
  test('GET /api/expenses/totals - should return aggregated totals inside data property', async () => {
    const res = await request(app).get('/api/expenses/totals');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
  });

  // Test 6: DELETE /api/expenses/delete/:id (Custom Delete Route)
  test('DELETE /api/expenses/delete/:id - should delete existing expense', async () => {
    const res = await request(app).delete(`/api/expenses/delete/${createdExpenseId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Deletion succesful');
  });

  // Test 7: DELETE /api/expenses/delete/:id (404 Not Found)
  test('DELETE /api/expenses/delete/:id - should return 404 for non-existent ID', async () => {
    const res = await request(app).delete('/api/expenses/delete/invalid-uuid-1234');

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('No expense with id invalid-uuid-1234 to delete');
  });
});