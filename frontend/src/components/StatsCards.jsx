import { memo } from 'react';
import {
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi';

const StatsCards = memo(function StatsCards({ stats }) {
  if (!stats) return null;

  const maxVal = Math.max(
    stats.total_leads || 1,
    stats.new_leads || 0,
    stats.contacted_leads || 0,
    stats.converted_leads || 0,
    stats.lost_leads || 0
  );

  const cards = [
    {
      key: 'total',
      label: 'Total Leads',
      value: stats.total_leads,
      icon: <HiOutlineUsers />,
      variant: 'total',
      pct: 100,
    },
    {
      key: 'new',
      label: 'New',
      value: stats.new_leads,
      icon: <HiOutlineSparkles />,
      variant: 'new',
      pct: (stats.new_leads / maxVal) * 100,
    },
    {
      key: 'contacted',
      label: 'Contacted',
      value: stats.contacted_leads,
      icon: <HiOutlinePhone />,
      variant: 'contacted',
      pct: (stats.contacted_leads / maxVal) * 100,
    },
    {
      key: 'converted',
      label: 'Converted',
      value: stats.converted_leads,
      icon: <HiOutlineCheckCircle />,
      variant: 'converted',
      pct: (stats.converted_leads / maxVal) * 100,
    },
    {
      key: 'lost',
      label: 'Lost',
      value: stats.lost_leads,
      icon: <HiOutlineXCircle />,
      variant: 'lost',
      pct: (stats.lost_leads / maxVal) * 100,
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.key} className={`stat-card stat-card--${card.variant}`}>
          <div className="stat-card__icon">{card.icon}</div>
          <div className="stat-card__value">{card.value}</div>
          <div className="stat-card__label">{card.label}</div>
          <div style={{
            marginTop: 12,
            height: 3,
            background: 'var(--bg-tertiary)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${card.pct}%`,
              height: '100%',
              borderRadius: 4,
              background: card.variant === 'total' ? 'var(--accent-gradient)' :
                card.variant === 'new' ? 'var(--status-new)' :
                card.variant === 'contacted' ? 'var(--status-contacted)' :
                card.variant === 'converted' ? 'var(--status-converted)' :
                'var(--status-lost)',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
});

export default StatsCards;
