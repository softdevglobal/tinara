import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  CompanySettings,
  TaxRegistration,
  TaxScheme,
  TaxRate,
  PaymentSettings,
  CommunicationSettings,
  SecuritySettings,
  TeamMember,
  AuditLog,
  AuditAction,
  TrustedDevice,
} from "@/types/tax-settings";

// ============================================
// DEFAULT VALUES
// ============================================

const defaultCompanySettings: CompanySettings = {
  id: "company_1",
  companyName: "My Business",
  countryCode: "AU",
  regionCode: undefined,
  baseCurrency: "AUD",
  pricingMode: "EXCLUSIVE",
  roundingMode: "PER_LINE",
  roundingPrecision: 2,
  withholdingTaxEnabled: false,
  taxRegistrations: [
    {
      id: "reg_1",
      countryCode: "AU",
      taxIdLabel: "ABN",
      taxIdValue: "12 345 678 901",
      effectiveFrom: "2020-01-01",
      isActive: true,
    },
  ],
  taxSchemes: [
    {
      id: "scheme_au_gst",
      name: "Australian GST",
      taxType: "GST",
      countryCode: "AU",
      pricingModeDefault: "EXCLUSIVE",
      roundingMode: "PER_LINE",
      roundingPrecision: 2,
      reverseChargeSupported: false,
      exportZeroRatedSupported: true,
      withholdingTaxSupported: false,
      rates: [
        {
          id: "rate_gst_10",
          schemeId: "scheme_au_gst",
          name: "GST 10%",
          ratePercent: 10,
          taxCategory: "STANDARD",
          effectiveFrom: "2000-07-01",
          isDefault: true,
        },
        {
          id: "rate_gst_0",
          schemeId: "scheme_au_gst",
          name: "GST Free",
          ratePercent: 0,
          taxCategory: "ZERO",
          effectiveFrom: "2000-07-01",
          isDefault: false,
        },
      ],
      isActive: true,
    },
  ],
  activeTaxSchemeId: "scheme_au_gst",
  updatedAt: new Date().toISOString(),
};

const defaultPaymentSettings: PaymentSettings = {
  stripeEnabled: false,
  stripeConnected: false,
  paypalEnabled: false,
  paypalConnected: false,
  bankTransferEnabled: true,
  bankDetails: undefined,
};

const defaultCommunicationSettings: CommunicationSettings = {
  sameMessageForAllTypes: true,
  defaultMessage: "Thank you for your business. Please find your document attached.",
  ccEmails: [],
  bccEmails: [],
  reminders: {
    enabled: true,
    threeDaysBefore: true,
    onDueDate: true,
    threeDaysAfter: true,
    sevenDaysAfter: false,
  },
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  trustedDevices: [],
};

// ============================================
// CONTEXT TYPE
// ============================================

interface SettingsContextType {
  // Company Settings
  companySettings: CompanySettings;
  updateCompanySettings: (updates: Partial<CompanySettings>) => void;
  addTaxRegistration: (registration: TaxRegistration) => void;
  removeTaxRegistration: (id: string) => void;
  addTaxScheme: (scheme: TaxScheme) => void;
  updateTaxScheme: (id: string, updates: Partial<TaxScheme>) => void;
  addTaxRate: (schemeId: string, rate: TaxRate) => void;
  updateTaxRate: (schemeId: string, rateId: string, updates: Partial<TaxRate>) => void;
  removeTaxRate: (schemeId: string, rateId: string) => void;
  
  // Payment Settings
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (updates: Partial<PaymentSettings>) => void;
  
  // Communication Settings
  communicationSettings: CommunicationSettings;
  updateCommunicationSettings: (updates: Partial<CommunicationSettings>) => void;
  
  // Security Settings
  securitySettings: SecuritySettings;
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => void;
  addTrustedDevice: (device: TrustedDevice) => void;
  removeTrustedDevice: (id: string) => void;
  removeAllTrustedDevices: () => void;
  
