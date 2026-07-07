import { useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineArrowRight } from 'react-icons/hi';
import StatusBadge from './StatusBadge';

const TIME_OPTS = { month: 'short', day: 'numeric' };

export default function RecentLeadsWidget({ leads }) {
  const navigate = useNavigate();

  if (!leads || leads.length === 0) {
    return (
      <div className="dw-card">
        <div className="dw-card__header">
          <HiOutlineClock size={18} />
          <span>Recent Leads</span>
        </div>
        <div className="dw-card__empty">No leads yet</div>
      </div>
    );
  }

  return (
    <div className="dw-card">
      <div className="dw-card__header">
        <HiOutlineClock size={18} />
        <span>Recent Leads</span>
        <button
          className="dw-card__action"
          onClick={() => navigate('/leads')}
          title="View all leads"
        >
          <HiOutlineArrowRight size={16} />
        </button>
      </div>
      <div className="dw-recent">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="dw-recent__row"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <div className="dw-recent__info">
              <span className="dw-recent__name">{lead.name}</span>
              <span className="dw-recent__source">{lead.source}</span>
            </div>
            <div className="dw-recent__meta">
              <StatusBadge status={lead.status} />
              <span className="dw-recent__date">
                {new Date(lead.created_at).toLocaleDateString('en-US', TIME_OPTS)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
