export const workspace = {
  name: "Family Circle",
  pendingInvites: 1,
  routeHealth: "1 conflict",
  onlineDevices: 4,
  totalDevices: 5
};

export const people = [
  { name: "Alex", role: "Owner", access: "All resources", status: "active" },
  { name: "Will", role: "Member", access: "Family Photos, Media Library", status: "active" },
  { name: "Erin", role: "Member", access: "Kitchen Printer", status: "active" }
];

export const devices = [
  { name: "Alex MacBook", owner: "Alex", platform: "macOS", ip: "100.64.0.10", path: "direct", lastSeen: "2 min ago", resources: 2 },
  { name: "Home Mini PC", owner: "Alex", platform: "Linux", ip: "100.64.0.2", path: "direct", lastSeen: "just now", resources: 3 },
  { name: "Will Laptop", owner: "Will", platform: "Windows", ip: "100.64.0.21", path: "relay", lastSeen: "1 min ago", resources: 1 },
  { name: "Living Room NAS", owner: "Alex", platform: "Linux", ip: "100.64.0.30", path: "direct", lastSeen: "just now", resources: 2 },
  { name: "Erin Tablet", owner: "Erin", platform: "Android", ip: "100.64.0.40", path: "offline", lastSeen: "1 h ago", resources: 0 }
];

export const resources = [
  { name: "Family Photos", type: "photos", published: "will-photos.kin", origin: "Living Room NAS", access: "Alex, Will", status: "online" },
  { name: "Studio Archive", type: "folder", published: "studio-nas.kin", origin: "Home Mini PC", access: "Alex", status: "online" },
  { name: "Kitchen Printer", type: "printer", published: "printer.home.kin", origin: "Home Mini PC", access: "Erin", status: "online" },
  { name: "Home Dashboard", type: "https", published: "dashboard.home.kin", origin: "Home Mini PC", access: "Alex, Will", status: "online" },
  { name: "Media Library", type: "media", published: "media.kin", origin: "Living Room NAS", access: "Alex, Will", status: "degraded" }
];
