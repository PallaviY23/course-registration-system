import './StatusBadge.css';

const LABELS = {
  requested: 'Requested',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  pending: 'Pending',
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const className = `reg-status reg-status--${key}`;
  return <span className={className}>{LABELS[key] || status}</span>;
}
