"use client";

import { useEffect, useState } from "react";
import { resources as seeded } from "../../lib/demo-data";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function ResourcesPage() {
  const [token, setToken] = useState("");
  const [resources, setResources] = useState<any[]>(seeded);
  const [message, setMessage] = useState("Showing seeded preview until you load your account resources.");

  useEffect(() => {
    setToken(localStorage.getItem("kinlinkToken") || "");
  }, []);

  return (
    <div>
      <h1>Shared Resources</h1>
      <p>Load the resources your logged-in account can access.</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input value={token} onChange={(e) => { setToken(e.target.value); localStorage.setItem("kinlinkToken", e.target.value); }} placeholder="Auth token" style={{ minWidth: 420 }} />
        <button onClick={async () => {
          const res = await fetch(`${apiBase}/resources/me`, { headers: { authorization: `Bearer ${token}` } });
          const out = await res.json();
          if (Array.isArray(out.resources)) {
            setResources(out.resources);
            setMessage(out.resources.length ? "Loaded from API" : "No resources yet. Join/accept workspace invite first.");
          } else {
            setMessage(out.error || "Failed to load resources");
          }
        }}>Load my resources</button>
      </div>
      <small>{message}</small>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        {resources.map((r) => (
          <article key={r.name + r.publishedName} style={{ background: "white", borderRadius: 12, padding: 14 }}>
            <h3 style={{ margin: 0 }}>{r.name}</h3>
            <p style={{ margin: "8px 0" }}>{r.type || "resource"} · {r.publishedName}</p>
            <p style={{ margin: "8px 0" }}>Visibility: {r.visibility || "workspace"}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
