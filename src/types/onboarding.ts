// Permission levels for different modules
export type PermissionLevel = "NONE" | "READ" | "WRITE" | "ISSUE";
export type BasicPermissionLevel = "NONE" | "READ" | "WRITE";
export type ReadOnlyPermissionLevel = "NONE" | "READ";

// Staff roles
export type StaffRole = "ADMIN" | "ACCOUNTANT" | "SALES" | "STAFF" | "VIEWER";

// Invite status
export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

// Permissions structure for a staff member
export interface StaffPermissions {
  invoices: PermissionLevel;
  quotes: PermissionLevel;
  clients: BasicPermissionLevel;
  items: BasicPermissionLevel;
  expenses: BasicPermissionLevel;
  timeTracking: BasicPermissionLevel;
  recurring: BasicPermissionLevel;
  settings: ReadOnlyPermissionLevel;
  exports: ReadOnlyPermissionLevel;
  payments: ReadOnlyPermissionLevel;
}

// Invite token sent to staff member
export interface InviteToken {
  token: string;
  tenantId: string;
  tenantName: string;
  invitedEmail: string;
  role: StaffRole;
  permissions: StaffPermissions;
  expiresAt: string;
  status: InviteStatus;
  invitedBy: string;
  createdAt: string;
}

// Staff user after accepting invite
export interface StaffUser {
  uid: string;
  tenantId: string;
  email: string;
  displayName: string;
  phone?: string;
  role: StaffRole;
  permissions: StaffPermissions;
  twoFactorEnabled: boolean;
  trustedDevices: string[];
  preferredLanguage: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Audit log event types
export type AuditEventType = 
  | "INVITE_ACCEPTED"
  | "STAFF_PROFILE_UPDATED"
  | "TWO_FACTOR_ENABLED"
  | "TRUSTED_DEVICE_ADDED";

// Audit log entry
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  eventType: AuditEventType;
  metadata: Record<string, unknown>;
  timestamp: string;
}

// Profile update payload
export interface ProfileUpdatePayload {
  displayName: string;
  phone?: string;
  preferredLanguage: string;
  timezone: string;
}

// Permission module labels for display
export const PERMISSION_MODULE_LABELS: Record<keyof StaffPermissions, string> = {
  invoices: "Invoices",
  quotes: "Quotes",
  clients: "Clients",
  items: "Items & Services",
  expenses: "Expenses",
  timeTracking: "Time Tracking",
  recurring: "Recurring Invoices",
  settings: "Settings",
  exports: "Data Export",
  payments: "Payments",
};

// Permission level labels for display
export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel | BasicPermissionLevel | ReadOnlyPermissionLevel, string> = {
  NONE: "No Access",
  READ: "View Only",
  WRITE: "Edit",
  ISSUE: "Full Access",
};

// Role labels for display
export const ROLE_LABELS: Record<StaffRole, string> = {
  ADMIN: "Administrator",
  ACCOUNTANT: "Accountant",
  SALES: "Sales Representative",
  STAFF: "Staff Member",
  VIEWER: "Viewer",
};

// Languages supported
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
];

// Common timezones
export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Sao_Paulo", label: "Brasilia Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris / Berlin" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "Mumbai / New Delhi" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
];
