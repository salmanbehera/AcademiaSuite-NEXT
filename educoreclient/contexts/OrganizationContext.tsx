"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DEFAULT_ORG_CONFIG } from "@/lib/config";

// Organization Context Types
export interface OrganizationContextType {
  organizationId: string;
  branchId: string;
  setOrganizationId: (id: string) => void;
  setBranchId: (id: string) => void;
  updateOrgConfig: (orgId: string, branchId: string) => void;
  isReady: boolean; // Added to know when context is initialized
}

// Create Context
const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

// Provider Props
interface OrganizationProviderProps {
  children: ReactNode;
}

// JWT Token interface (for future implementation)
interface JWTPayload {
  organizationId?: string;
  branchId?: string;
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

// Decode JWT without verification (for client-side extraction only)
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Organization Provider Component
export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [organizationId, setOrganizationId] = useState<string>(
    DEFAULT_ORG_CONFIG.organizationId
  );
  const [branchId, setBranchId] = useState<string>(DEFAULT_ORG_CONFIG.branchId);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load from JWT token or localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // TODO: Priority 1 - Try to get from JWT token
      const authToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (authToken) {
        const payload = decodeJWT(authToken);
        if (payload?.organizationId && payload?.branchId) {
          setOrganizationId(payload.organizationId?.toString().trim());
          setBranchId(payload.branchId?.toString().trim());
          setIsReady(true);
          return;
        }
      }

      // Fallback to localStorage values
      const savedOrgId = localStorage.getItem("organizationId");
      const savedBranchId = localStorage.getItem("branchId");

      // Validate saved IDs - if they don't match expected format or are invalid, reset to defaults
      const isValidGuid = (id: string | null) =>
        id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id.trim()
        );

      if (savedOrgId && isValidGuid(savedOrgId)) {
        setOrganizationId(savedOrgId.trim());
      } else {
        // Reset to default if invalid
        setOrganizationId(DEFAULT_ORG_CONFIG.organizationId);
        localStorage.setItem(
          "organizationId",
          DEFAULT_ORG_CONFIG.organizationId
        );
      }

      if (savedBranchId && isValidGuid(savedBranchId)) {
        setBranchId(savedBranchId.trim());
      } else {
        // Reset to default if invalid
        setBranchId(DEFAULT_ORG_CONFIG.branchId);
        localStorage.setItem("branchId", DEFAULT_ORG_CONFIG.branchId);
      }

      setIsReady(true);
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    if (typeof window !== "undefined" && isReady) {
      localStorage.setItem("organizationId", organizationId);
      localStorage.setItem("branchId", branchId);
    }
  }, [organizationId, branchId, isReady]);

  // Helper function to update both values at once
  const updateOrgConfig = (orgId: string, branchId: string) => {
    setOrganizationId(orgId);
    setBranchId(branchId);
  };

  // Wrap the setters to ensure values are trimmed before being stored
  const setOrganizationIdTrimmed = (id: string) =>
    setOrganizationId(id?.toString().trim());
  const setBranchIdTrimmed = (id: string) => setBranchId(id?.toString().trim());

  const value: OrganizationContextType = {
    organizationId,
    branchId,
    setOrganizationId: setOrganizationIdTrimmed,
    setBranchId: setBranchIdTrimmed,
    updateOrgConfig,
    isReady,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

// Custom hook to use Organization Context
export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }

  return context;
}

// Helper hook to get organization data for API calls with validation
export function useOrgData() {
  const { organizationId, branchId, isReady } = useOrganization();

  return {
    organizationId,
    branchId,
    isReady,
    // Common payload structure for API calls
    getOrgPayload: () => ({
      organizationId,
      branchId,
    }),
    // Helper to inject org/branch IDs into any data object
    withOrgData: <T extends Record<string, any>>(data: T) => ({
      ...data,
      organizationId,
      branchId,
    }),
    // Check if data is available and ready
    isDataReady: isReady && !!organizationId && !!branchId,
  };
}
