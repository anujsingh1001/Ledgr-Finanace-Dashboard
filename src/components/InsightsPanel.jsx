import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Activity, CreditCard, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getInsights, formatCurrency, getSpendingByCategory, getMonthlyBreakdown } from '../utils/helpers';
import { getCategoryByID } from '../data/mockData';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => <p key={i} className="chart-tooltip-value" style={{ color: p.fill || p.color }}>{p.name}: {formatCurrency(p.value)}</p>)}
    </div>
  );
}

export default function InsightsPanel() {
  const { state }  = useAppContext();
  const spending = state.categoryAnalytics?.length ? state.categoryAnalytics.map(c => ({ category: c.category, amount: c.amount })) : getSpendingByCategory(state.transactions);
  const monthly = state.monthlyAnalytics?.length ? state.monthlyAnalytics.map(m => ({ ...m, month: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) })) : getMonthlyBreakdown(state.transactions);
  const localInsights = getInsights(state.transactions);
  const totals = state.analytics;
  const insights = totals ? {
    ...localInsights,
    highestCategory: spending[0] || null,
    highestPct: totals.expenses > 0 && spending[0] ? ((spending[0].amount / totals.expenses) * 100).toFixed(1) : '0.0',
    avgExpense: totals.avgExpense,
    top5: totals.largestExpenses,
    lastTwo: monthly.slice(-2),
    incomeCount: totals.incomeCount,
    expenseCount: totals.expenseCount,
    savingsRate: totals.savingsRate,
  } : localInsights;
  const isDark = state.theme === 'dark';

  const prev    = insights.lastTwo.length >= 2 ? insights.lastTwo[0] : null;
  const curr    = insights.lastTwo.length >= 1 ? insights.lastTwo[insights.lastTwo.length - 1] : null;
  const expDelta = prev && curr ? ((curr.expenses - prev.expenses) / (prev.expenses || 1)) * 100 : 0;

  const IC = isDark ? '#38d9d9' : '#2bbfbf';
  const EC = isDark ? '#888'    : '#ccc';

  return (
    <div className="insights-section" id="insights-section">
      {/* KPI cards */}
      <div className="insight-cards-grid">
        <div className="insight-card highlight">
          <div className="insight-card-icon" style={{ background: insights.highestCategory ? getCategoryByID(insights.highestCategory.category).color + '20' : 'var(--surface-2)', color: insights.highestCategory ? getCategoryByID(insights.highestCategory.category).color : 'var(--text-2)' }}>
            <ShoppingCart size={18} />
          </div>
          <div className="insight-card-content">
            <span className="insight-label">Highest Spending</span>
            <span className="insight-value">{insights.highestCategory ? getCategoryByID(insights.highestCategory.category).name : 'N/A'}</span>
            <span className="insight-detail">{insights.highestCategory ? `${formatCurrency(insights.highestCategory.amount)} · ${insights.highestPct}% of total` : 'No data'}</span>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-card-icon" style={{ background: expDelta > 0 ? 'var(--red-bg)' : 'var(--green-bg)', color: expDelta > 0 ? 'var(--red)' : 'var(--green)' }}>
            {expDelta > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          </div>
          <div className="insight-card-content">
            <span className="insight-label">Expense Change</span>
            <span className="insight-value">{expDelta >= 0 ? '+' : ''}{expDelta.toFixed(1)}%</span>
            <span className="insight-detail">{prev?.month ?? '—'} <ArrowRight size={10} style={{ display:'inline' }} /> {curr?.month ?? '—'}</span>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-card-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            <DollarSign size={18} />
          </div>
          <div className="insight-card-content">
            <span className="insight-label">Avg. Expense</span>
            <span className="insight-value">{formatCurrency(insights.avgExpense)}</span>
            <span className="insight-detail">{insights.expenseCount} transactions</span>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-card-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>
            <Activity size={18} />
          </div>
          <div className="insight-card-content">
            <span className="insight-label">Savings Rate</span>
            <span className="insight-value">{insights.savingsRate.toFixed(1)}%</span>
            <span className="insight-detail">{insights.incomeCount} income · {insights.expenseCount} expense</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="insights-charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Monthly Comparison</h3>
            <span className="chart-subtitle">Income vs Expenses</span>
          </div>
          <div className="chart-body">
            {monthly.length === 0 ? <div className="chart-empty">No data</div> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthly} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-2)' }} />
                  <Bar dataKey="income"   name="Income"   fill={IC} radius={[4,4,0,0]} animationDuration={900} />
                  <Bar dataKey="expenses" name="Expenses" fill={EC} radius={[4,4,0,0]} animationDuration={900} animationBegin={150} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Top 5 Expenses</h3>
            <span className="chart-subtitle">Largest transactions</span>
          </div>
          <div className="chart-body">
            {insights.top5.length === 0 ? <div className="chart-empty">No expenses</div> : (
              <div className="top-expenses-list">
                {insights.top5.map((txn, i) => {
                  const cat = getCategoryByID(txn.category);
                  return (
                    <div key={txn.id} className="top-expense-item" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="top-expense-rank">{i + 1}</div>
                      <div className="top-expense-icon" style={{ background: cat.color + '18', color: cat.color }}><CreditCard size={14} /></div>
                      <div className="top-expense-info">
                        <span className="top-expense-desc">{txn.description}</span>
                        <span className="top-expense-cat">{cat.name}</span>
                      </div>
                      <span className="top-expense-amount">{formatCurrency(txn.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category bars */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-title">Spending by Category</h3>
          <span className="chart-subtitle">All-time breakdown</span>
        </div>
        <div className="chart-body">
          {spending.length === 0 ? <div className="chart-empty">No spending data</div> : (
            <div className="category-bars-list">
              {spending.map((item, i) => {
                const cat = getCategoryByID(item.category);
                return (
                  <div key={item.category} className="category-bar-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="category-bar-label">
                      <div className="cat-bar-dot" style={{ background: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                    <div className="category-bar-track">
                      <div className="category-bar-fill" style={{ width: `${(item.amount / spending[0].amount) * 100}%`, background: cat.color }} />
                    </div>
                    <span className="category-bar-amount">{formatCurrency(item.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
