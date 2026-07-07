import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import LeadPreviewPanel from './LeadPreviewPanel';
import { calculateLeadScore, getScoreColor } from '../utils/leadScoring';
import { HiOutlineTrash, HiOutlineEye, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

const STATUS_COLORS = {
  'New': 'var(--status-new)',
  'Contacted': 'var(--status-contacted)',
  'Converted': 'var(--status-converted)',
  'Lost': 'var(--status-lost)',
};

const LeadTable = React.memo(function LeadTable({ leads, onDelete, sortBy, sortOrder, onSortChange, previewFullWidth }) {
  const navigate = useNavigate();
  const [previewId, setPreviewId] = useState(null);

  if (!leads || leads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📋</div>
        <div className="empty-state__title">No leads found</div>
        <div className="empty-state__desc">
          Add your first lead or adjust your search filters.
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCardView = windowWidth < 600;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (isCardView) {
    return (
      <>
        <div className="lead-card-grid">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="lead-card-mini"
              onClick={() => { setPreviewId(lead.id); scrollToTop(); }}
            >
              <div className="lead-card-mini__bar" style={{ background: STATUS_COLORS[lead.status] || 'var(--accent-primary)' }} />
              <div className="lead-card-mini__body">
                <div className="lead-card-mini__name">{lead.name}</div>
                <div className="lead-card-mini__meta">
                  <HiOutlineMail size={12} />
                  <span>{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="lead-card-mini__meta">
                    <HiOutlinePhone size={12} />
                    <span>{lead.phone}</span>
                  </div>
                )}
                <div className="lead-card-mini__footer">
                  <StatusBadge status={lead.status} />
                  {(() => { const s = calculateLeadScore(lead); return <span className="score-badge" style={{ background: `${getScoreColor(s)}18`, color: getScoreColor(s) }}>{s}</span>; })()}
                  <span className="lead-card-mini__date">{formatDate(lead.created_at)}</span>
                </div>
                <div className="lead-card-mini__actions">
                  <button className="btn-ghost" title="View details" onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>
                    <HiOutlineEye />
                  </button>
                  <button className="btn-ghost" title="Delete lead" style={{ color: 'var(--status-lost)' }} onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete lead "${lead.name}"?`)) onDelete(lead.id); }}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <LeadPreviewPanel leadId={previewId} onClose={() => setPreviewId(null)} fullWidth={previewFullWidth} />
      </>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="data-table" id="leads-table">
          <thead>
            <tr>
              <th onClick={() => onSortChange('name')} className="sortable-header">
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => onSortChange('email')} className="sortable-header">
                Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => onSortChange('source')} className="sortable-header">
                Source {sortBy === 'source' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => onSortChange('status')} className="sortable-header">
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th>Score</th>
              <th onClick={() => onSortChange('created_at')} className="sortable-header">
                Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} onClick={() => setPreviewId(lead.id)}>
                <td><div className="lead-name">{lead.name}</div></td>
                <td><div className="lead-email">{lead.email}</div></td>
                <td>{lead.source}</td>
                <td><StatusBadge status={lead.status} /></td>
                <td>{(() => { const s = calculateLeadScore(lead); return <span className="score-badge" style={{ background: `${getScoreColor(s)}18`, color: getScoreColor(s) }}>{s}</span>; })()}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(lead.created_at)}</td>
                <td><span className="notes-count">{lead.notes_count || 0}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn-ghost" title="View details" onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>
                      <HiOutlineEye />
                    </button>
                    <button className="btn-ghost" title="Delete lead" style={{ color: 'var(--status-lost)' }} onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete lead "${lead.name}"?`)) onDelete(lead.id); }}>
                      <HiOutlineTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LeadPreviewPanel leadId={previewId} onClose={() => setPreviewId(null)} fullWidth={previewFullWidth} />
    </>
  );
});

export default LeadTable;