  // Team Members
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  teamMembersLimit: number;
  
  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: AuditAction, description: string, metadata?: Record<string, unknown>) => void;
  
  // Dirty state tracking
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [communicationSettings, setCommunicationSettings] = useState<CommunicationSettings>(defaultCommunicationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "owner_1",
      email: "owner@example.com",
      name: "Account Owner",
      role: "owner",
      permissions: { invoices: true, clients: true, settings: true, exports: true, payments: true },
      invitedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      isActive: true,
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const teamMembersLimit = 5; // Plan limit

  // Company Settings
  const updateCompanySettings = useCallback((updates: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    setHasUnsavedChanges(true);
  }, []);

  const addTaxRegistration = useCallback((registration: TaxRegistration) => {
    setCompanySettings(prev => ({
      ...prev,
      taxRegistrations: [...prev.taxRegistrations, registration],
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const removeTaxRegistration = useCallback((id: string) => {
    setCompanySettings(prev => ({
      ...prev,
      taxRegistrations: prev.taxRegistrations.filter(r => r.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const addTaxScheme = useCallback((scheme: TaxScheme) => {
    setCompanySettings(prev => ({
      ...prev,
      taxSchemes: [...prev.taxSchemes, scheme],
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateTaxScheme = useCallback((id: string, updates: Partial<TaxScheme>) => {
    setCompanySettings(prev => ({
      ...prev,
      taxSchemes: prev.taxSchemes.map(s => s.id === id ? { ...s, ...updates } : s),
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const addTaxRate = useCallback((schemeId: string, rate: TaxRate) => {
    setCompanySettings(prev => ({
      ...prev,
      taxSchemes: prev.taxSchemes.map(s => 
        s.id === schemeId ? { ...s, rates: [...s.rates, rate] } : s
      ),
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateTaxRate = useCallback((schemeId: string, rateId: string, updates: Partial<TaxRate>) => {
    setCompanySettings(prev => ({
      ...prev,
      taxSchemes: prev.taxSchemes.map(s => 
        s.id === schemeId 
          ? { ...s, rates: s.rates.map(r => r.id === rateId ? { ...r, ...updates } : r) }
          : s
      ),
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const removeTaxRate = useCallback((schemeId: string, rateId: string) => {
    setCompanySettings(prev => ({
      ...prev,
      taxSchemes: prev.taxSchemes.map(s => 
        s.id === schemeId 
          ? { ...s, rates: s.rates.filter(r => r.id !== rateId) }
          : s
      ),
      updatedAt: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Payment Settings
  const updatePaymentSettings = useCallback((updates: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Communication Settings
  const updateCommunicationSettings = useCallback((updates: Partial<CommunicationSettings>) => {
    setCommunicationSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Security Settings
  const updateSecuritySettings = useCallback((updates: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  const addTrustedDevice = useCallback((device: TrustedDevice) => {
    setSecuritySettings(prev => ({
      ...prev,
      trustedDevices: [...prev.trustedDevices, device],
    }));
  }, []);

  const removeTrustedDevice = useCallback((id: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      trustedDevices: prev.trustedDevices.filter(d => d.id !== id),
    }));
  }, []);

  const removeAllTrustedDevices = useCallback(() => {
    setSecuritySettings(prev => ({
      ...prev,
      trustedDevices: prev.trustedDevices.filter(d => d.isCurrent),
    }));
  }, []);

  // Team Members
  const addTeamMember = useCallback((member: TeamMember) => {
    setTeamMembers(prev => [...prev, member]);
    setHasUnsavedChanges(true);
  }, []);

  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    setHasUnsavedChanges(true);
  }, []);

  const removeTeamMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    setHasUnsavedChanges(true);
  }, []);

  // Audit Logs
  const addAuditLog = useCallback((
    action: AuditAction, 
    description: string, 
    metadata?: Record<string, unknown>
  ) => {
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      userId: "current_user",
      userEmail: "user@example.com",
      description,
      metadata,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        companySettings,
        updateCompanySettings,
        addTaxRegistration,
        removeTaxRegistration,
        addTaxScheme,
        updateTaxScheme,
        addTaxRate,
        updateTaxRate,
        removeTaxRate,
        paymentSettings,
        updatePaymentSettings,
        communicationSettings,
        updateCommunicationSettings,
        securitySettings,
        updateSecuritySettings,
        addTrustedDevice,
        removeTrustedDevice,
        removeAllTrustedDevices,
        teamMembers,
        addTeamMember,
        updateTeamMember,
        removeTeamMember,
        teamMembersLimit,
        auditLogs,
        addAuditLog,
        hasUnsavedChanges,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
