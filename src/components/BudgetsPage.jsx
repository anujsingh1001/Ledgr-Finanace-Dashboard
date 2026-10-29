import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, PencilLine } from 'lucide-react';
import { api } from '../services/api';
import { CATEGORIES } from '../data/mockData';
import { formatCurrency } from '../utils/helpers';

const expenseCategories = CATEGORIES.filter(c => !['salary','freelance','investment'].includes(c.id));
const currentMonth = () => new Date().toISOString().slice(0, 7);
export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { setBudgets(await api.get(`/budgets?month=${month}`)); setError(''); } catch (e) { setError(e.message); } }, [month]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (editing) await api.patch(`/budgets/${editing}`, { category, month, amount: Number(amount) });
      else await api.post('/budgets', { category, month, amount: Number(amount) });
      setAmount(''); setEditing(null); await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const edit = (b) => { setEditing(b.id); setCategory(b.category); setAmount(String(b.amount)); };
  const remove = async (id) => { if (!confirm('Delete this budget?')) return; try { await api.delete(`/budgets/${id}`); await load(); } catch (e) { setError(e.message); } };
  return <section className="budgets-page fade-in">
    <div className="budgets-heading"><div><h2 className="section-title">Monthly budgets</h2><p className="greeting-sub">Set category limits and track spending from your saved expenses.</p></div><label className="budget-month">Month <input type="month" value={month} onChange={e => setMonth(e.target.value)} /></label></div>
    <form className="section-card budget-form" onSubmit={submit}>
      <h3>{editing ? 'Edit budget' : 'Create a budget'}</h3>
      <div className="budget-form-fields"><label>Category<select value={category} onChange={e => setCategory(e.target.value)}>{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Monthly limit (USD)<input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></label><button className="btn btn-primary" disabled={busy}>{editing ? <PencilLine size={14}/> : <Plus size={14}/>} {busy ? 'Saving…' : editing ? 'Save changes' : 'Add budget'}</button>{editing && <button type="button" className="btn btn-ghost" onClick={() => {setEditing(null);setAmount('');}}>Cancel</button>}</div>
      {error && <p className="auth-error" role="alert">{error}</p>}
    </form>
    {budgets.length === 0 ? <div className="empty-state"><div className="empty-icon">🎯</div><h3>No budgets for this month</h3><p>Create a category budget to start tracking your spending.</p></div> : <div className="budget-grid">{budgets.map(b => {
      const cat = expenseCategories.find(c => c.id === b.category) || expenseCategories[expenseCategories.length - 1];
      const width = Math.min(100, Math.max(0, b.utilization));
      return <article className="section-card budget-card" key={b.id}><div className="budget-card-top"><span className="category-badge" style={{'--cat-color':cat.color}}>{cat.name}</span><div className="budget-card-actions"><button className="icon-btn" title="Edit budget" onClick={() => edit(b)}><PencilLine size={13}/></button><button className="icon-btn danger" title="Delete budget" onClick={() => remove(b.id)}><Trash2 size={13}/></button></div></div><div className="budget-amounts"><strong>{formatCurrency(b.spent)}</strong><span>of {formatCurrency(b.amount)}</span></div><div className="budget-progress"><div className={`budget-progress-fill ${b.warning || ''}`} style={{width:`${width}%`}} /></div><div className="budget-meta"><span>{b.utilization.toFixed(1)}% used</span><span>{b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(Math.abs(b.remaining))} over`}</span></div>{b.warning && <p className={`budget-warning ${b.warning}`}>{b.warning === 'over' ? 'Budget exceeded' : 'You have used at least 80% of this budget'}</p>}</article>;
    })}</div>}
  </section>;
}
