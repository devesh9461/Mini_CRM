import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import StatsCards from '../components/StatsCards';
import AddLeadModal from '../components/AddLeadModal';
import FollowUpBanner from '../components/FollowUpBanner';
import LeadSourceChart from '../components/LeadSourceChart';
import LeadFunnelWidget from '../components/LeadFunnelWidget';
import RecentLeadsWidget from '../components/RecentLeadsWidget';
import { HiOutlinePlus } from 'react-icons/hi';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [sourceData, setSourceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddLead) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, sourceRes] = await Promise.all([
        API.get('/leads/dashboard/stats'),
        API.get('/leads/dashboard/source-stats'),
      ]);
      setStats(statsRes.data);
      setSourceData(sourceRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleAddLead = async (leadData) => {
    try {
      await API.post('/leads', leadData);
      toast.success('Lead added successfully!');
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to add lead');
      throw err;
    }
  };

  if (loading) {
    return (
      <div>
        <FollowUpBanner />
        <div className="page-header page-header--centered">
          <div style={{ textAlign: 'center' }}>
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--text" style={{ width: '40%', margin: '0 auto' }} />
          </div>
        </div>
        <div className="stats-grid">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton--card" />)}
        </div>
        <div className="dw-grid">
          <div className="skeleton skeleton--card" style={{ minHeight: 240 }} />
          <div className="skeleton skeleton--card" style={{ minHeight: 240 }} />
          <div className="skeleton skeleton--card" style={{ minHeight: 240 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header page-header--centered">
        <div>
          <h1 className="page-title page-title--dashboard">Dashboard</h1>
          <p className="page-subtitle">Your lead management overview</p>
        </div>
      </div>

      <FollowUpBanner />

      {stats && <StatsCards stats={stats} />}

      <div className="dw-grid">
        <LeadSourceChart data={sourceData} />
        <LeadFunnelWidget stats={stats} />
        <RecentLeadsWidget leads={stats?.recent_leads} />
      </div>

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLead}
      />
    </div>
  );
}
