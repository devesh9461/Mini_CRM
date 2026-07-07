import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineX, HiOutlineMail, HiOutlinePhone, HiOutlineCalendar, HiOutlineShare, HiOutlineArrowRight } from 'react-icons/hi';
import API from '../api/axios';
import StatusBadge from './StatusBadge';

export default function LeadPreviewPanel({ leadId, onClose, fullWidth }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    API.get(`/leads/${leadId}`).then(res => setLead(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [leadId]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!leadId) return null;

  return (
    <>
      <div className={`preview-overlay${fullWidth ? ' preview-overlay--full' : ''}`} onClick={onClose} />
      <div className={`preview-panel${fullWidth ? ' preview-panel--full' : ''}`}>
        <div className="preview-panel__header">
          <h3 className="preview-panel__title">Lead Preview</h3>
          <button className="preview-panel__close" onClick={onClose}><HiOutlineX size={20} /></button>
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton--text" style={{ marginBottom: '16px' }} />)}
          </div>
        ) : lead ? (
          <div className="preview-panel__body">
            <div className="preview-panel__section">
              <h2 className="preview-panel__name">{lead.name}</h2>
              <StatusBadge status={lead.status} />
            </div>

            <div className="preview-panel__info">
              <div className="preview-panel__row">
                <HiOutlineMail size={15} />
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="preview-panel__row">
                  <HiOutlinePhone size={15} />
                  <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                </div>
              )}
              <div className="preview-panel__row">
                <HiOutlineShare size={15} />
                <span>{lead.source}</span>
              </div>
              <div className="preview-panel__row">
                <HiOutlineCalendar size={15} />
                <span>{new Date(lead.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {lead.notes?.length > 0 && (
              <div className="preview-panel__section">
                <h4 className="preview-panel__section-title">Recent Notes</h4>
                {lead.notes.slice(0, 3).map(note => (
                  <div key={note.id} className="preview-panel__note">
                    <p>{note.content}</p>
                    <span className="preview-panel__note-date">{new Date(note.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
                {lead.notes.length > 3 && <p className="preview-panel__more">+{lead.notes.length - 3} more notes</p>}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
              onClick={() => { onClose(); navigate(`/leads/${lead.id}`); }}
            >
              View Full Details
              <HiOutlineArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="preview-panel__empty">Lead not found</div>
        )}
      </div>
    </>
  );
}
