import { describe, expect, test } from "vitest";
import { detectRouteConflicts } from "./route-conflicts";

describe("route conflicts", () => {
  test("detects overlapping home ranges", () => {
    const conflicts = detectRouteConflicts([
      { deviceId: "home-a", cidr: "192.168.1.0/24" },
      { deviceId: "home-b", cidr: "192.168.1.0/24" },
      { deviceId: "home-c", cidr: "10.30.0.0/24" }
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].suggestion).toContain("Publish specific resources");
  });
});
