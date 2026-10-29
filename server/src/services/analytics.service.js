import Transaction from '../models/Transaction.js';
const rounded = n => Math.round((n + Number.EPSILON) * 100) / 100;
export async function summary(userId) {
  const mongoose = (await import('mongoose')).default;
  const userObjectId = new mongoose.Types.ObjectId(String(userId));
  const [rows, details, largest] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { user: userObjectId, type: 'expense' } },
      { $group: { _id: null, average: { $avg: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.find({ user: userId, type: 'expense' }).sort({ amount: -1, date: -1 }).limit(5).select('date description amount category type').lean(),
  ]);
  const income = rows.find(r => r._id === 'income')?.total || 0;
  const expenses = rows.find(r => r._id === 'expense')?.total || 0;
  return {
    income: rounded(income), expenses: rounded(expenses), balance: rounded(income - expenses),
    savingsRate: income > 0 ? rounded(((income - expenses) / income) * 100) : 0,
    transactionCount: rows.reduce((s,r) => s + r.count, 0),
    incomeCount: rows.find(r => r._id === 'income')?.count || 0,
    expenseCount: details[0]?.count || 0,
    avgExpense: rounded(details[0]?.average || 0),
    largestExpenses: largest.map(t => ({ id: String(t._id), date: t.date, description: t.description, amount: t.amount, category: t.category, type: t.type })),
  };
}
export async function monthly(userId) {
  const mongoose = (await import('mongoose')).default;
  return Transaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(userId)) } },
    { $group: { _id: { month: { $substrBytes: ['$date', 0, 7] }, type: '$type' }, total: { $sum: '$amount' } } },
    { $sort: { '_id.month': 1 } },
    { $group: { _id: '$_id.month', values: { $push: { type: '$_id.type', total: '$total' } } } },
    { $sort: { _id: 1 } },
  ]).then(rows => rows.map(r => ({ month: r._id, income: rounded(r.values.find(v => v.type === 'income')?.total || 0), expenses: rounded(r.values.find(v => v.type === 'expense')?.total || 0) })));
}
export async function categories(userId) {
  const mongoose = (await import('mongoose')).default;
  return Transaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(userId)), type: 'expense' } },
    { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { amount: -1 } },
  ]).then(rows => rows.map(r => ({ category: r._id, amount: rounded(r.amount), count: r.count })));
}
