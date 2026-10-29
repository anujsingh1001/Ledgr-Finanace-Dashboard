import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, calculateTotals, getMonthlyBreakdown } from '../utils/helpers';

function pctTrend(curr, prev) {
  if (!prev || prev === 0) return { pct: '0.0', direction: 'up' };
  const d = ((curr - prev) / prev) * 100;
  return { pct: Math.abs(d).toFixed(1), direction: d >= 0 ? 'up' : 'down' };
}

export default function SummaryCards() {
  const { state }  = useAppContext();
  const totals     = state.analytics || calculateTotals(state.transactions);
  const monthly    = state.monthlyAnalytics?.length ? state.monthlyAnalytics.map(m => ({ ...m, month: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) })) : getMonthlyBreakdown(state.transactions);
  const prev       = monthly.length >= 2 ? monthly[monthly.length - 2] : null;
  const current    = monthly.length >= 1 ? monthly[monthly.length - 1] : null;

  const cards = [
    {
      id: 'income', title: 'Total Income',
      value: formatCurrency(totals.income),
      icon: ArrowDownLeft,
      accent: 'var(--green)',
      trend: pctTrend(current?.income, prev?.income),
      trendLabel: 'vs last month', trendInvert: false,
    },
    {
      id: 'expenses', title: 'Total Expenses',
      value: formatCurrency(totals.expenses),
      icon: ArrowUpRight,
      accent: 'var(--red)',
      trend: pctTrend(current?.expenses, prev?.expenses),
      trendLabel: 'vs last month', trendInvert: true,
    },
    {
      id: 'savings', title: 'Savings Rate',
      value: `${totals.savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      accent: 'var(--accent)',
      trend: null,
    },
  ];

  return (
    <div className="summary-cards" id="summary-cards">
      {cards.map((card, i) => {
        const Icon      = card.icon;
        const isUp      = card.trend?.direction === 'up';
        const TrendIcon = isUp ? TrendingUp : TrendingDown;
        const trendGood = card.trendInvert ? !isUp : isUp;

        return (
          <div
            key={card.id}
            className="summary-card"
            id={`card-${card.id}`}
            style={{ '--card-accent': card.accent, animationDelay: `${i * 0.08}s` }}
          >
            <div className="card-header">
              <span className="card-title">{card.title}</span>
              <div className="card-icon" style={{ background: `${card.accent}1a`, color: card.accent }}>
                <Icon size={17} />
              </div>
            </div>
            <div className="card-value">{card.value}</div>
            {card.trend && (
              <div className={`card-trend ${trendGood ? 'positive' : 'negative'}`}>
                <TrendIcon size={12} />
                <span>{card.trend.pct}%</span>
                <span className="trend-label">{card.trendLabel}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
