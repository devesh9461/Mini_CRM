import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { HiOutlineGlobeAlt } from 'react-icons/hi';

const SOURCE_COLORS = {
  Website: '#0D9488',
  LinkedIn: '#0A66C2',
  Referral: '#D97706',
  'Google Ads': '#EA4335',
  'Email Campaign': '#8B5CF6',
  Other: '#6B7280',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { source, count } = payload[0].payload;
  return (
    <div className="dw-chart-tooltip">
      <span className="dw-chart-tooltip__label">{source}</span>
      <span className="dw-chart-tooltip__value">{count} lead{count !== 1 ? 's' : ''}</span>
    </div>
  );
};

export default function LeadSourceChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data
      .map((d) => ({ source: d.source, count: d.count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="dw-card">
        <div className="dw-card__header">
          <HiOutlineGlobeAlt size={18} />
          <span>Leads by Source</span>
        </div>
        <div className="dw-card__empty">No source data yet</div>
      </div>
    );
  }

  return (
    <div className="dw-card">
      <div className="dw-card__header">
        <HiOutlineGlobeAlt size={18} />
        <span>Leads by Source</span>
      </div>
      <div className="dw-chart">
        <ResponsiveContainer width="100%" height={chartData.length * 48 + 20}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="source"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] || '#6B7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
