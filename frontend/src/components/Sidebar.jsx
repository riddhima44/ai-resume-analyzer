import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardList, LogOut, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/analyze', label: 'Resume Analyzer', icon: <FileText size={20} /> },
    { path: '/tracker', label: 'Job Tracker', icon: <ClipboardList size={20} /> },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={closeMobile} />
      )}

      <aside className={`custom-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="brand-header">
          <div style={styles.brandMain}>
            <div style={styles.iconWrapper}>
              <Sparkles size={22} color="white" />
            </div>
            <span className="sidebar-text brand-name" style={styles.brandName}>
              ResuMetrics <span style={styles.brandAccent}>AI</span>
            </span>
          </div>

          {/* Desktop Toggle Button */}
          <button type="button" onClick={toggleCollapse} className="desktop-toggle-btn">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button type="button" onClick={closeMobile} className="mobile-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#818cf8' : '#94a3b8',
                borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
              })}
              title={item.label}
              className="sidebar-link"
            >
              <div style={styles.linkIcon}>{item.icon}</div>
              <span className="sidebar-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        {user && (
          <div className="sidebar-footer">
            <div className="user-info-row">
              <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              <div className="sidebar-text user-details" style={styles.userDetails}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userEmail}>{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              className="logout-button"
              title="Log Out"
            >
              <LogOut size={18} />
              <span className="sidebar-text">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

const styles = {
  brandMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconWrapper: {
    background: 'linear-gradient(135deg, #6366f1 0%, #db2777 100%)',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
    flexShrink: 0,
  },
  brandName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  brandAccent: {
    background: 'linear-gradient(135deg, #818cf8 0%, #db2777 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1.5rem 0',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  linkIcon: {
    width: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#312e81',
    color: '#c7d2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '1rem',
    border: '1px solid #4338ca',
    flexShrink: 0,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
  },
};

export default Sidebar;
