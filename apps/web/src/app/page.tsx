import { devices, people, resources, workspace } from "../lib/demo-data";

export default function DashboardPage() {
  const cards = [
    { title: "Online Devices", value: `${workspace.onlineDevices}/${workspace.totalDevices}`, note: "Direct and relay paths monitored" },
    { title: "Shared Resources", value: String(resources.length), note: "Names resolve over private DNS" },
    { title: "Trusted People", value: String(people.length), note: `${workspace.pendingInvites} invite pending` },
    { title: "Route Health", value: workspace.routeHealth, note: "Conflict warnings shown before approval" }
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p>Usable demo workspace with realistic data, diagnostics, and access boundaries.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <section key={card.title} style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
            <h3 style={{ margin: "0 0 8px" }}>{card.title}</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{card.value}</p>
            <small>{card.note}</small>
          </section>
        ))}
      </div>

      <h2>Quick Actions</h2>
      <ul>
        <li>Invite trusted person</li>
        <li>Publish folder or NAS share</li>
        <li>Approve route advertisement</li>
        <li>Run unreachable-resource diagnostics</li>
      </ul>

      <h2>Recent Device Activity</h2>
      <div style={{ background: "white", borderRadius: 14, padding: 16 }}>
        {devices.slice(0, 3).map((d) => (
          <p key={d.name} style={{ margin: "8px 0" }}>
            <strong>{d.name}</strong> · {d.path} · last seen {d.lastSeen}
          </p>
        ))}
      </div>
    </div>
  );
}
