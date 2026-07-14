import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🎸</span>
          <h1 className="sidebar-title">GTrain</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/fretboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <line x1="7" y1="6" x2="7" y2="18" />
              <line x1="12" y1="6" x2="12" y2="18" />
              <line x1="17" y1="6" x2="17" y2="18" />
            </svg>
            Fretboard Trainer
          </NavLink>

          {/* Future pages will go here */}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-version">v0.1.0</span>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
