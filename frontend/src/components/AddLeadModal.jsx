import { useState, useEffect, useRef } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Google Ads', 'Email Campaign', 'Other'];
const STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];

export default function AddLeadModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) focusable[0].focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return setError('Name is required');
    if (!form.email.trim()) return setError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError('Please enter a valid email');

    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ name: '', email: '', phone: '', source: 'Website', status: 'New' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} ref={modalRef}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Lead</h2>
          <button className="modal-close" onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="lead-name">Full Name *</label>
              <input
                id="lead-name"
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-email">Email *</label>
              <input
                id="lead-email"
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. rahul@gmail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-phone">Phone</label>
              <input
                id="lead-phone"
                className="form-input"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +91-9876543210"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-source">Source</label>
              <select
                id="lead-source"
                className="form-select"
                name="source"
                value={form.source}
                onChange={handleChange}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lead-status">Status</label>
              <select
                id="lead-status"
                className="form-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><div className="spinner spinner--sm" /> Adding...</> : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
