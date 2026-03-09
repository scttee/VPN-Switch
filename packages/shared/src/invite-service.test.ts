import { describe, expect, test } from "vitest";
import { acceptInvite, revokeInvite } from "./invite-service";

const baseInvite = {
  id: "i1",
  token: "tok",
  workspaceId: "w1",
  email: "will@example.com",
  expiresAt: new Date("2100-01-01")
};

describe("invite lifecycle", () => {
  test("accept succeeds for valid invite", () => {
    const accepted = acceptInvite(baseInvite, new Date("2099-01-01"));
    expect(accepted.acceptedAt).toBeTruthy();
  });

  test("revocation blocks acceptance", () => {
    const revoked = revokeInvite(baseInvite, new Date("2099-01-01"));
    expect(() => acceptInvite(revoked, new Date("2099-01-02"))).toThrow("revoked");
  });
});
