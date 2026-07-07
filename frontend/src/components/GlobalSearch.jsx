import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import API from '../api/axios';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get('/leads', { params: { search: query.trim(), per_page: 10 } });
        setResults(res.data.leads);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (lead) => {
    setOpen(false);
    setQuery('');
    navigate(`/leads/${lead.id}`);
  };

  if (!open) return null;

  return (
    <div className="global-search-overlay" onClick={() => { setOpen(false); setQuery(''); setResults([]); }}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-input-wrapper">
          <HiOutlineSearch size={20} />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search leads by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="global-search-close" onClick={() => { setOpen(false); setQuery(''); setResults([]); }}>
            <HiOutlineX size={18} />
          </button>
        </div>

        {loading && (
          <div className="global-search-results">
            {[1,2,3].map(i => <div key={i} className="skeleton skeleton--text" style={{ margin: '8px 12px', height: '20px' }} />)}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="global-search-results">
            {results.map(lead => (
              <div key={lead.id} className="global-search-result" onClick={() => handleSelect(lead)}>
                <div className="global-search-result__name">{lead.name}</div>
                <div className="global-search-result__email">{lead.email}</div>
                <span className="global-search-result__status" style={{
                  background: lead.status === 'New' ? 'var(--status-new-bg)' : lead.status === 'Contacted' ? 'var(--status-contacted-bg)' : lead.status === 'Converted' ? 'var(--status-converted-bg)' : 'var(--status-lost-bg)',
                  color: lead.status === 'New' ? 'var(--status-new)' : lead.status === 'Contacted' ? 'var(--status-contacted)' : lead.status === 'Converted' ? 'var(--status-converted)' : 'var(--status-lost)',
                }}>{lead.status}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="global-search-empty">No leads found</div>
        )}

        <div className="global-search-footer">
          <span>↑↓ Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
