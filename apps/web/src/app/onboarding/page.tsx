"use client";

import { useEffect, useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function get(path: string, token?: string) {
  const res = await fetch(`${apiBase}${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });
  return res.json();
}

export default function OnboardingPage() {
  const [name, setName] = useState("Alex");
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("pass123");
  const [token, setToken] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Family Circle");
  const [workspaceId, setWorkspaceId] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    setToken(localStorage.getItem("kinlinkToken") || "");
    setWorkspaceId(localStorage.getItem("kinlinkWorkspaceId") || "");
  }, []);

  return (
    <div>
      <h1>Onboarding Wizard (usable)</h1>
      <p>Create account → login → create workspace. Token and workspace are stored in your browser for next steps.</p>

      <div style={{ display: "grid", gap: 10, background: "white", padding: 16, borderRadius: 12 }}>
        <h3>Step 1: Sign up</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button onClick={async () => setResult(await post("/auth/signup", { name, email, password }))}>Sign up</button>

        <h3>Step 2: Log in</h3>
        <button onClick={async () => {
          const out = await post("/auth/login", { email, password });
          if (out.token) {
            setToken(out.token);
            localStorage.setItem("kinlinkToken", out.token);
          }
          setResult(out);
        }}>Log in</button>
        <input value={token} onChange={(e) => {
          setToken(e.target.value);
          localStorage.setItem("kinlinkToken", e.target.value);
        }} placeholder="Auth token" />

        <h3>Step 3: Create workspace</h3>
        <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="Workspace name" />
        <button onClick={async () => {
          const out = await post("/workspace", { name: workspaceName }, token);
          if (out.id) {
            setWorkspaceId(out.id);
            localStorage.setItem("kinlinkWorkspaceId", out.id);
          }
          setResult(out);
        }}>Create workspace</button>
        <input value={workspaceId} onChange={(e) => {
          setWorkspaceId(e.target.value);
          localStorage.setItem("kinlinkWorkspaceId", e.target.value);
        }} placeholder="Workspace ID" />
      </div>


      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={async () => setResult(await get("/auth/me", token))} disabled={!token}>Check current session</button>
        <button onClick={async () => {
          const out = await post("/auth/logout", {}, token);
          if (out.ok) {
            localStorage.removeItem("kinlinkToken");
            setToken("");
          }
          setResult(out);
        }} disabled={!token}>Log out</button>
      </div>

      <p>Next: open Invite Flow page and create invite for your brother. Then both of you open Shared Resources and load your access.</p>
      {result ? <pre style={{ background: "#0b1020", color: "#dbeafe", padding: 12, borderRadius: 12 }}>{JSON.stringify(result, null, 2)}</pre> : null}
    </div>
  );
}
