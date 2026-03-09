import { detectRouteConflicts } from "./route-conflicts";
import { RouteAdvertisement } from "./types";

export interface HomeBridgeInput {
  homeAName: string;
  homeBName: string;
  homeACidr: string;
  homeBCidr: string;
  internetReachable: boolean;
}

export interface HomeBridgePlan {
  feasible: boolean;
  mode: "direct-or-relay-overlay" | "resource-publish-only";
  summary: string;
  recommendations: string[];
}

export function buildHomeBridgePlan(input: HomeBridgeInput): HomeBridgePlan {
  if (!input.internetReachable) {
    return {
      feasible: false,
      mode: "resource-publish-only",
      summary: "Cannot establish overlay while one home is offline.",
      recommendations: [
        "Bring both home agents online.",
        "Verify outbound UDP and HTTPS connectivity.",
        "Use temporary resource publishing until both agents are reachable."
      ]
    };
  }

  const conflicts = detectRouteConflicts([
    { deviceId: input.homeAName, cidr: input.homeACidr } as RouteAdvertisement,
    { deviceId: input.homeBName, cidr: input.homeBCidr } as RouteAdvertisement
  ]);

  if (conflicts.length > 0) {
    return {
      feasible: true,
      mode: "resource-publish-only",
      summary: `Homes are reachable over encrypted overlay, but subnet overlap prevents safe full-LAN routing (${input.homeACidr} vs ${input.homeBCidr}).`,
      recommendations: [
        "Publish specific resources (NAS, photos, dashboard, printer) by name.",
        "Use per-resource policies instead of broad subnet routes.",
        "Optionally renumber one LAN range for full subnet routing later."
      ]
    };
  }

  return {
    feasible: true,
    mode: "direct-or-relay-overlay",
    summary: `Encrypted home-to-home overlay is suitable between ${input.homeAName} and ${input.homeBName}. Distance (e.g. Sydney ↔ Brisbane) is supported; latency may be higher than local Wi-Fi.`,
    recommendations: [
      "Approve only required routes/resources (least privilege).",
      "Enable friendly DNS names for shared services.",
      "Use diagnostics to verify direct path first, relay fallback if needed."
    ]
  };
}
