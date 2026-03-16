import { people } from "../../lib/demo-data";

export default function PeoplePage() {
  return (
    <div>
      <h1>People</h1>
      <p>Manage trusted members and exactly what each person can access.</p>
      <table style={{ width: "100%", background: "white", borderRadius: 12, padding: 12 }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Name</th><th>Role</th><th>Access</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td><td>{p.role}</td><td>{p.access}</td><td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
