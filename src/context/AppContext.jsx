import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);
const BASE_STATE = {
  transactions: [],
  filters: { type: 'all', category: 'all', search: '', dateFrom: '', dateTo: '', sortBy: 'date', sortOrder: 'desc' },
  role: 'admin', theme: localStorage.getItem('ledgr-theme') || 'dark', activeTab: 'dashboard',
  editingTransaction: null, showTransactionForm: false, currentPage: 1, itemsPerPage: 10,
  user: null, authLoading: true, loadingTransactions: false, transactionError: '', authError: '', analytics: null, monthlyAnalytics: [], categoryAnalytics: [],
};
function reducer(state, { type, payload }) {
  switch (type) {
    case 'SET_AUTH': return { ...state, user: payload, authLoading: false, authError: '' };
    case 'AUTH_ERROR': return { ...state, authLoading: false, authError: payload };
    case 'SET_AUTH_LOADING': return { ...state, authLoading: payload };
    case 'SET_TRANSACTIONS': return { ...state, transactions: payload, loadingTransactions: false, transactionError: '' };
    case 'SET_ANALYTICS': return { ...state, analytics: payload.summary, monthlyAnalytics: payload.monthly, categoryAnalytics: payload.categories };
    case 'TRANSACTION_ERROR': return { ...state, loadingTransactions: false, transactionError: payload };
    case 'SET_LOADING_TRANSACTIONS': return { ...state, loadingTransactions: true, transactionError: '' };
    case 'SET_TAB': return { ...state, activeTab: payload, currentPage: 1 };
    case 'SET_ROLE': return { ...state, role: payload, showTransactionForm: false, editingTransaction: null };
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_FILTER': return { ...state, filters: { ...state.filters, [payload.key]: payload.value }, currentPage: 1 };
    case 'RESET_FILTERS': return { ...state, filters: BASE_STATE.filters, currentPage: 1 };
    case 'SET_SORT': {
      const same = state.filters.sortBy === payload;
      return { ...state, filters: { ...state.filters, sortBy: payload, sortOrder: same ? (state.filters.sortOrder === 'asc' ? 'desc' : 'asc') : 'desc' } };
    }
    case 'SHOW_FORM': return { ...state, showTransactionForm: true, editingTransaction: payload || null };
    case 'HIDE_FORM': return { ...state, showTransactionForm: false, editingTransaction: null };
    case 'SET_PAGE': return { ...state, currentPage: payload };
    case 'LOGOUT': return { ...BASE_STATE, theme: state.theme, authLoading: false };
    default: return state;
  }
}
export function AppProvider({ children }) {
  const [state, rawDispatch] = useReducer(reducer, BASE_STATE);
  useEffect(() => { document.documentElement.setAttribute('data-theme', state.theme); localStorage.setItem('ledgr-theme', state.theme); }, [state.theme]);

  const refreshTransactions = useCallback(async () => {
    rawDispatch({ type: 'SET_LOADING_TRANSACTIONS' });
    try {
      const [result, summary, monthly, categories] = await Promise.all([
        api.get('/transactions?limit=100&page=1&sortBy=date&sortOrder=desc'), api.get('/analytics/summary'), api.get('/analytics/monthly'), api.get('/analytics/categories')
      ]);
      rawDispatch({ type: 'SET_TRANSACTIONS', payload: result.items || [] });
      rawDispatch({ type: 'SET_ANALYTICS', payload: { summary, monthly, categories } });
    } catch (error) {
      if (error.status === 401) rawDispatch({ type: 'SET_AUTH', payload: null });
      rawDispatch({ type: 'TRANSACTION_ERROR', payload: error.message });
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get('/auth/me').then(({ user }) => {
      if (!active) return;
      rawDispatch({ type: 'SET_AUTH', payload: user });
    }).catch(() => {
      if (active) rawDispatch({ type: 'SET_AUTH', payload: null });
    });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (state.user) refreshTransactions(); }, [state.user, refreshTransactions]);

  const dispatch = useCallback((action) => {
    if (action.type === 'ADD_TRANSACTION') {
      api.post('/transactions', action.payload).then(() => refreshTransactions()).then(() => rawDispatch({ type: 'HIDE_FORM' })).catch(e => rawDispatch({ type: 'TRANSACTION_ERROR', payload: e.message }));
      return;
    }
    if (action.type === 'UPDATE_TRANSACTION') {
      const { id, ...body } = action.payload;
      api.patch(`/transactions/${id}`, body).then(() => refreshTransactions()).then(() => rawDispatch({ type: 'HIDE_FORM' })).catch(e => rawDispatch({ type: 'TRANSACTION_ERROR', payload: e.message }));
      return;
    }
    if (action.type === 'DELETE_TRANSACTION') {
      api.delete(`/transactions/${action.payload}`).then(() => refreshTransactions()).catch(e => rawDispatch({ type: 'TRANSACTION_ERROR', payload: e.message }));
      return;
    }
    if (action.type === 'TOGGLE_THEME') { rawDispatch(action); return; }
    rawDispatch(action);
  }, [refreshTransactions]);

  const authenticate = useCallback(async (mode, values) => {
    rawDispatch({ type: 'SET_AUTH_LOADING', payload: true });
    try {
      const result = await api.post(`/auth/${mode}`, values);
      rawDispatch({ type: 'SET_AUTH', payload: result.user });
      return true;
    } catch (error) {
      rawDispatch({ type: 'AUTH_ERROR', payload: error.message });
      rawDispatch({ type: 'SET_AUTH_LOADING', payload: false });
      return false;
    }
  }, []);
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout', {}); } finally { rawDispatch({ type: 'LOGOUT' }); }
  }, []);
  return <AppContext.Provider value={{ state, dispatch, authenticate, logout, refreshTransactions }}>{children}</AppContext.Provider>;
}
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
