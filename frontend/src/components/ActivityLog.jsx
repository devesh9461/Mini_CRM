import { useState, useEffect, useCallback } from 'react';
import { HiOutlineClock, HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash, HiOutlineChat } from 'react-icons/hi';
import API from '../api/axios';

const ACTION_ICONS = {
  lead_created:  <HiOutlinePlusCircle />,
  status_changed: <HiOutlinePencil />,
  note_added:    <HiOutlineChat />,
  lead_deleted:  <HiOutlineTrash />,
};

export default function ActivityLog({ leadId, recent, limit }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      let res;
      if (recent) {
        res = await API.get('/activities/recent', { params: { limit: limit || 5 } });
      } else if (leadId) {
        res = await API.get('/activities', { params: { lead_id: leadId } });
      }
      setActivities(res?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [leadId, recent]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  if (loading) {
    return <div style={{ padding: '16px' }}><div className="skeleton skeleton--text" style={{ width: '60%' }} /></div>;
  }

  if (!activities.length) {
    return <div className="empty-state" style={{ padding: '32px' }}><p style={{ color: 'var(--text-tertiary)' }}>No activity recorded yet.</p></div>;
  }

  return (
    <div className="activity-timeline">
      {activities.map((act) => (
        <div key={act.id} className="activity-item">
          <div className="activity-icon">{ACTION_ICONS[act.action] || <HiOutlineClock />}</div>
          <div className="activity-body">
            <p className="activity-details">{act.details || act.action}</p>
            <span className="activity-time">{new Date(act.created_at).toLocaleString('en-IN')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
