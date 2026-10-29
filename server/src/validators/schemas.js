import { z } from 'zod';
import { CATEGORIES } from '../models/Transaction.js';
const transaction = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => { const parsed = new Date(`${value}T00:00:00Z`); return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value; }, 'Date must be a valid calendar date'),
  description: z.string().trim().min(1).max(160),
  amount: z.coerce.number().finite().positive().max(1_000_000_000),
  category: z.enum(CATEGORIES),
  type: z.enum(['income','expense']),
});
export const registerSchema = z.object({ body: z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
}), query: z.any(), params: z.any() });
export const loginSchema = z.object({ body: z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
}), query: z.any(), params: z.any() });
export const transactionCreateSchema = z.object({ body: transaction, query: z.any(), params: z.any() });
export const transactionUpdateSchema = z.object({ body: transaction.partial().refine(v => Object.keys(v).length > 0), query: z.any(), params: z.any() });
export const transactionQuerySchema = z.object({ body: z.any(), params: z.any(), query: z.object({
  search: z.string().optional(), type: z.enum(['income','expense']).optional(), category: z.string().optional(),
  dateFrom: z.string().optional(), dateTo: z.string().optional(),
  sortBy: z.enum(['date','amount','description','category']).default('date'),
  sortOrder: z.enum(['asc','desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(10),
}) });
export const budgetSchema = z.object({ body: z.object({
  category: z.enum(CATEGORIES.filter(c => !['salary','freelance','investment'].includes(c))),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  amount: z.coerce.number().finite().positive().max(1_000_000_000),
}), query: z.any(), params: z.any() });
export const budgetUpdateSchema = z.object({ body: z.object({
  amount: z.coerce.number().finite().positive().max(1_000_000_000).optional(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  category: z.enum(CATEGORIES.filter(c => !['salary','freelance','investment'].includes(c))).optional(),
}).refine(v => Object.keys(v).length > 0), query: z.any(), params: z.any() });
