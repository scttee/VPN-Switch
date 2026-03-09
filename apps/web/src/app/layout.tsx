import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, sans-serif", background: "#f6f7fb", margin: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
          <aside style={{ background: "#0f172a", color: "#fff", padding: 20 }}>
            <h2>Kinlink</h2>
            <p style={{ opacity: 0.8 }}>Trusted private overlay network</p>
            <nav style={{ display: "grid", gap: 8 }}>
              {[
                "Dashboard","People","Devices","Shared Resources","Photos","Routes","Policies","DNS","Activity Log","Invite Flow","Onboarding Wizard","Settings"
              ].map((item) => (
                <span key={item} style={{ opacity: 0.9 }}>{item}</span>
              ))}
            </nav>
          </aside>
          <main style={{ padding: 28 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
