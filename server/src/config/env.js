import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/ledgr'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').default('development-only-change-this-session-secret'),
});
export const env = schema.superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production' && value.SESSION_SECRET === 'development-only-change-this-session-secret') {
    ctx.addIssue({ code: 'custom', path: ['SESSION_SECRET'], message: 'Set a unique SESSION_SECRET in production.' });
  }
}).parse(process.env);
