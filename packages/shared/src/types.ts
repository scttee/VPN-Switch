export type MembershipRole = "owner" | "admin" | "member" | "guest";
export type SubjectType = "user" | "membership_role" | "device";
export type Action = "allow" | "deny";

export interface AccessPolicy {
  id: string;
  subjectType: SubjectType;
  subjectIdOrValue: string;
  action: Action;
  resourceId?: string;
  protocol?: string;
  portRange?: string;
  priority: number;
  expiresAt?: Date;
}

export interface AccessRequest {
  userId: string;
  userRole: MembershipRole;
  deviceId: string;
  resourceId: string;
  protocol?: string;
  port?: number;
  at: Date;
}

export interface RouteAdvertisement {
  deviceId: string;
  cidr: string;
}

export interface Invite {
  id: string;
  token: string;
  workspaceId: string;
  email: string;
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
}
