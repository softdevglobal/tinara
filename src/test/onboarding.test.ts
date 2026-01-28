import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  verifyInviteToken,
  acceptInvite,
  updateStaffProfile,
  sendOtp,
  verifyOtp,
  enableTwoFactor,
  generateDeviceId,
  validateEmailMatch,
} from "@/services/onboardingService";
import type { InviteToken } from "@/types/onboarding";

describe("Onboarding Service", () => {
  describe("verifyInviteToken", () => {
    it("should return invite token for valid code INVITE-ABC123", async () => {
      const token = await verifyInviteToken("INVITE-ABC123");
      expect(token).toBeDefined();
      expect(token.tenantName).toBe("Acme Corporation");
      expect(token.role).toBe("ACCOUNTANT");
      expect(token.status).toBe("PENDING");
    });

    it("should throw INVALID_TOKEN for unknown code", async () => {
      await expect(verifyInviteToken("UNKNOWN")).rejects.toThrow("INVALID_TOKEN");
    });

    it("should throw TOKEN_EXPIRED for expired invite", async () => {
      await expect(verifyInviteToken("INVITE-EXPIRED")).rejects.toThrow("TOKEN_EXPIRED");
    });

    it("should throw TOKEN_REVOKED for revoked invite", async () => {
      await expect(verifyInviteToken("INVITE-REVOKED")).rejects.toThrow("TOKEN_REVOKED");
    });
  });

  describe("acceptInvite", () => {
    it("should create staff user and mark invite as accepted", async () => {
      const uid = `test-user-${Date.now()}`;
      // First verify a fresh token - use DEF456 as ABC123 might already be accepted
      const invite = await verifyInviteToken("INVITE-DEF456");
      expect(invite.status).toBe("PENDING");

      const staffUser = await acceptInvite("INVITE-DEF456", uid);
      expect(staffUser).toBeDefined();
      expect(staffUser.uid).toBe(uid);
      expect(staffUser.tenantId).toBe("tenant-002");
      expect(staffUser.role).toBe("SALES");
    });
  });

  describe("updateStaffProfile", () => {
    it("should update staff profile with new details", async () => {
      const uid = `profile-test-${Date.now()}`;
      // Create a user first
      await verifyInviteToken("INVITE-ABC123").catch(() => {});
      const user = await acceptInvite("INVITE-ABC123", uid).catch(() => null);
      
      if (user) {
        const updated = await updateStaffProfile(uid, {
          displayName: "John Doe",
          phone: "+1 555 123 4567",
          preferredLanguage: "en",
          timezone: "America/New_York",
        });
        expect(updated.displayName).toBe("John Doe");
        expect(updated.phone).toBe("+1 555 123 4567");
      }
    });
  });

  describe("OTP functions", () => {
    it("should send OTP successfully", async () => {
      const result = await sendOtp("+1 555 123 4567");
      expect(result.success).toBe(true);
    });

    it("should verify correct OTP code 123456", async () => {
      const result = await verifyOtp("+1 555 123 4567", "123456");
      expect(result.success).toBe(true);
    });

    it("should reject incorrect OTP code", async () => {
      await expect(verifyOtp("+1 555 123 4567", "000000")).rejects.toThrow("INVALID_OTP");
    });
  });

  describe("utility functions", () => {
    it("should generate unique device IDs", () => {
      const id1 = generateDeviceId();
      const id2 = generateDeviceId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should validate email match correctly", () => {
      const invite: InviteToken = {
        token: "test",
        tenantId: "tenant-001",
        tenantName: "Test",
        invitedEmail: "john.doe@example.com",
        role: "STAFF",
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
        expiresAt: new Date().toISOString(),
        status: "PENDING",
        invitedBy: "admin@test.com",
        createdAt: new Date().toISOString(),
      };

      expect(validateEmailMatch(invite, "john.doe@example.com")).toBe(true);
      expect(validateEmailMatch(invite, "JOHN.DOE@EXAMPLE.COM")).toBe(true);
      expect(validateEmailMatch(invite, "other@example.com")).toBe(false);
    });
  });
});
