import ActivityLog from '../components/ActivityLog';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function RecentActivityPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header page-header--centered">
        <div>
          <h1 className="page-title page-title--dashboard" style={{ fontSize: '1.8rem' }}>Recent Activity</h1>
          <p className="page-subtitle">All recent actions across your leads</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <HiOutlineArrowLeft size={15} />
          Back to Dashboard
        </button>
      </div>
      <div className="glass-card" style={{ padding: '24px' }}>
        <ActivityLog recent limit={20} />
      </div>
    </div>
  );
}
