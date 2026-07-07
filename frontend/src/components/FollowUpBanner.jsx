import { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlineX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function FollowUpBanner() {
  const [visible, setVisible] = useState(false);
  const [reminder, setReminder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('followUpDismissed')) return;
    // Check if any leads have notes_count > 0 (they might have follow-up dates)
    API.get('/leads?per_page=5&status=Contacted').then(res => {
      if (res.data.leads.length > 0) {
        setReminder({
          message: `You have ${res.data.total} contacted leads — check for follow-ups needed.`,
          count: res.data.total,
        });
        setVisible(true);
      }
    }).catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div className="followup-banner">
      <div className="followup-banner__content">
        <HiOutlineBell size={20} />
        <span>{reminder?.message || 'Check your leads for pending follow-ups.'}</span>
      </div>
      <div className="followup-banner__actions">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads?status=Contacted')}>
          View Leads
        </button>
        <button
          className="followup-banner__dismiss"
          onClick={() => { setVisible(false); localStorage.setItem('followUpDismissed', 'true'); }}
          aria-label="Dismiss"
        >
          <HiOutlineX size={16} />
        </button>
      </div>
    </div>
  );
}
