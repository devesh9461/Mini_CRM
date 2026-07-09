import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axios';
import LeadTable from '../components/LeadTable';
import KanbanBoard from '../components/KanbanBoard';
import AddLeadModal from '../components/AddLeadModal';
import CSVImportModal from '../components/CSVImportModal';
import useDebounce from '../hooks/useDebounce';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineX, HiOutlineUpload } from 'react-icons/hi';

const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Google Ads', 'Email Campaign', 'Other'];
const STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];

export default function LeadsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dynamicSources, setDynamicSources] = useState(SOURCES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const debouncedSearch = useDebounce(search, 300);
  const pendingExportRef = useRef(false);

  // Open modal / trigger export when navigated from sidebar
  useEffect(() => {
    if (location.state?.openAddLead) {
      setIsModalOpen(true);
      navigate('.', { replace: true, state: {} });
    }
    if (location.state?.openImport) {
      setShowImport(true);
      navigate('.', { replace: true, state: {} });
    }
    if (location.state?.exportCSV) {
      pendingExportRef.current = true;
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Trigger CSV export once leads are loaded after sidebar navigation
  useEffect(() => {
    if (pendingExportRef.current && !loading && leads.length > 0) {
      pendingExportRef.current = false;
      exportCSV();
    }
  }, [loading, leads]);

  const sortedSources = useMemo(() => [...dynamicSources].sort(), [dynamicSources]);


  // Fetch unique sources from backend
  const fetchSources = async () => {
    try {
      const response = await API.get('/leads/sources');
      // Merge backend sources with defaults and remove duplicates
      const allSources = Array.from(new Set([...SOURCES, ...response.data]));
      setDynamicSources(allSources);
    } catch (err) {
      console.error('Failed to fetch dynamic sources:', err);
    }
  };

  // Fetch leads with query parameters
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (sortBy) params.sort_by = sortBy;
      if (sortOrder) params.order = sortOrder;

      const response = await API.get('/leads', { params });
      setLeads(response.data.leads);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leads list');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder]);



  // General fetch dependency for page changes
  useEffect(() => {
    fetchLeads();
  }, [page, perPage, debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchSources();
  }, []);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Date'];
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone || ''}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${new Date(l.created_at).toLocaleDateString('en-IN')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddLead = async (leadData) => {
    try {
      if (leadData.email) {
        const res = await API.get('/leads/duplicate', { params: { email: leadData.email } });
        if (res.data.is_duplicate) {
          const proceed = window.confirm(
            `A lead with email "${leadData.email}" already exists:\n${res.data.matches.map(m => `- ${m.name}`).join('\n')}\n\nAdd anyway?`
          );
          if (!proceed) {
            // Throw a custom error structured like an API response to keep the modal open and show error
            throw { response: { data: { detail: 'Duplicate email check cancelled. Please change the email.' } } };
          }
        }
      }
      await API.post('/leads', leadData);
      toast.success('Lead added successfully!');
      fetchLeads();
      fetchSources();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to add lead');
      throw err;
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await API.delete(`/leads/${leadId}`);
      toast.success('Lead deleted successfully');
      // If we delete the last item on the current page, go back a page
      if (leads.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lead');
    }
  };



  const handleStatusChange = async (leadId, status) => {
    try {
      await API.patch(`/leads/${leadId}/status`, { status });
      toast.success('Lead status updated');
      fetchLeads();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update lead status');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setPage(1);
  };

  return (
    <div>
      <div className="page-header page-header--centered">
        <div>
          <h1
            className="page-title page-title--leads"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Scroll to top"
          >
            Leads Directory
          </h1>
          <p className="page-subtitle">Manage, search, and filter all your leads</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm page-header__csv-btn" onClick={exportCSV}>
            Export CSV
          </button>
          <button className="btn btn-secondary btn-sm page-header__csv-btn" onClick={() => setShowImport(true)}>
            <HiOutlineUpload size={14} />
            Import CSV
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-toggle__btn ${viewMode === 'table' ? 'view-toggle__btn--active' : ''}`}
          onClick={() => setViewMode('table')}
        >Table</button>
        <button
          className={`view-toggle__btn ${viewMode === 'kanban' ? 'view-toggle__btn--active' : ''}`}
          onClick={() => setViewMode('kanban')}
        >Board</button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div className="search-input-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search leads by name or email..."
            value={search}
                  onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
          />
        </div>

        <div className="form-group" style={{ minWidth: '150px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Sources</option>
            {sortedSources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {(search || statusFilter || sourceFilter) && (
          <button
            className="btn btn-secondary"
            onClick={handleResetFilters}
            style={{ padding: '10px 14px' }}
            title="Clear filters"
          >
            <HiOutlineX size={16} />
            Reset
          </button>
        )}
      </div>

      {/* Main Content */}
      {viewMode === 'table' ? (
        loading ? (
          <div className="glass-card" style={{ padding: '20px' }}>
            <div className="skeleton skeleton--card" style={{ height: '48px', marginBottom: '12px' }} />
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div className="skeleton skeleton--text" style={{ width: '25%' }} />
                <div className="skeleton skeleton--text" style={{ width: '30%' }} />
                <div className="skeleton skeleton--text" style={{ width: '15%' }} />
                <div className="skeleton skeleton--badge" />
                <div className="skeleton skeleton--text" style={{ width: '10%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '20px' }}>
            <LeadTable
              leads={leads}
              onDelete={handleDeleteLead}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(col) => {
                if (sortBy === col) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(col);
                  setSortOrder('asc');
                }
                setPage(1);
              }}
            />
          </div>
        )
      ) : (
        <KanbanBoard leads={leads} onStatusChange={handleStatusChange} loading={loading} />
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination__btn"
            onClick={() => setPage(1)}
            disabled={page === 1}
            title="First Page"
          >
            &laquo;
          </button>
          <button
            className="pagination__btn"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            title="Previous Page"
          >
            &lsaquo;
          </button>
          
          <span className="pagination__info">
            Page {page} of {totalPages} ({total} total leads)
          </span>

          <select
            className="pagination__size"
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <button
            className="pagination__btn"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            title="Next Page"
          >
            &rsaquo;
          </button>
          <button
            className="pagination__btn"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            title="Last Page"
          >
            &raquo;
          </button>
        </div>
      )}

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLead}
      />

      <CSVImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => { fetchLeads(); fetchSources(); }}
      />
    </div>
  );
}
