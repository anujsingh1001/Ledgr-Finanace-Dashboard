import mongoose from 'mongoose';
export const CATEGORIES = ['food','transport','shopping','bills','entertainment','health','salary','freelance','investment','other'];
const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  description: { type: String, required: true, trim: true, maxlength: 160 },
  amount: { type: Number, required: true, min: 0.01, validate: Number.isFinite },
  category: { type: String, required: true, enum: CATEGORIES },
  type: { type: String, required: true, enum: ['income','expense'] },
}, { timestamps: true });
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, type: 1 });
export default mongoose.model('Transaction', transactionSchema);
