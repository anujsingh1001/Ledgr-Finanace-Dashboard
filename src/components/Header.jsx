import { Sun, Moon, Eye, Shield, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TAB_META = {
  dashboard:    { title: 'Dashboard',    subtitle: 'Your financial overview at a glance'    },
  transactions: { title: 'Transactions', subtitle: 'Manage and explore your transactions'   },
  insights:     { title: 'Insights',     subtitle: 'Key spending patterns and observations'  },
  budgets:      { title: 'Budgets',      subtitle: 'Plan category limits and track spending' },
};

export default function Header() {
  const { state, dispatch, logout } = useAppContext();
  const { title, subtitle } = TAB_META[state.activeTab] ?? TAB_META.dashboard;

  return (
    <header className="header" id="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Role toggle */}
        <div className="role-toggle" id="role-switcher" role="group" aria-label="Demo display mode (not server permissions)">
          <button
            className={`role-btn ${state.role === 'viewer' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ROLE', payload: 'viewer' })}
            title="Viewer demo display mode; not a security permission"
          >
            <Eye size={13} /><span>Viewer</span>
          </button>
          <button
            className={`role-btn ${state.role === 'admin' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ROLE', payload: 'admin' })}
            title="Admin demo display mode; server access still requires authentication"
          >
            <Shield size={13} /><span>Admin</span>
          </button>
          <div
            className="role-slider"
            style={{ transform: state.role === 'admin' ? 'translateX(100%)' : 'translateX(0)' }}
            aria-hidden="true"
          />
        </div>

        <span className="header-user">{state.user?.name}</span>
        <button className="theme-toggle" onClick={logout} aria-label="Log out" title="Log out"><LogOut size={16} /></button>
        {/* Theme toggle */}
        <button
          className="theme-toggle"
          id="theme-toggle"
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {state.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
