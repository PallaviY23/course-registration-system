export default function StudentPlaceholder({ title, children }) {
  return (
    <div className="content-panel">
      <h1 className="content-title">{title}</h1>
      <p className="content-lead">{children}</p>
      <p className="panel-muted">This screen is a placeholder for the full portal workflow.</p>
    </div>
  );
}
