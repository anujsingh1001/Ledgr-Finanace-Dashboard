import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
export async function listBudgets(userId, month) {
  const filter = { user: userId, ...(month ? { month } : {}) };
  const budgets = await Budget.find(filter).sort({ month: -1, category: 1 }).lean();
  const out = [];
  for (const budget of budgets) {
    const start = `${budget.month}-01`;
    const endDate = new Date(`${budget.month}-01T00:00:00Z`);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    const end = endDate.toISOString().slice(0, 10);
    const result = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(String(userId)), type: 'expense', category: budget.category, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const spent = Math.round((result[0]?.total || 0) * 100) / 100;
    out.push({ ...budget, id: String(budget._id), _id: undefined, user: undefined, spent, remaining: Math.round((budget.amount - spent) * 100) / 100, utilization: budget.amount > 0 ? Math.round(spent / budget.amount * 1000) / 10 : 0, warning: spent >= budget.amount ? 'over' : spent >= budget.amount * .8 ? 'near' : null });
  }
  return out;
}
export async function createBudget(userId, input) {
  const budget = await Budget.create({ ...input, user: userId });
  return (await listBudgets(userId, input.month)).find(b => b.id === String(budget._id));
}
export async function updateBudget(userId, id, input) {
  if (!mongoose.isValidObjectId(id)) return null;
  const updated = await Budget.findOneAndUpdate({ _id: id, user: userId }, { $set: input }, { new: true, runValidators: true });
  if (!updated) return null;
  return (await listBudgets(userId, updated.month)).find(b => b.id === String(updated._id));
}
export async function deleteBudget(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Budget.findOneAndDelete({ _id: id, user: userId });
}
