const cards = [
  { title: "Online Devices", value: "4/5", note: "1 relay-only" },
  { title: "Shared Resources", value: "5", note: "2 photo libraries" },
  { title: "Pending Invites", value: "1", note: "Will invited" },
  { title: "Route Health", value: "Conflict", note: "192.168.1.0/24 overlap" }
];

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p>Kinlink provides secure access to resources you own or are explicitly authorized to share.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <section key={card.title} style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
            <h3 style={{ margin: "0 0 10px" }}>{card.title}</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{card.value}</p>
            <small>{card.note}</small>
          </section>
        ))}
      </div>
      <h2>Visual Map</h2>
      <p>Alex MacBook ↔ Home Mini PC ↔ Living Room NAS (Family Photos, Media Library)</p>
      <p>Will Laptop → Family Photos (allow), Erin Tablet → Kitchen Printer (allow)</p>
    </div>
  );
}
