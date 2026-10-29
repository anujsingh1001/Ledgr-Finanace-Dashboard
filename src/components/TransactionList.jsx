import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Download, X, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, getCategoryByID } from '../data/mockData';
import { formatCurrency, formatDate, exportToCSV, exportToJSON } from '../utils/helpers';
import TransactionForm from './TransactionForm';
import { api } from '../services/api';

export default function TransactionList() {
  const { state, dispatch } = useAppContext();
  const { transactions, filters, role, currentPage, itemsPerPage } = state;
  const [showExport, setShowExport] = useState(false);
  const [serverItems, setServerItems] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState('');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(itemsPerPage), sortBy: filters.sortBy, sortOrder: filters.sortOrder });
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.search.trim()) params.set('search', filters.search.trim());
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    api.get(`/transactions?${params.toString()}`).then(result => {
      if (!active) return;
      setServerItems(result.items || []);
      setServerTotal(result.pagination?.total || 0);
      const lastPage = Math.max(1, Math.ceil((result.pagination?.total || 0) / itemsPerPage));
      if (currentPage > lastPage) dispatch({ type: 'SET_PAGE', payload: lastPage });
      setTableError('');
    }).catch(error => {
      if (active) setTableError(error.message);
    }).finally(() => { if (active) setTableLoading(false); });
    return () => { active = false; };
  }, [filters.type, filters.category, filters.search, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder, currentPage, itemsPerPage, transactions, dispatch]);

  const filtered = serverItems;
  const paginated = serverItems;
  const totalPages = Math.max(1, Math.ceil(serverTotal / itemsPerPage));
  const hasFilters = filters.type !== 'all' || filters.category !== 'all' || filters.search !== '' || filters.dateFrom !== '' || filters.dateTo !== '';

  const sf = (key, value) => { setTableLoading(true); dispatch({ type: 'SET_FILTER', payload: { key, value } }); };
  const exportFiltered = async (format) => {
    setShowExport(false);
    try {
      const params = new URLSearchParams({ page: '1', limit: '100', sortBy: filters.sortBy, sortOrder: filters.sortOrder });
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      const first = await api.get(`/transactions?${params.toString()}`);
      const allItems = [...(first.items || [])];
      for (let page = 2; page <= (first.pagination?.totalPages || 1); page += 1) {
        params.set('page', String(page));
        const next = await api.get(`/transactions?${params.toString()}`);
        allItems.push(...(next.items || []));
      }
      if (format === 'csv') exportToCSV(allItems);
      else exportToJSON(allItems);
    } catch (error) {
      setTableError(error.message);
    }
  };

  const SortBtn = ({ field, children }) => (
    <button className={`sort-btn ${filters.sortBy === field ? 'active' : ''}`} onClick={() => { setTableLoading(true); dispatch({ type: 'SET_SORT', payload: field }); }}>
      {children}<ArrowUpDown size={11} />
    </button>
  );

  return (
    <div className="transactions-section" id="transactions-section">
      {/* Toolbar */}
      <div className="txn-toolbar">
        <div className="txn-toolbar-left">
          <div className="search-box" id="search-box">
            <Search size={14} />
            <input type="text" placeholder="Search transactions…" value={filters.search} onChange={e => sf('search', e.target.value)} aria-label="Search" />
            {filters.search && <button className="search-clear" onClick={() => sf('search', '')}><X size={13} /></button>}
          </div>
          <div className="filter-group">
            <select value={filters.type} onChange={e => sf('type', e.target.value)} aria-label="Type">
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <ChevronDown size={12} className="select-chevron" />
          </div>
          <div className="filter-group">
            <select value={filters.category} onChange={e => sf('category', e.target.value)} aria-label="Category">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={12} className="select-chevron" />
          </div>
          <div className="filter-group date-filter">
            <input type="date" value={filters.dateFrom} onChange={e => sf('dateFrom', e.target.value)} aria-label="From" />
            <span className="date-sep">→</span>
            <input type="date" value={filters.dateTo} onChange={e => sf('dateTo', e.target.value)} aria-label="To" />
          </div>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'RESET_FILTERS' })}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <div className="txn-toolbar-right">
          <div className="export-dropdown">
            <button className="btn btn-outline btn-sm" onClick={() => setShowExport(!showExport)}>
              <Download size={13} /> Export <ChevronDown size={11} />
            </button>
            {showExport && (
              <>
                <div className="dropdown-overlay" onClick={() => setShowExport(false)} />
                <div className="dropdown-menu">
                  <button onClick={() => exportFiltered('csv')}>Export as CSV</button>
                  <button onClick={() => exportFiltered('json')}>Export as JSON</button>
                </div>
              </>
            )}
          </div>
          {role === 'admin' && (
            <button className="btn btn-primary btn-sm" id="add-transaction-btn" onClick={() => dispatch({ type: 'SHOW_FORM' })}>
              <Plus size={14} /> Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Results info */}
      <div className="txn-results-info">
        Showing {paginated.length} of {serverTotal} transactions
        {hasFilters && <span className="filter-badge"><Filter size={10} /> Filtered</span>}
      </div>

      {/* Table or empty */}
      {tableError ? <div className="api-error" role="alert">{tableError}</div> : tableLoading && filtered.length === 0 ? <div className="api-loading">Loading transactions…</div> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or search query.</p>
          {hasFilters && <button className="btn btn-outline" onClick={() => dispatch({ type: 'RESET_FILTERS' })}>Clear filters</button>}
        </div>
      ) : (
        <div className="txn-table-wrapper">
          <table className="txn-table" id="transactions-table">
            <thead>
              <tr>
                <th><SortBtn field="date">Date</SortBtn></th>
                <th><SortBtn field="description">Description</SortBtn></th>
                <th><SortBtn field="category">Category</SortBtn></th>
                <th>Type</th>
                <th><SortBtn field="amount">Amount</SortBtn></th>
                {role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map(txn => {
                const cat = getCategoryByID(txn.category);
                return (
                  <tr key={txn.id} className="txn-row">
                    <td className="txn-date">{formatDate(txn.date)}</td>
                    <td className="txn-desc">{txn.description}</td>
                    <td><span className="category-badge" style={{ '--cat-color': cat.color }}>{cat.name}</span></td>
                    <td><span className={`type-badge ${txn.type}`}>{txn.type}</span></td>
                    <td className={`txn-amount ${txn.type}`}>{txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}</td>
                    {role === 'admin' && (
                      <td className="txn-actions">
                        <button className="icon-btn" title="Edit" onClick={() => dispatch({ type: 'SHOW_FORM', payload: txn })}><Edit3 size={13} /></button>
                        <button className="icon-btn danger" title="Delete" onClick={() => { if (confirm(`Delete "${txn.description}"?`)) dispatch({ type: 'DELETE_TRANSACTION', payload: txn.id }); }}><Trash2 size={13} /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => { setTableLoading(true); dispatch({ type: 'SET_PAGE', payload: currentPage - 1 }); }}><ChevronLeft size={14} /> Prev</button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => { setTableLoading(true); dispatch({ type: 'SET_PAGE', payload: p }); }}>{p}</button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages} onClick={() => { setTableLoading(true); dispatch({ type: 'SET_PAGE', payload: currentPage + 1 }); }}>Next <ChevronRight size={14} /></button>
        </div>
      )}

      {state.showTransactionForm && <TransactionForm />}
    </div>
  );
}
