import mongoose from 'mongoose';
import { CATEGORIES } from './Transaction.js';
const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, enum: CATEGORIES.filter(c => !['salary','freelance','investment'].includes(c)) },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  amount: { type: Number, required: true, min: 0.01, validate: Number.isFinite },
}, { timestamps: true });
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });
export default mongoose.model('Budget', budgetSchema);
