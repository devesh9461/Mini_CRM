import { useMemo } from 'react';
import { HiOutlineChartSquareBar } from 'react-icons/hi';

const STAGE_META = {
  New: { color: '#3B82F6', label: 'New Leads' },
  Contacted: { color: '#D97706', label: 'Contacted' },
  Converted: { color: '#10B981', label: 'Converted' },
  Lost: { color: '#EF4444', label: 'Lost' },
};

export default function LeadFunnelWidget({ stats }) {
  const stages = useMemo(() => {
    if (!stats) return [];
    const items = [
      { key: 'New', count: stats.new_leads || 0 },
      { key: 'Contacted', count: stats.contacted_leads || 0 },
      { key: 'Converted', count: stats.converted_leads || 0 },
      { key: 'Lost', count: stats.lost_leads || 0 },
    ];
    const maxVal = Math.max(...items.map((s) => s.count), 1);
    return items.map((s) => ({
      ...s,
      meta: STAGE_META[s.key],
      pct: (s.count / maxVal) * 100,
    }));
  }, [stats]);

  return (
    <div className="dw-card">
      <div className="dw-card__header">
        <HiOutlineChartSquareBar size={18} />
        <span>Conversion Funnel</span>
      </div>
      <div className="dw-funnel">
        {stages.map((stage, i) => (
          <div key={stage.key} className="dw-funnel__row">
            {i > 0 && <div className="dw-funnel__arrow">
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path d="M1 1L8 8L1 15" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>}
            <div className="dw-funnel__bar-wrap">
              <div className="dw-funnel__bar" style={{ width: `${stage.pct}%`, background: stage.meta.color }} />
              <div className="dw-funnel__info">
                <span className="dw-funnel__count">{stage.count}</span>
                <span className="dw-funnel__label">{stage.meta.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {stats && (
        <div className="dw-funnel__rate">
          <span>Conversion rate</span>
          <strong>
            {stats.total_leads > 0
              ? `${((stats.converted_leads / stats.total_leads) * 100).toFixed(1)}%`
              : '—'}
          </strong>
        </div>
      )}
    </div>
  );
}
