import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  ["Dashboard", "/"],
  ["People", "/people"],
  ["Devices", "/devices"],
  ["Shared Resources", "/resources"],
  ["Photos", "/photos"],
  ["Routes", "/routes"],
  ["Policies", "/policies"],
  ["DNS", "/dns"],
  ["Activity Log", "/activity"],
  ["Invite Flow", "/invite"],
  ["Onboarding Wizard", "/onboarding"],
  ["Settings", "/settings"]
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ background: "#0f172a", color: "#fff", padding: 20 }}>
        <h2>Kinlink</h2>
        <p style={{ opacity: 0.8, marginTop: 0 }}>Trusted private overlay network</p>
        <nav style={{ display: "grid", gap: 8 }}>
          {nav.map(([label, href]) => (
            <Link key={href} href={href} style={{ color: "#dbeafe", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ padding: 28 }}>{children}</main>
    </div>
  );
}
