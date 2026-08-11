import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { dashboardText } from '../../constants/dashboardText.js';
import styles from './AppShell.module.css';

const NAVIGATION_ITEMS = [
  { to: '/dashboard', label: dashboardText.navigation.dashboard, end: true },
  { to: '/jobs', label: dashboardText.navigation.jobs, end: true },
  { to: '/automation', label: dashboardText.navigation.automation, end: true },
  { to: '/automation/runs', label: dashboardText.navigation.automationRuns, end: true },
];

export function AppShell({ eyebrow, title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setSidebarOpen((current) => !current)}
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
      >
        {dashboardText.navigation.menu}
      </button>

      <div className={styles.shell}>
        <aside
          id="app-sidebar"
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`.trim()}
        >
          <div className={styles.sidebarBrand}>
            <p className={styles.sidebarEyebrow}>{dashboardText.navigation.eyebrow}</p>
            <strong>{dashboardText.navigation.title}</strong>
            <span>{dashboardText.navigation.subtitle}</span>
          </div>

          <nav className={styles.nav}>
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {sidebarOpen ? <button type="button" className={styles.overlay} onClick={() => setSidebarOpen(false)} /> : null}

        <div className={styles.mainColumn}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </header>
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </div>
  );
}
