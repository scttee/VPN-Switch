import { RouteAdvertisement } from "./types";

type ParsedCidr = { base: number; mask: number; start: number; end: number };

const toInt = (ip: string): number =>
  ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;

const parseCidr = (cidr: string): ParsedCidr => {
  const [ip, bitsRaw] = cidr.split("/");
  const bits = Number(bitsRaw);
  const mask = bits === 0 ? 0 : (~((1 << (32 - bits)) - 1)) >>> 0;
  const base = toInt(ip);
  const start = base & mask;
  const hostMask = (~mask) >>> 0;
  const end = start + hostMask;
  return { base, mask, start, end };
};

export function detectRouteConflicts(routes: RouteAdvertisement[]) {
  const parsed = routes.map((r) => ({ ...r, parsed: parseCidr(r.cidr) }));
  const conflicts: Array<{ a: RouteAdvertisement; b: RouteAdvertisement; suggestion: string }> = [];

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const left = parsed[i];
      const right = parsed[j];
      const overlap = left.parsed.start <= right.parsed.end && right.parsed.start <= left.parsed.end;
      if (overlap) {
        conflicts.push({
          a: { deviceId: left.deviceId, cidr: left.cidr },
          b: { deviceId: right.deviceId, cidr: right.cidr },
          suggestion: "Publish specific resources or renumber one LAN range to avoid ambiguous routing."
        });
      }
    }
  }

  return conflicts;
}
