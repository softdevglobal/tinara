import {
  InviteToken,
  StaffUser,
  StaffPermissions,
  ProfileUpdatePayload,
  AuditEventType,
  AuditLogEntry,
} from "@/types/onboarding";

// Simulated delay for async operations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock invite tokens for testing
const mockInviteTokens: Record<string, InviteToken> = {
  "INVITE-ABC123": {
    token: "INVITE-ABC123",
    tenantId: "tenant-001",
    tenantName: "Acme Corporation",
    invitedEmail: "john.doe@example.com",
    role: "ACCOUNTANT",
    permissions: {
      invoices: "ISSUE",
      quotes: "WRITE",
      clients: "READ",
      items: "READ",
      expenses: "WRITE",
      timeTracking: "WRITE",
      recurring: "READ",
      settings: "READ",
      exports: "READ",
      payments: "READ",
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "PENDING",
    invitedBy: "admin@acme.com",
    createdAt: new Date().toISOString(),
  },
  "INVITE-DEF456": {
    token: "INVITE-DEF456",
    tenantId: "tenant-002",
    tenantName: "Tech Solutions Ltd",
    invitedEmail: "jane.smith@example.com",
    role: "SALES",
    permissions: {
      invoices: "READ",
      quotes: "ISSUE",
      clients: "WRITE",
      items: "READ",
      expenses: "NONE",
      timeTracking: "NONE",
      recurring: "NONE",
      settings: "NONE",
      exports: "NONE",
      payments: "NONE",
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "PENDING",
    invitedBy: "manager@techsolutions.com",
    createdAt: new Date().toISOString(),
  },
  "INVITE-EXPIRED": {
    token: "INVITE-EXPIRED",
    tenantId: "tenant-001",
    tenantName: "Acme Corporation",
    invitedEmail: "expired@example.com",
    role: "VIEWER",
    permissions: {
      invoices: "READ",
      quotes: "READ",
      clients: "READ",
      items: "READ",
      expenses: "READ",
      timeTracking: "READ",
      recurring: "READ",
      settings: "NONE",
      exports: "NONE",
      payments: "NONE",
    },
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "EXPIRED",
    invitedBy: "admin@acme.com",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  "INVITE-REVOKED": {
    token: "INVITE-REVOKED",
    tenantId: "tenant-001",
    tenantName: "Acme Corporation",
    invitedEmail: "revoked@example.com",
    role: "STAFF",
    permissions: {
      invoices: "WRITE",
      quotes: "WRITE",
      clients: "WRITE",
      items: "WRITE",
      expenses: "WRITE",
      timeTracking: "WRITE",
      recurring: "WRITE",
      settings: "NONE",
      exports: "NONE",
      payments: "NONE",
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "REVOKED",
    invitedBy: "admin@acme.com",
    createdAt: new Date().toISOString(),
  },
};

// Mock staff users storage
const staffUsers: Record<string, StaffUser> = {};

// Mock audit log
const auditLog: AuditLogEntry[] = [];

// Current authenticated user (stub)
let currentAuthUser: { uid: string; email: string } | null = null;

/**
 * Stub: Get current authenticated user
 * In production, this would use Firebase Auth or similar
 */
export async function getCurrentUser(): Promise<{ uid: string; email: string } | null> {
  await delay(100);
  return currentAuthUser;
}

/**
 * Stub: Set current authenticated user (for testing)
 */
export function setCurrentUser(user: { uid: string; email: string } | null): void {
  currentAuthUser = user;
}

/**
 * Verify an invite token
 * Returns the invite details or throws an error
 */
export async function verifyInviteToken(token: string): Promise<InviteToken> {
  await delay(500);

  const invite = mockInviteTokens[token.toUpperCase()];

  if (!invite) {
    throw new Error("INVALID_TOKEN");
  }

  if (invite.status === "EXPIRED" || new Date(invite.expiresAt) < new Date()) {
    throw new Error("TOKEN_EXPIRED");
  }

  if (invite.status === "REVOKED") {
    throw new Error("TOKEN_REVOKED");
  }

  if (invite.status === "ACCEPTED") {
    throw new Error("TOKEN_ALREADY_USED");
  }

  return invite;
}

/**
 * Accept an invite and create a staff user
 */
export async function acceptInvite(
  token: string,
  uid: string
): Promise<StaffUser> {
  await delay(700);

  const invite = await verifyInviteToken(token);

  // Create staff user
  const staffUser: StaffUser = {
    uid,
    tenantId: invite.tenantId,
    email: invite.invitedEmail,
    displayName: "",
    role: invite.role,
    permissions: invite.permissions,
    twoFactorEnabled: false,
    trustedDevices: [],
    preferredLanguage: "en",
    timezone: "America/New_York",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  staffUsers[uid] = staffUser;

  // Mark invite as accepted
  mockInviteTokens[token.toUpperCase()].status = "ACCEPTED";

  // Log audit event
  await logAuditEvent(invite.tenantId, uid, "INVITE_ACCEPTED", {
    token,
    role: invite.role,
    invitedBy: invite.invitedBy,
  });

  return staffUser;
}

/**
 * Update staff profile
 */
export async function updateStaffProfile(
  uid: string,
  payload: ProfileUpdatePayload
): Promise<StaffUser> {
  await delay(500);

  const user = staffUsers[uid];
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  user.displayName = payload.displayName;
  user.phone = payload.phone;
  user.preferredLanguage = payload.preferredLanguage;
  user.timezone = payload.timezone;
  user.updatedAt = new Date().toISOString();

  staffUsers[uid] = user;

  await logAuditEvent(user.tenantId, uid, "STAFF_PROFILE_UPDATED", {
    displayName: payload.displayName,
    phone: payload.phone,
    preferredLanguage: payload.preferredLanguage,
    timezone: payload.timezone,
  });

  return user;
}

/**
 * Enable two-factor authentication
 * Stub: In production, this would send an OTP to the phone
 */
export async function sendOtp(phone: string): Promise<{ success: boolean }> {
  await delay(1000);
  console.log(`[STUB] OTP sent to ${phone}`);
  return { success: true };
}

/**
 * Verify OTP code
 * Stub: Always accepts "123456" as valid
 */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ success: boolean }> {
  await delay(800);
  if (code === "123456") {
    return { success: true };
  }
  throw new Error("INVALID_OTP");
}

/**
 * Enable two-factor authentication for a user
 */
export async function enableTwoFactor(
  uid: string,
  phone: string
): Promise<StaffUser> {
  await delay(500);

  const user = staffUsers[uid];
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  user.twoFactorEnabled = true;
  user.phone = phone;
  user.updatedAt = new Date().toISOString();

  staffUsers[uid] = user;

  await logAuditEvent(user.tenantId, uid, "TWO_FACTOR_ENABLED", {
    phone,
  });

  return user;
}

/**
 * Add trusted device
 */
export async function addTrustedDevice(
  uid: string,
  deviceId: string
): Promise<StaffUser> {
  await delay(300);

  const user = staffUsers[uid];
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.trustedDevices.includes(deviceId)) {
    user.trustedDevices.push(deviceId);
  }
  user.updatedAt = new Date().toISOString();

  staffUsers[uid] = user;

  await logAuditEvent(user.tenantId, uid, "TRUSTED_DEVICE_ADDED", {
    deviceId,
  });

  return user;
}

/**
 * Get role and permissions for a user
 */
export async function getMyRoleAndPermissions(
  uid: string
): Promise<{ role: string; permissions: StaffPermissions }> {
  await delay(200);

  const user = staffUsers[uid];
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    role: user.role,
    permissions: user.permissions,
  };
}

/**
 * Get staff user by UID
 */
export async function getStaffUser(uid: string): Promise<StaffUser | null> {
  await delay(200);
  return staffUsers[uid] || null;
}

/**
 * Log an audit event
 */
async function logAuditEvent(
  tenantId: string,
  userId: string,
  eventType: AuditEventType,
  metadata: Record<string, unknown>
): Promise<void> {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    userId,
    eventType,
    metadata,
    timestamp: new Date().toISOString(),
  };

  auditLog.push(entry);
  console.log(`[AUDIT] ${eventType}:`, entry);
}

/**
 * Generate a device ID (stub)
 */
export function generateDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an email matches the invited email
 */
export function validateEmailMatch(
  invite: InviteToken,
  userEmail: string
): boolean {
  return invite.invitedEmail.toLowerCase() === userEmail.toLowerCase();
}
