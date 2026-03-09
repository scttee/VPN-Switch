import { AccessPolicy, AccessRequest } from "./types";

const withinPortRange = (portRange: string | undefined, port: number | undefined) => {
  if (!portRange || port === undefined) return true;
  const [start, end] = portRange.split("-").map(Number);
  return port >= start && port <= (Number.isNaN(end) ? start : end);
};

const subjectMatches = (policy: AccessPolicy, request: AccessRequest) => {
  if (policy.subjectType === "user") return policy.subjectIdOrValue === request.userId;
  if (policy.subjectType === "membership_role") return policy.subjectIdOrValue === request.userRole;
  return policy.subjectIdOrValue === request.deviceId;
};

export function evaluateAccess(policies: AccessPolicy[], request: AccessRequest): { allowed: boolean; reason: string } {
  const relevant = policies
    .filter((p) => !p.expiresAt || p.expiresAt > request.at)
    .filter((p) => !p.resourceId || p.resourceId === request.resourceId)
    .filter((p) => !p.protocol || p.protocol === request.protocol)
    .filter((p) => withinPortRange(p.portRange, request.port))
    .filter((p) => subjectMatches(p, request))
    .sort((a, b) => b.priority - a.priority);

  const winner = relevant[0];
  if (!winner) return { allowed: false, reason: "No matching policy" };
  return {
    allowed: winner.action === "allow",
    reason: `${winner.action.toUpperCase()} by policy ${winner.id}`
  };
}
