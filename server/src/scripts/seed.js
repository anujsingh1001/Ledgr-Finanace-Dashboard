import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import argon2 from 'argon2';
import { env } from '../config/env.js';
await connectDB(env.MONGODB_URI);
const email = 'demo@ledgr.local';
let user = await User.findOne({ email });
if (!user) user = await User.create({ name: 'Demo User', email, passwordHash: await argon2.hash('ChangeMe123!', { type: argon2.argon2id }) });
const count = await Transaction.countDocuments({ user: user._id });
if (!count) {
  await Transaction.insertMany([
    { user: user._id, date: '2026-10-01', description: 'Monthly salary', amount: 5200, category: 'salary', type: 'income' },
    { user: user._id, date: '2026-10-03', description: 'Grocery shopping', amount: 87.5, category: 'food', type: 'expense' },
    { user: user._id, date: '2026-10-05', description: 'Electric bill', amount: 142, category: 'bills', type: 'expense' },
    { user: user._id, date: '2026-10-08', description: 'Freelance project', amount: 650, category: 'freelance', type: 'income' },
    { user: user._id, date: '2026-10-12', description: 'Train tickets', amount: 62, category: 'transport', type: 'expense' }
  ]);
}
console.log('Demo account: demo@ledgr.local / ChangeMe123! (change this password after first login)');
await (await import('mongoose')).default.disconnect();
