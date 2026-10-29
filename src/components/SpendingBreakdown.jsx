import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { getSpendingByCategory, formatCurrency } from '../utils/helpers';
import { getCategoryByID } from '../data/mockData';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{d.name}</p>
      <p className="chart-tooltip-value" style={{ color: d.fill }}>{formatCurrency(d.value)}</p>
    </div>
  );
}

export default function SpendingBreakdown() {
  const { state }  = useAppContext();
  const spending   = state.categoryAnalytics?.length ? state.categoryAnalytics.map(c => ({ category: c.category, amount: c.amount })) : getSpendingByCategory(state.transactions);
  const total      = spending.reduce((s, c) => s + c.amount, 0);

  const chartData = spending.map(s => {
    const cat = getCategoryByID(s.category);
    return { name: cat.name, value: s.amount, fill: cat.color, pct: total > 0 ? ((s.amount / total) * 100).toFixed(1) : '0.0' };
  });

  return (
    <div className="chart-card" id="spending-breakdown">
      <div className="chart-card-header">
        <h3 className="chart-title">Spending</h3>
        <span className="chart-subtitle">By category</span>
      </div>
      <div className="chart-body spending-chart-body">
        {chartData.length === 0 ? (
          <div className="chart-empty">No spending data</div>
        ) : (
          <>
            <div className="donut-chart-wrapper">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value" animationDuration={900} stroke="none">
                    {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-total">{formatCurrency(total)}</span>
                <span className="donut-label">Total Spent</span>
              </div>
            </div>
            <div className="spending-legend">
              {chartData.map((item, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-dot" style={{ background: item.fill }} />
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-pct">{item.pct}%</span>
                  <span className="legend-value">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
