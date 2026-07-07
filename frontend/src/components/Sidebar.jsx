import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import GravatarImage from './GravatarImage';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlineLogout,
  HiOutlineDownload,
  HiOutlineUpload,
  HiOutlineBriefcase,
  HiOutlineStar,
  HiOutlineClock,
} from 'react-icons/hi';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [leadCount, setLeadCount] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await API.get('/leads?per_page=1');
        setLeadCount(res.data.total);
      } catch {}
    };
    fetchCount();
  }, []);

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : 'AD';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <HiOutlineBriefcase size={20} />
          </div>
          <div className="sidebar__brand-info">
            <div className="sidebar__brand-name">DiploX CRM</div>
            <div className="sidebar__brand-sub">Services</div>
          </div>
        </div>

        <div className="sidebar__section-label">Main</div>
        <nav className="sidebar__nav">
          <NavLink
            to="/"
            className={`sidebar__link ${isActive('/') && location.pathname === '/' ? 'sidebar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar__link-icon"><HiOutlineViewGrid /></span>
            Dashboard
          </NavLink>
          <NavLink
            to="/leads"
            className={`sidebar__link ${isActive('/leads') ? 'sidebar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar__link-icon"><HiOutlineUsers /></span>
            All Leads
            {leadCount !== null && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--accent-soft-bg)',
                color: 'var(--accent-primary)',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}>{leadCount}</span>
            )}
          </NavLink>
        </nav>

        <div className="sidebar__section-label">Quick Links</div>
        <nav className="sidebar__nav">
          <NavLink
            to="/recent-leads"
            className={`sidebar__link ${isActive('/recent-leads') ? 'sidebar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar__link-icon"><HiOutlineStar /></span>
            Recent Leads
          </NavLink>
          <NavLink
            to="/recent-activity"
            className={`sidebar__link ${isActive('/recent-activity') ? 'sidebar__link--active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="sidebar__link-icon"><HiOutlineClock /></span>
            Recent Activity
          </NavLink>
        </nav>

        <button
          className="btn btn-primary sidebar__add-btn"
          onClick={() => navigate('/leads', { state: { openAddLead: true } })}
        >
          <HiOutlinePlus size={16} />
          Add Lead
        </button>

        <div className="sidebar__section-label">Data</div>
        <nav className="sidebar__nav">
          <button
            className="sidebar__link"
            onClick={() => navigate('/leads', { state: { exportCSV: true } })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            <span className="sidebar__link-icon"><HiOutlineDownload /></span>
            Export CSV
          </button>
          <button
            className="sidebar__link"
            onClick={() => navigate('/leads', { state: { openImport: true } })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            <span className="sidebar__link-icon"><HiOutlineUpload /></span>
            Import CSV
          </button>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <GravatarImage email={admin?.email} size={34} className="sidebar__avatar" alt={admin?.username}>
              <div className="sidebar__avatar">{initials}</div>
            </GravatarImage>
            <div>
              <div className="sidebar__user-name">{admin?.username}</div>
              <div className="sidebar__user-email">{admin?.email}</div>
            </div>
            <button
              className="btn-ghost sidebar__logout-btn"
              onClick={logout}
              title="Logout"
            >
              <HiOutlineLogout size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
