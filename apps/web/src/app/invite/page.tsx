"use client";

import { useEffect, useMemo, useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function call(path: string, token: string, body?: unknown, method = "POST") {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

export default function InvitePage() {
  const [token, setToken] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("brother@example.com");
  const [inviteToken, setInviteToken] = useState("");
  const [acceptToken, setAcceptToken] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [myInvites, setMyInvites] = useState<any[]>([]);

  useEffect(() => {
    setToken(localStorage.getItem("kinlinkToken") || "");
    setWorkspaceId(localStorage.getItem("kinlinkWorkspaceId") || "");
  }, []);

  const canCreate = useMemo(() => token && workspaceId && inviteEmail, [token, workspaceId, inviteEmail]);

  return (
    <div>
      <h1>Invite Flow (usable)</h1>
      <p>Create invite for your brother, or accept an invite token after he sends one.</p>

      <div style={{ display: "grid", gap: 12, background: "white", padding: 16, borderRadius: 12 }}>
        <label>Auth token<input value={token} onChange={(e) => { setToken(e.target.value); localStorage.setItem("kinlinkToken", e.target.value); }} style={{ width: "100%" }} /></label>
        <label>Workspace ID<input value={workspaceId} onChange={(e) => { setWorkspaceId(e.target.value); localStorage.setItem("kinlinkWorkspaceId", e.target.value); }} style={{ width: "100%" }} /></label>
        <label>Invite email<input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ width: "100%" }} /></label>
        <button disabled={!canCreate} onClick={async () => {
          const result = await call("/invites", token, { workspaceId, email: inviteEmail, role: "member" });
          setInviteToken(result.token || "");
          setOutput(result);
        }}>Create invite</button>

        <button disabled={!token} onClick={async () => {
          const result = await call("/invites/me", token, undefined, "GET");
          setMyInvites(result.invites || []);
          setOutput(result);
        }}>Load my pending invites</button>

        <label>Invite token to accept<input value={acceptToken} onChange={(e) => setAcceptToken(e.target.value)} style={{ width: "100%" }} /></label>
        <button disabled={!token || !acceptToken} onClick={async () => {
          const result = await call("/invites/accept", token, { token: acceptToken });
          setOutput(result);
        }}>Accept invite</button>
      </div>

      {inviteToken ? <p><strong>Created invite token:</strong> {inviteToken}</p> : null}
      {myInvites.length ? (
        <div>
          <h3>My pending invites</h3>
          <ul>{myInvites.map((i) => <li key={i.token}>{i.email} · {i.workspaceId} · {i.token}</li>)}</ul>
        </div>
      ) : null}
      {output ? <pre style={{ background: "#0b1020", color: "#dbeafe", padding: 12, borderRadius: 12 }}>{JSON.stringify(output, null, 2)}</pre> : null}
    </div>
  );
}
