import { useState, useEffect } from 'react';
import API from '../api/axios';
import LeadTable from '../components/LeadTable';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function RecentLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/leads?per_page=10')
      .then(res => setLeads(res.data.leads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <div>
        <div className="page-header page-header--centered">
          <div className="skeleton skeleton--title" style={{ width: '200px', margin: '0 auto' }} />
        </div>
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton--text" style={{ marginBottom: '12px' }} />)}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header page-header--centered">
        <div>
          <h1 className="page-title page-title--dashboard" style={{ fontSize: '1.8rem' }}>Recent Leads</h1>
          <p className="page-subtitle">Latest leads added to your pipeline</p>
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
        <LeadTable
          leads={leads}
          onDelete={handleDelete}
          sortBy={null}
          sortOrder={null}
          onSortChange={() => {}}
        />
      </div>
    </div>
  );
}
