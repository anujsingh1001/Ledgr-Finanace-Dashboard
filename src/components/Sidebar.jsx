import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Menu, X, Crown, Wallet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import LedgrLogo from '../assets/ledgrfulllogolight.png';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight  },
  { id: 'insights',     label: 'Insights',     icon: Lightbulb       },
  { id: 'budgets',      label: 'Budgets',      icon: Wallet          },
];

export default function Sidebar() {
  const { state, dispatch } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    dispatch({ type: 'SET_TAB', payload: id });
    setMobileOpen(false);
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        id="sidebar-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} id="sidebar">

        {/* Brand */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={LedgrLogo} alt="Ledgr FinTech" className="ledgr-logo-img" />
          </div>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-label">Menu</span>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = state.activeTab === id;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={() => handleNav(id)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Upgrade promo + version */}
        <div className="sidebar-footer">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Crown size={16} />
            </div>
            <div className="upgrade-title">Upgrade to Pro</div>
            <div className="upgrade-desc">
            Give me one chance Please.
            </div>
            <button className="upgrade-btn">Upgrade now</button>
          </div>
          <div className="sidebar-version">ledgr v1.0.0</div>
        </div>
      </aside>
    </>
  );
}
