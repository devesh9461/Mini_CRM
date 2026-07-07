import { memo } from 'react';

const StatusBadge = memo(function StatusBadge({ status }) {
  const statusKey = status?.toLowerCase().replace(/\s+/g, '') || 'new';
  return (
    <span className={`status-badge status-badge--${statusKey}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
});

export default StatusBadge;
