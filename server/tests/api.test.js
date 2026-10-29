import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import session from 'express-session';
import { createApp } from '../src/app.js';
import User from '../src/models/User.js';
import Transaction from '../src/models/Transaction.js';
import Budget from '../src/models/Budget.js';

let mongo, app, agentA, agentB;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), Transaction.init(), Budget.init()]);
  app = createApp({ sessionStore: new session.MemoryStore() });
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Transaction.deleteMany({})]);
  agentA = request.agent(app); agentB = request.agent(app);
  await agentA.post('/api/auth/register').send({ name:'User A', email:'a@example.com', password:'password123' }).expect(201);
  await agentB.post('/api/auth/register').send({ name:'User B', email:'b@example.com', password:'password123' }).expect(201);
});
describe('authentication and transaction ownership', () => {
  it('rejects protected requests without a session', async () => { await request(app).get('/api/transactions').expect(401); });
  it('rejects invalid credentials', async () => {
    const fresh = request.agent(app);
    await fresh.post('/api/auth/login').send({ email:'a@example.com', password:'wrongpass' }).expect(401);
  });
  it('creates, filters, paginates and updates a transaction', async () => {
    const created = await agentA.post('/api/transactions').send({ date:'2026-10-01', description:'Groceries', amount:12.5, category:'food', type:'expense' }).expect(201);
    expect(created.body.data.amount).toBe(12.5);
    await agentA.get('/api/transactions?category=food&page=1&limit=1').expect(200).expect(r => { expect(r.body.data.pagination.total).toBe(1); });
    await agentA.patch(`/api/transactions/${created.body.data.id}`).send({ amount:-2 }).expect(400);
    await agentA.patch(`/api/transactions/${created.body.data.id}`).send({ amount:15 }).expect(200);
  });
  it('prevents one user from reading or deleting another user transaction', async () => {
    const created = await agentA.post('/api/transactions').send({ date:'2026-10-01', description:'Private', amount:99, category:'food', type:'expense' }).expect(201);
    await agentB.get(`/api/transactions/${created.body.data.id}`).expect(404);
    await agentB.delete(`/api/transactions/${created.body.data.id}`).expect(404);
    await agentA.get('/api/transactions').expect(200).expect(r => { expect(r.body.data.items).toHaveLength(1); });
  });

  it('returns analytics calculated from persisted transactions', async () => {
    await agentA.post('/api/transactions').send({ date:'2026-10-01', description:'Salary', amount:1000, category:'salary', type:'income' }).expect(201);
    await agentA.post('/api/transactions').send({ date:'2026-10-02', description:'Food', amount:200, category:'food', type:'expense' }).expect(201);
    await agentA.get('/api/analytics/summary').expect(200).expect(r => {
      expect(r.body.data.income).toBe(1000);
      expect(r.body.data.expenses).toBe(200);
      expect(r.body.data.balance).toBe(800);
      expect(r.body.data.savingsRate).toBe(80);
    });
    await agentB.get('/api/analytics/summary').expect(200).expect(r => { expect(r.body.data.income).toBe(0); });
  });
  it('calculates budget utilization and rejects duplicate category/month budgets', async () => {
    await agentA.post('/api/transactions').send({ date:'2026-10-02', description:'Food', amount:80, category:'food', type:'expense' }).expect(201);
    await agentA.post('/api/budgets').send({ category:'food', month:'2026-10', amount:100 }).expect(201).expect(r => {
      expect(r.body.data.spent).toBe(80);
      expect(r.body.data.remaining).toBe(20);
      expect(r.body.data.utilization).toBe(80);
      expect(r.body.data.warning).toBe('near');
    });
    await agentA.post('/api/budgets').send({ category:'food', month:'2026-10', amount:120 }).expect(409);
  });
  it('rejects bad transaction amounts', async () => {
    await agentA.post('/api/transactions').send({ date:'2026-10-01', description:'Invalid', amount:0, category:'food', type:'expense' }).expect(400);
  });
});
