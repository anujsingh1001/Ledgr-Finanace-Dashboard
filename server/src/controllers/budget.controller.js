import * as service from '../services/budget.service.js';
export async function list(req,res) { res.json({ data: await service.listBudgets(req.userId, req.query.month) }); }
export async function create(req,res) { res.status(201).json({ data: await service.createBudget(req.userId, req.validated.body) }); }
export async function update(req,res) {
  const item = await service.updateBudget(req.userId, req.params.id, req.validated.body);
  if (!item) return res.status(404).json({ error: { message: 'Budget not found.' } });
  res.json({ data: item });
}
export async function remove(req,res) {
  const item = await service.deleteBudget(req.userId, req.params.id);
  if (!item) return res.status(404).json({ error: { message: 'Budget not found.' } });
  res.status(204).end();
}
