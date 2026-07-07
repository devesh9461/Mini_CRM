import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import LeadPreviewPanel from './LeadPreviewPanel';

const COLUMNS = ['New', 'Contacted', 'Converted', 'Lost'];

export default function KanbanBoard({ leads, onStatusChange, loading }) {
  const navigate = useNavigate();
  const [dragLead, setDragLead] = useState(null);
  const [previewId, setPreviewId] = useState(null);

  const grouped = COLUMNS.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status);
    return acc;
  }, {});

  const handleDragStart = (lead) => {
    setDragLead(lead);
  };

  const handleDrop = async (status) => {
    if (!dragLead || dragLead.status === status) return;
    onStatusChange(dragLead.id, status);
    setDragLead(null);
  };

  if (loading) {
    return (
      <div className="kanban-board">
        {COLUMNS.map(col => (
          <div key={col} className="kanban-column">
            <div className="kanban-column-header">{col}</div>
            {[1,2].map(i => (
              <div key={i} className="skeleton skeleton--card" style={{ height: '80px', margin: '8px' }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="kanban-board">
        {COLUMNS.map(status => (
          <div
            key={status}
            className={`kanban-column ${dragLead && dragLead.status !== status ? 'kanban-column--drop' : ''}`}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={() => handleDrop(status)}
          >
            <div className="kanban-column-header">
              <span>{status}</span>
              <span className="kanban-column-count">{grouped[status]?.length || 0}</span>
            </div>
            <div className="kanban-column-body">
              {grouped[status]?.map(lead => (
                <div
                  key={lead.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  onClick={() => setPreviewId(lead.id)}
                >
                  <div className="kanban-card__name">{lead.name}</div>
                  <div className="kanban-card__email">{lead.email}</div>
                  <div className="kanban-card__footer">
                    <span className="kanban-card__source">{lead.source}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                </div>
              ))}
              {(!grouped[status] || grouped[status].length === 0) && (
                <div className="kanban-column-empty">No leads</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <LeadPreviewPanel leadId={previewId} onClose={() => setPreviewId(null)} />
    </>
  );
}
