const TEAM = [
  { name: 'Aayushman Kumar', roll: '—', emailId: '—' },
  { name: 'Member 2', roll: '—', emailId: '—' },
  { name: 'Member 3', roll: '—', emailId: '—' },
  { name: 'Member 4', roll: '—', emailId: '—' },
];

export default function About() {
  return (
    <div className="content-panel">
      <h1 className="content-title">About</h1>
      <h2 className="content-subtitle">Made by</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll</th>
              <th>Email ID</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m, i) => (
              <tr key={`${m.name}-${i}`}>
                <td>{m.name}</td>
                <td>{m.roll}</td>
                <td>{m.emailId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
