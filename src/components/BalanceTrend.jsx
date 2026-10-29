import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { getMonthlyBreakdown, formatCurrency } from '../utils/helpers';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function BalanceTrend() {
  const { state } = useAppContext();
  const data      = state.monthlyAnalytics?.length ? state.monthlyAnalytics.map(m => ({ ...m, month: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) })) : getMonthlyBreakdown(state.transactions);
  const isDark    = state.theme === 'dark';

  const IC = isDark ? '#38d9d9' : '#2bbfbf';
  const EC = isDark ? '#888888' : '#cccccc';

  return (
    <div className="chart-card" id="balance-trend">
      <div className="chart-card-header">
        <h3 className="chart-title">Balance Trend</h3>
        <span className="chart-subtitle">Monthly income vs expenses</span>
      </div>
      <div className="chart-body">
        {data.length === 0 ? (
          <div className="chart-empty">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={IC} stopOpacity={isDark ? 0.28 : 0.18} />
                  <stop offset="100%" stopColor={IC} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={EC} stopOpacity={isDark ? 0.22 : 0.12} />
                  <stop offset="100%" stopColor={EC} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--font)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"   name="Income"   stroke={IC} strokeWidth={2.2} fill="url(#gI)" dot={false} activeDot={{ r: 4, fill: IC, stroke: 'var(--bg)', strokeWidth: 2 }} animationDuration={1100} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke={EC} strokeWidth={2.2} fill="url(#gE)" dot={false} activeDot={{ r: 4, fill: EC, stroke: 'var(--bg)', strokeWidth: 2 }} animationDuration={1100} animationBegin={150} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
