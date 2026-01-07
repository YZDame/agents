import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/markets', label: 'Markets' },
  { path: '/trading', label: 'Trading' },
  { path: '/agents', label: 'Agents' },
  { path: '/news', label: 'News' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <Link to="/dashboard" className="logo">
            Polymarket Agents
          </Link>
          <div className="header-actions">
            <button className="btn btn-sm">Wallet</button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        <nav className="sidebar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
