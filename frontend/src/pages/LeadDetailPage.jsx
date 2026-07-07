import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlineMail, HiOutlinePhone, HiOutlineCalendar, HiOutlineShare } from 'react-icons/hi';
import confetti from 'canvas-confetti';
import API from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import NotesList from '../components/NotesList';
import AddNoteForm from '../components/AddNoteForm';
import ActivityLog from '../components/ActivityLog';
import AICopilot from '../components/AICopilot';

const STATUS_OPTIONS = ['New', 'Contacted', 'Converted', 'Lost'];

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('notes');

  const fetchLeadDetails = useCallback(async () => {
    try {
      const response = await API.get(`/leads/${id}`);
      setLead(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const previousStatus = lead.status;
    setLead((prev) => ({ ...prev, status: newStatus }));
    try {
      await API.patch(`/leads/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      if (newStatus === 'Converted') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
      setLead((prev) => ({ ...prev, status: previousStatus }));
      toast.error('Failed to update status');
    }
  };

  const handleDeleteLead = async () => {
    if (window.confirm(`Are you sure you want to delete lead "${lead?.name}"? This will also delete all associated notes.`)) {
      try {
        await API.delete(`/leads/${id}`);
        toast.success('Lead deleted successfully');
        navigate('/leads');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleAddNote = async (noteData) => {
    try {
      const response = await API.post(`/leads/${id}/notes`, noteData);
      setLead((prev) => ({
        ...prev,
        notes: [response.data, ...(prev.notes ?? [])],
      }));
      toast.success('Note added successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add note');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      setLead((prev) => ({
        ...prev,
        notes: prev.notes.filter((n) => n.id !== noteId),
      }));
      toast.success('Note deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton skeleton--text" style={{ width: '120px', marginBottom: '24px' }} />
        <div className="lead-detail-grid">
          <div>
            <div className="glass-card" style={{ padding: '26px' }}>
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--badge" style={{ marginTop: '8px' }} />
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton skeleton--text" style={{ marginTop: '16px' }} />
              ))}
            </div>
            <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--text" style={{ marginTop: '16px' }} />
            </div>
          </div>
          <div className="glass-card" style={{ padding: '26px' }}>
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--card" style={{ height: '200px', marginTop: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <div className="empty-state__title">Lead not found</div>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/leads')}>
          Back to Leads
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/leads')}>
        <HiOutlineArrowLeft />
        Back to Leads
      </button>

      <div className="lead-detail-grid">
        {/* Left Column: Lead Info Card & Copilot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card lead-info-card">
            <div className="lead-info-header">
              <div>
                <h1 className="lead-info-name">{lead.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={lead.status} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Added {formatDate(lead.created_at)}
                  </span>
                </div>
              </div>
              
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteLead}
                title="Delete Lead"
              >
                <HiOutlineTrash size={16} />
                Delete Lead
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div className="lead-info-row">
                <span className="lead-info-label">Status</span>
                <div className="lead-info-value">
                  <select
                    className="lead-status-select"
                    value={lead.status}
                    onChange={handleStatusChange}
                    style={{ minWidth: '150px' }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lead-info-row">
                <span className="lead-info-label">Email</span>
                <div className="lead-info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineMail color="var(--text-secondary)" />
                  <a href={`mailto:${lead.email}`} style={{ color: 'var(--text-primary)' }}>
                    {lead.email}
                  </a>
                </div>
              </div>

              <div className="lead-info-row">
                <span className="lead-info-label">Phone</span>
                <div className="lead-info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlinePhone color="var(--text-secondary)" />
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} style={{ color: 'var(--text-primary)' }}>
                      {lead.phone}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div className="lead-info-row">
                <span className="lead-info-label">Source</span>
                <div className="lead-info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineShare color="var(--text-secondary)" />
                  <span>{lead.source}</span>
                </div>
              </div>

              <div className="lead-info-row">
                <span className="lead-info-label">Last Update</span>
                <div className="lead-info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineCalendar color="var(--text-secondary)" />
                  <span>{lead.updated_at ? formatDate(lead.updated_at) : formatDate(lead.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <AICopilot lead={lead} />
        </div>

        {/* Right Column: Notes & Activity */}
        <div className="glass-card notes-section">
          <div className="notes-section-header">
            <div className="tabs">
              <button className={`tab ${tab === 'notes' ? 'tab--active' : ''}`} onClick={() => setTab('notes')}>Notes</button>
              <button className={`tab ${tab === 'activity' ? 'tab--active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
            </div>
          </div>

          {tab === 'notes' ? (
            <>
              <AddNoteForm leadId={id} onSubmit={handleAddNote} />
              <div style={{ marginTop: '24px' }}>
                <NotesList notes={lead.notes || []} onDelete={handleDeleteNote} />
              </div>
            </>
          ) : (
            <ActivityLog leadId={Number(id)} />
          )}
        </div>
      </div>
    </div>
  );
}
