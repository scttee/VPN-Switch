import { describe, expect, test } from "vitest";
import { evaluateAccess, detectRouteConflicts, acceptInvite } from "@kinlink/shared";

describe("core workflows", () => {
  test("share family photo folder grants selected member", () => {
    const decision = evaluateAccess(
      [{ id: "allow-will", subjectType: "user", subjectIdOrValue: "will", action: "allow", resourceId: "family-photos", priority: 50 }],
      { userId: "will", userRole: "member", deviceId: "will-laptop", resourceId: "family-photos", protocol: "https", at: new Date() }
    );
    expect(decision.allowed).toBe(true);
  });

  test("connect two homes identifies overlap", () => {
    const conflicts = detectRouteConflicts([
      { deviceId: "home-mini", cidr: "192.168.1.0/24" },
      { deviceId: "studio-router", cidr: "192.168.1.0/24" }
    ]);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  test("invite acceptance lifecycle", () => {
    const accepted = acceptInvite(
      { id: "i1", token: "secure", workspaceId: "w1", email: "will@example.com", expiresAt: new Date("2100-01-01") },
      new Date("2099-01-01")
    );
    expect(accepted.acceptedAt).toBeTruthy();
  });
});
