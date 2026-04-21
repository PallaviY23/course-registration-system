const TEAM = [
  { name: 'Aayushman Kumar', roll: '230029', emailId: 'aayushmank23@iitk.ac.in' },
  { name: 'Durbasmriti Saha', roll: '230393', emailId: 'durbasmrit23@iitk.ac.in' },
  { name: 'Reddi Pallavi', roll: '230850', emailId: 'rpallavi23@iitk.ac.in' },
  { name: 'Seru Jyothika', roll: '230946', emailId: 'serujy23@iitk.ac.in' },
];

export default function About() {
  return (
    <div className="content-panel">
      <p className="role-label about-meta-line">CS315: Principles of Database Systems</p>
      <p className="role-label about-meta-line">Course Registration System</p>
      <p className="role-label about-meta-line about-meta-line--members">Group Members:</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Email ID</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m, i) => (
              <tr key={`${m.name}-${i}`}>
                <td>{m.name}</td>
                <td>{m.roll}</td>
                <td>
                  <a href={`mailto:${m.emailId}`}>{m.emailId}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
