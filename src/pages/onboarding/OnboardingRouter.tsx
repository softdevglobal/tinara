import { Routes, Route, Navigate } from "react-router-dom";
import { OnboardingProvider } from "@/context/OnboardingContext";
import {
  OnboardingEntry,
  OnboardingInvite,
  OnboardingProfile,
  OnboardingPermissions,
  OnboardingSecurity,
  OnboardingFinish,
} from "@/pages/onboarding";

export default function OnboardingRouter() {
  return (
    <OnboardingProvider>
      <Routes>
        <Route index element={<OnboardingEntry />} />
        <Route path="invite" element={<OnboardingInvite />} />
        <Route path="profile" element={<OnboardingProfile />} />
        <Route path="permissions" element={<OnboardingPermissions />} />
        <Route path="security" element={<OnboardingSecurity />} />
        <Route path="finish" element={<OnboardingFinish />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </OnboardingProvider>
  );
}
