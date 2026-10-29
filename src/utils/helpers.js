/* ── Formatters ──────────────────────────────────── */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
  }).format(amount);

export const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

export const formatDateShort = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

export const getMonthYear = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', year: '2-digit',
  });

/* ── Totals ──────────────────────────────────────── */
export const calculateTotals = (transactions) => {
  const income   = transactions.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  return { income, expenses, balance, savingsRate };
};

/* ── Spending by category ────────────────────────── */
export const getSpendingByCategory = (transactions) => {
  const grouped = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });

  return Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

/* ── Monthly breakdown ───────────────────────────── */
export const getMonthlyBreakdown = (transactions) => {
  const grouped = {};
  transactions.forEach(t => {
    const key = getMonthYear(t.date);
    if (!grouped[key]) grouped[key] = { month: key, income: 0, expenses: 0 };
    if (t.type === 'income')  grouped[key].income   += t.amount;
    else                      grouped[key].expenses  += t.amount;
  });
  return Object.values(grouped).map(m => ({ ...m, balance: m.income - m.expenses }));
};

/* ── Insights ────────────────────────────────────── */
export const getInsights = (transactions) => {
  const spending  = getSpendingByCategory(transactions);
  const totals    = calculateTotals(transactions);
  const expenses  = transactions.filter(t => t.type === 'expense');

  const highestCategory = spending[0] ?? null;
  const highestPct = totals.expenses > 0 && highestCategory
    ? ((highestCategory.amount / totals.expenses) * 100).toFixed(1)
    : 0;

  const avgExpense = expenses.length > 0
    ? expenses.reduce((s, t) => s + t.amount, 0) / expenses.length
    : 0;

  const top5     = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const monthly  = getMonthlyBreakdown(transactions);
  const lastTwo  = monthly.slice(-2);

  const incomeCount  = transactions.filter(t => t.type === 'income').length;
  const expenseCount = expenses.length;

  return {
    highestCategory, highestPct,
    avgExpense,
    top5, lastTwo,
    totalTransactions: transactions.length,
    incomeCount, expenseCount,
    savingsRate: totals.savingsRate,
  };
};

/* ── Exports ─────────────────────────────────────── */
export const exportToCSV = (transactions) => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
  const escapeCell = (value) => {
    let text = String(value ?? '');
    // Prevent spreadsheet formula injection from user-controlled text fields.
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = transactions.map(t => [
    t.date, t.description, Number(t.amount).toFixed(2), t.category, t.type,
  ]);
  const csv = [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (transactions) => {
  const json = JSON.stringify(transactions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
