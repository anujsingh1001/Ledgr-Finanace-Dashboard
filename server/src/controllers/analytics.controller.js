import * as service from '../services/analytics.service.js';
export async function getSummary(req,res) { res.json({ data: await service.summary(req.userId) }); }
export async function getMonthly(req,res) { res.json({ data: await service.monthly(req.userId) }); }
export async function getCategories(req,res) { res.json({ data: await service.categories(req.userId) }); }
