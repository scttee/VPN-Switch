import type { ReactNode } from "react";
import { Shell } from "../components/shell";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, sans-serif", background: "#f6f7fb", margin: 0 }}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
