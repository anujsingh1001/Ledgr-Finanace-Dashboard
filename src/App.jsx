import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './components/DashboardPage';
import TransactionList from './components/TransactionList';
import InsightsPanel from './components/InsightsPanel';
import AuthPage from './components/AuthPage';
import BudgetsPage from './components/BudgetsPage';
import './App.css';

function AppContent() {
  const { state } = useAppContext();
  if (state.authLoading) return <main className="auth-page"><p className="auth-subtitle">Connecting to Ledgr…</p></main>;
  if (!state.user) return <AuthPage />;
  return (
    <div className="app-layout" id="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content" id="page-content">
          {state.activeTab === 'dashboard' && <DashboardPage />}
          {state.activeTab === 'transactions' && <TransactionList />}
          {state.activeTab === 'insights' && <InsightsPanel />}
          {state.activeTab === 'budgets' && <BudgetsPage />}
          {state.transactionError && <div className="api-error" role="alert">{state.transactionError}</div>}
          {state.loadingTransactions && <div className="api-loading">Syncing transactions…</div>}
        </main>
      </div>
    </div>
  );
}
export default function App() { return <AppProvider><AppContent /></AppProvider>; }
