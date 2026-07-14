import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import SettingsDrawer from '../SettingsDrawer/SettingsDrawer';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const { activeMode, setHideInstructions } = useSettings();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isFretboard = location.pathname.includes('/fretboard');
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

          <NavLink
            to="/interval-math"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Interval Math
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-version">v0.1.0</span>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="main-content" style={{ position: 'relative' }}>
        <div className="global-controls" style={{ position: 'absolute', top: 'var(--space-2xl)', right: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-xs)', zIndex: 50 }}>
          {isFretboard && (
            <button
              className="btn btn-ghost"
              onClick={() => setHideInstructions(prev => {
                const current = typeof prev === 'object' && prev !== null ? prev : {};
                return { ...current, [activeMode]: !current[activeMode] };
              })}
              title="Help & Instructions"
              style={{ padding: '8px' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => setIsDrawerOpen(true)}
            title="Settings"
            style={{ padding: '8px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1-1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        <Outlet />

        <SettingsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          showFretboardSettings={isFretboard}
        />
      </main>
    </div>
  );
}
