import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineSun, HiOutlineMoon, HiOutlineSearch } from 'react-icons/hi';
import GravatarImage from './GravatarImage';

export default function TopNavbar({ mobileOpen, setMobileOpen }) {
  const { admin } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <nav className="top-navbar">
      <div className="top-navbar__left">
        <div className="top-navbar__brand">DiploX CRM</div>
        <div className="top-navbar__user">
          <GravatarImage email={admin?.email} size={26} className="top-navbar__avatar" alt={admin?.username}>
            <div className="top-navbar__avatar">{initials}</div>
          </GravatarImage>
          <span className="top-navbar__name">{admin?.username || 'User'}</span>
        </div>
      </div>
      <div className="top-navbar__actions">
        <button
          className="top-navbar__btn"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          aria-label="Search"
          title="Search (Ctrl+K)"
        >
          <HiOutlineSearch size={18} />
        </button>
        <button
          className="top-navbar__btn"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
        </button>
        <button
          className="top-navbar__btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle sidebar"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
        </button>
      </div>
    </nav>
  );
}
