import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
const money = n => Math.round((n + Number.EPSILON) * 100) / 100;
export async function listTransactions(userId, query) {
  const filter = { user: userId };
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.dateFrom || query.dateTo) filter.date = {};
  if (query.dateFrom) filter.date.$gte = query.dateFrom;
  if (query.dateTo) filter.date.$lte = query.dateTo;
  if (query.search) { const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ description: { $regex: escaped, $options: 'i' } }, { category: { $regex: escaped, $options: 'i' } }]; }
  const sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  const [items, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    Transaction.countDocuments(filter),
  ]);
  return { items: items.map(t => ({ ...t, id: String(t._id), _id: undefined, user: undefined })), pagination: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
}
export async function createTransaction(userId, input) {
  const doc = await Transaction.create({ ...input, amount: money(input.amount), user: userId });
  return { ...doc.toObject(), id: String(doc._id), _id: undefined, user: undefined };
}
export async function getTransaction(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Transaction.findOne({ _id: id, user: userId }).lean();
  return doc ? { ...doc, id: String(doc._id), _id: undefined, user: undefined } : null;
}
export async function updateTransaction(userId, id, input) {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Transaction.findOneAndUpdate({ _id: id, user: userId }, { $set: { ...input, ...(input.amount !== undefined ? { amount: money(input.amount) } : {}) } }, { new: true, runValidators: true }).lean();
  return doc ? { ...doc, id: String(doc._id), _id: undefined, user: undefined } : null;
}
export async function deleteTransaction(userId, id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Transaction.findOneAndDelete({ _id: id, user: userId });
}
