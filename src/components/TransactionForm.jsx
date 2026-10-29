import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';

export default function TransactionForm() {
  const { state, dispatch } = useAppContext();
  const editing = state.editingTransaction;

  const [form, setForm] = useState({
    date:        editing?.date        ?? new Date().toISOString().split('T')[0],
    description: editing?.description ?? '',
    amount:      editing?.amount      ?? '',
    category:    editing?.category    ?? 'food',
    type:        editing?.type        ?? 'expense',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') dispatch({ type: 'HIDE_FORM' }); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [dispatch]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.date)                              e.date        = 'Required';
    if (!form.description.trim())                e.description = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter valid amount';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form, amount: parseFloat(form.amount) };
    dispatch({ type: editing ? 'UPDATE_TRANSACTION' : 'ADD_TRANSACTION', payload: editing ? { ...payload, id: editing.id } : payload });
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'HIDE_FORM' })} role="dialog" aria-modal="true">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="icon-btn" onClick={() => dispatch({ type: 'HIDE_FORM' })} aria-label="Close"><X size={18} /></button>
        </div>
        <form className="modal-body" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label>Type</label>
            <div className="type-toggle">
              <button type="button" className={`type-opt ${form.type === 'expense' ? 'active expense' : ''}`} onClick={() => set('type', 'expense')}>Expense</button>
              <button type="button" className={`type-opt ${form.type === 'income'  ? 'active income'  : ''}`} onClick={() => set('type', 'income')}>Income</button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="f-desc">Description</label>
            <input id="f-desc" type="text" placeholder="e.g. Grocery shopping" value={form.description} onChange={e => set('description', e.target.value)} className={errors.description ? 'error' : ''} autoFocus />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="f-amt">Amount (USD)</label>
            <input id="f-amt" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} className={errors.amount ? 'error' : ''} />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="f-cat">Category</label>
            <select id="f-cat" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="f-date">Date</label>
            <input id="f-date" type="date" value={form.date} onChange={e => set('date', e.target.value)} className={errors.date ? 'error' : ''} />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'HIDE_FORM' })}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="submit-transaction">{editing ? 'Update' : 'Add'} Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}
