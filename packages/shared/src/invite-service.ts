import { Invite } from "./types";

export function acceptInvite(invite: Invite, at: Date): Invite {
  if (invite.revokedAt) throw new Error("Invite revoked");
  if (invite.acceptedAt) throw new Error("Invite already accepted");
  if (invite.expiresAt <= at) throw new Error("Invite expired");
  return { ...invite, acceptedAt: at };
}

export function revokeInvite(invite: Invite, at: Date): Invite {
  if (invite.acceptedAt) throw new Error("Cannot revoke accepted invite");
  if (invite.revokedAt) return invite;
  return { ...invite, revokedAt: at };
}
