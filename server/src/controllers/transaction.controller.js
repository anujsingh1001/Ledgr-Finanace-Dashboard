import * as service from '../services/transaction.service.js';
export async function list(req,res) { res.json({ data: await service.listTransactions(req.userId, req.validated.query) }); }
export async function create(req,res) { res.status(201).json({ data: await service.createTransaction(req.userId, req.validated.body) }); }
export async function get(req,res) {
  const item = await service.getTransaction(req.userId, req.params.id);
  if (!item) return res.status(404).json({ error: { message: 'Transaction not found.' } });
  res.json({ data: item });
}
export async function update(req,res) {
  const item = await service.updateTransaction(req.userId, req.params.id, req.validated.body);
  if (!item) return res.status(404).json({ error: { message: 'Transaction not found.' } });
  res.json({ data: item });
}
export async function remove(req,res) {
  const item = await service.deleteTransaction(req.userId, req.params.id);
  if (!item) return res.status(404).json({ error: { message: 'Transaction not found.' } });
  res.status(204).end();
}
