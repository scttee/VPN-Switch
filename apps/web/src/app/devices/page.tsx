import { devices } from "../../lib/demo-data";

export default function DevicesPage() {
  return (
    <div>
      <h1>Devices</h1>
      <p>Live overlay status and ownership for every enrolled device.</p>
      <table style={{ width: "100%", background: "white", borderRadius: 12, padding: 12 }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Device</th><th>Owner</th><th>Platform</th><th>Overlay IP</th><th>Path</th><th>Last seen</th><th>Resources</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td><td>{d.owner}</td><td>{d.platform}</td><td>{d.ip}</td><td>{d.path}</td><td>{d.lastSeen}</td><td>{d.resources}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
