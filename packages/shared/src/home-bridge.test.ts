import { describe, expect, test } from "vitest";
import { buildHomeBridgePlan } from "./home-bridge";

describe("home bridge planner", () => {
  test("supports distant homes when internet is available and CIDRs do not overlap", () => {
    const plan = buildHomeBridgePlan({
      homeAName: "Sydney Home",
      homeBName: "Brisbane Home",
      homeACidr: "192.168.10.0/24",
      homeBCidr: "192.168.20.0/24",
      internetReachable: true
    });

    expect(plan.feasible).toBe(true);
    expect(plan.mode).toBe("direct-or-relay-overlay");
    expect(plan.summary).toContain("Sydney");
  });

  test("falls back to resource-publish-only when CIDRs overlap", () => {
    const plan = buildHomeBridgePlan({
      homeAName: "Sydney Home",
      homeBName: "Brisbane Home",
      homeACidr: "192.168.1.0/24",
      homeBCidr: "192.168.1.0/24",
      internetReachable: true
    });

    expect(plan.feasible).toBe(true);
    expect(plan.mode).toBe("resource-publish-only");
  });
});
