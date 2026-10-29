import { TrendingUp, MoreHorizontal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { calculateTotals, getMonthlyBreakdown, formatCurrency, formatDate } from '../utils/helpers';
import SummaryCards from './SummaryCards';
import BalanceTrend from './BalanceTrend';
import SpendingBreakdown from './SpendingBreakdown';

/* ── Greeting based on hour ── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Mini stats bars (right panel) ── */
function StatsPanel() {
  const { state } = useAppContext();
  const monthly   = state.monthlyAnalytics?.length ? state.monthlyAnalytics.map(m => ({ ...m, month: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) })) : getMonthlyBreakdown(state.transactions);
  const totals    = state.analytics || calculateTotals(state.transactions);

  /* last 3 months for the bar display */
  const last3 = monthly.slice(-3);
  const maxVal = Math.max(...last3.map(m => m.income), 1);

  /* Bar heights — 16 bars mimic the image style */
  const heights = [30,45,25,55,40,60,35,70,50,80,45,90,60,75,65,85];

  return (
    <div className="section-card stats-panel">
      <div className="section-card-header" style={{ padding:'18px 20px 12px' }}>
        <span className="section-title">Statistics</span>
        <MoreHorizontal size={16} style={{ color:'var(--text-3)', cursor:'pointer' }} />
      </div>

      {/* Big number */}
      <div style={{ padding:'0 20px 6px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <span className="stats-big-number">{formatCurrency(totals.income)}</span>
        <span className="stats-growth">
          <TrendingUp size={12} />
          +{totals.savingsRate.toFixed(1)}%
        </span>
      </div>

      {/* Monthly labels */}
      {last3.length > 0 && (
        <div className="stats-monthly-row">
          {last3.map((m, i) => (
            <div key={i} className="stats-month-item">
              <div className="stats-month-val">{formatCurrency(m.income)}</div>
              <div className="stats-month-name">{m.month}</div>
            </div>
          ))}
        </div>
      )}

      {/* Decorative bars */}
      <div className="stats-bars">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`stats-bar ${i >= heights.length - 4 ? 'highlight' : ''}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Recent transactions mini list ── */
function RecentTransactions() {
  const { state, dispatch } = useAppContext();
  const recent = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="section-card">
      <div className="section-card-header" style={{ padding:'18px 20px 14px' }}>
        <span className="section-title">Recent Transactions</span>
        <button
          className="btn btn-ghost btn-sm"
          style={{ fontSize:'0.75rem', padding:'4px 10px' }}
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'transactions' })}
        >
          View all
        </button>
      </div>
      <div className="recent-txn-list">
        {recent.map(txn => (
          <div key={txn.id} className="recent-txn-item">
            <div className="txn-icon-wrap">
              {txn.type === 'income'
                ? <TrendingUp size={16} style={{ color:'var(--green)' }} />
                : <span style={{ fontSize:'0.8rem' }}>↑</span>
              }
            </div>
            <div className="recent-txn-info">
              <div className="recent-txn-name">{txn.description}</div>
              <div className="recent-txn-sub">
                <span>{formatDate(txn.date)}</span>
                <span className={`recent-txn-status ${txn.type === 'income' ? 'status-success' : 'status-pending'}`}>
                  ● {txn.type === 'income' ? 'INCOME' : 'EXPENSE'}
                </span>
              </div>
            </div>
            <div className={`recent-txn-amount ${txn.type}`}>
              {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Dashboard Page ── */
export default function DashboardPage() {
  const { state }  = useAppContext();
  const totals     = state.analytics || calculateTotals(state.transactions);

  const balStr   = Math.abs(totals.balance).toFixed(2);
  const [whole, dec] = balStr.split('.');
  const isNeg    = totals.balance < 0;
  const wholeFmt = parseInt(whole, 10).toLocaleString('en-US');

  return (
    <div className="dashboard-view fade-in">

      {/* Greeting + Balance */}
      <div className="greeting-section">
        <div className="greeting-left">
          <h2 className="greeting-text">{greeting()}, {state.user?.name?.split(' ')[0] || 'there'}!</h2>
          <p className="greeting-sub">Here's your financial summary</p>
        </div>

        <div className="balance-block">
          <p className="balance-label">Total Balance</p>
          <div className="balance-row">
            <div className="balance-amount">
              {isNeg ? '−' : ''}${wholeFmt}
              <span className="balance-cents">.{dec}</span>
            </div>
            <span className="savings-badge">
              <TrendingUp size={12} />
              Savings {totals.savingsRate.toFixed(1)}%
            </span>
          </div>
          <div className="balance-actions">
            <button className="btn-withdraw">Withdraw</button>
          </div>
        </div>
      </div>

      {/* Summary cards row */}
      <SummaryCards />

      {/* Two-column grid */}
      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        <div className="dashboard-left">
          <div className="charts-row">
            <BalanceTrend />
            <SpendingBreakdown />
          </div>
          <RecentTransactions />
        </div>
        <div className="dashboard-right">
          <StatsPanel />
        </div>
      </div>

    </div>
  );
}
