import { describe, expect, test } from "vitest";
import { evaluateAccess } from "./policy-engine";

describe("policy engine", () => {
  test("deny with higher priority wins", () => {
    const result = evaluateAccess(
      [
        { id: "allow", subjectType: "user", subjectIdOrValue: "will", action: "allow", resourceId: "photos", priority: 10 },
        { id: "deny", subjectType: "user", subjectIdOrValue: "will", action: "deny", resourceId: "photos", priority: 90 }
      ],
      { userId: "will", userRole: "member", deviceId: "dev-1", resourceId: "photos", at: new Date() }
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("deny");
  });
});
