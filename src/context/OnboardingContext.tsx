import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  InviteToken,
  StaffUser,
  ProfileUpdatePayload,
} from "@/types/onboarding";
import * as onboardingService from "@/services/onboardingService";
import { useToast } from "@/hooks/use-toast";

// Onboarding steps
export const ONBOARDING_STEPS = [
  { key: "entry", label: "Enter Code", path: "/onboarding" },
  { key: "invite", label: "Accept Invite", path: "/onboarding/invite" },
  { key: "profile", label: "Your Profile", path: "/onboarding/profile" },
  { key: "permissions", label: "Permissions", path: "/onboarding/permissions" },
  { key: "security", label: "Security", path: "/onboarding/security" },
  { key: "finish", label: "Complete", path: "/onboarding/finish" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["key"];

interface OnboardingState {
  currentStep: OnboardingStep;
  inviteToken: InviteToken | null;
  staffUser: StaffUser | null;
  isLoading: boolean;
  error: string | null;
}

interface OnboardingContextValue extends OnboardingState {
  // Navigation
  goToStep: (step: OnboardingStep) => void;
  getCurrentStepIndex: () => number;

  // Actions
  verifyToken: (token: string) => Promise<boolean>;
  acceptInvite: () => Promise<boolean>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<boolean>;
  enableTwoFactor: (phone: string) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, code: string) => Promise<boolean>;
  addTrustedDevice: () => Promise<boolean>;
  finishOnboarding: () => void;

  // State management
  setError: (error: string | null) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

const initialState: OnboardingState = {
  currentStep: "entry",
  inviteToken: null,
  staffUser: null,
  isLoading: false,
  error: null,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getCurrentStepIndex = useCallback(() => {
    return ONBOARDING_STEPS.findIndex((s) => s.key === state.currentStep);
  }, [state.currentStep]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      const stepConfig = ONBOARDING_STEPS.find((s) => s.key === step);
      if (stepConfig) {
        setState((prev) => ({ ...prev, currentStep: step, error: null }));
        navigate(stepConfig.path);
      }
    },
    [navigate]
  );

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const verifyToken = useCallback(
    async (token: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const inviteToken = await onboardingService.verifyInviteToken(token);
        setState((prev) => ({
          ...prev,
          inviteToken,
          isLoading: false,
        }));
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to verify token";
        let friendlyMessage = "Invalid invite code";

        if (message === "TOKEN_EXPIRED") {
          friendlyMessage = "This invite has expired. Please request a new one.";
        } else if (message === "TOKEN_REVOKED") {
          friendlyMessage = "This invite has been revoked by the administrator.";
        } else if (message === "TOKEN_ALREADY_USED") {
          friendlyMessage = "This invite has already been used.";
        } else if (message === "INVALID_TOKEN") {
          friendlyMessage = "Invalid invite code. Please check and try again.";
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: friendlyMessage,
        }));
        toast({
          title: "Invalid Invite",
          description: friendlyMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  const acceptInvite = useCallback(async (): Promise<boolean> => {
    if (!state.inviteToken) {
      setError("No invite token found");
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // For stub purposes, generate a user ID
      const uid = `user-${Date.now()}`;
      const staffUser = await onboardingService.acceptInvite(
        state.inviteToken.token,
        uid
      );

      setState((prev) => ({
        ...prev,
        staffUser,
        isLoading: false,
      }));

      toast({
        title: "Invite Accepted",
        description: `Welcome to ${state.inviteToken.tenantName}!`,
      });

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to accept invite";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      toast({
        title: "Error",
        description: "Failed to accept invite. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.inviteToken, toast, setError]);

  const updateProfile = useCallback(
    async (payload: ProfileUpdatePayload): Promise<boolean> => {
      if (!state.staffUser) {
        setError("No user found");
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const updatedUser = await onboardingService.updateStaffProfile(
          state.staffUser.uid,
          payload
        );

        setState((prev) => ({
          ...prev,
          staffUser: updatedUser,
          isLoading: false,
        }));

        toast({
          title: "Profile Saved",
          description: "Your profile has been updated.",
        });

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update profile";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [state.staffUser, toast, setError]
  );

  const sendOtp = useCallback(
    async (phone: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await onboardingService.sendOtp(phone);
        setState((prev) => ({ ...prev, isLoading: false }));
        toast({
          title: "OTP Sent",
          description: `A verification code has been sent to ${phone}`,
        });
        return true;
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  const verifyOtp = useCallback(
    async (phone: string, code: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await onboardingService.verifyOtp(phone, code);
        setState((prev) => ({ ...prev, isLoading: false }));
        return true;
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  const enableTwoFactor = useCallback(
    async (phone: string): Promise<boolean> => {
      if (!state.staffUser) {
        setError("No user found");
        return false;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const updatedUser = await onboardingService.enableTwoFactor(
          state.staffUser.uid,
          phone
        );

        setState((prev) => ({
          ...prev,
          staffUser: updatedUser,
          isLoading: false,
        }));

        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been enabled.",
        });

        return true;
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast({
          title: "Error",
          description: "Failed to enable 2FA. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [state.staffUser, toast, setError]
  );

  const addTrustedDevice = useCallback(async (): Promise<boolean> => {
    if (!state.staffUser) {
      return false;
    }

    try {
      const deviceId = onboardingService.generateDeviceId();
      await onboardingService.addTrustedDevice(state.staffUser.uid, deviceId);

      toast({
        title: "Device Trusted",
        description: "This device has been added as trusted for 30 days.",
      });

      return true;
    } catch (err) {
      return false;
    }
  }, [state.staffUser, toast]);

  const finishOnboarding = useCallback(() => {
    toast({
      title: "Welcome!",
      description: "Your account setup is complete.",
    });
    navigate("/");
  }, [navigate, toast]);

  const resetOnboarding = useCallback(() => {
    setState(initialState);
  }, []);

  const value: OnboardingContextValue = {
    ...state,
    goToStep,
    getCurrentStepIndex,
    verifyToken,
    acceptInvite,
    updateProfile,
    sendOtp,
    verifyOtp,
    enableTwoFactor,
    addTrustedDevice,
    finishOnboarding,
    setError,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
