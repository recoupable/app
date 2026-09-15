"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useUserProvider } from "@/providers/UserProvder";
import { requestContextSwitch } from "@/lib/chat/requestContextSwitch";
import { isActiveChatRoomPath } from "@/lib/chat/isActiveChatRoomPath";

interface OrganizationContextType {
  selectedOrgId: string | null;
  isInitialized: boolean;
  setSelectedOrgId: (orgId: string | null) => void;
  isOrgSettingsOpen: boolean;
  openOrgSettings: (orgId: string) => void;
  closeOrgSettings: () => void;
  editingOrgId: string | null;
  isCreateOrgOpen: boolean;
  openCreateOrg: () => void;
  closeCreateOrg: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "selectedOrgId";

const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useUserProvider();
  const [selectedOrgId, setSelectedOrgIdState] = useState<string | null>(null);
  const accountId = userData?.account_id;
  const [initializedAccount, setInitializedAccount] = useState<string | null>(
    null,
  );
  const isInitialized = !!accountId && initializedAccount === accountId;
  const [isOrgSettingsOpen, setIsOrgSettingsOpen] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const previousOrgId = useRef<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!accountId) return;
    const stored = localStorage.getItem(`${STORAGE_KEY}:${accountId}`);
    setSelectedOrgIdState(stored);
    previousOrgId.current = stored;
    setInitializedAccount(accountId);
  }, [accountId]);

  // Save to localStorage when changed and navigate away from chat rooms
  const setSelectedOrgId = useCallback(
    (orgId: string | null) => {
      const isActualChange = previousOrgId.current !== orgId;

      if (!isActualChange) return;
      requestContextSwitch(() => {
        // Reset the destination workspace, including when switching out of a chat.
        const key = "RECOUP_ARTIST_SELECTIONS";
        let selections = {};
        try {
          selections = JSON.parse(localStorage.getItem(key) || "{}");
        } catch {
          /* Reset invalid preferences. */
        }
        localStorage.setItem(
          key,
          JSON.stringify({
            ...selections,
            [`${userData?.account_id ?? "signed-out"}:${orgId ?? "personal"}`]:
              null,
          }),
        );
        window.dispatchEvent(new StorageEvent("local-storage", { key }));
        setSelectedOrgIdState(orgId);
        previousOrgId.current = orgId;

        if (orgId) {
          localStorage.setItem(`${STORAGE_KEY}:${accountId}`, orgId);
        } else {
          localStorage.removeItem(`${STORAGE_KEY}:${accountId}`);
        }

        // Hard-nav — `silentlyUpdateUrl` updates the URL bar without syncing Next's router.
        if (isActualChange && isActiveChatRoomPath(window.location.pathname)) {
          window.location.href = "/";
        }
      });
    },
    [userData?.account_id, accountId],
  );

  const openOrgSettings = useCallback((orgId: string) => {
    setEditingOrgId(orgId);
    setIsOrgSettingsOpen(true);
  }, []);

  const closeOrgSettings = useCallback(() => {
    setIsOrgSettingsOpen(false);
    setEditingOrgId(null);
  }, []);

  const openCreateOrg = useCallback(() => {
    setIsCreateOrgOpen(true);
  }, []);

  const closeCreateOrg = useCallback(() => {
    setIsCreateOrgOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      selectedOrgId: isInitialized ? selectedOrgId : null,
      isInitialized,
      setSelectedOrgId,
      isOrgSettingsOpen,
      openOrgSettings,
      closeOrgSettings,
      editingOrgId,
      isCreateOrgOpen,
      openCreateOrg,
      closeCreateOrg,
    }),
    [
      selectedOrgId,
      setSelectedOrgId,
      isInitialized,
      isOrgSettingsOpen,
      openOrgSettings,
      closeOrgSettings,
      editingOrgId,
      isCreateOrgOpen,
      openCreateOrg,
      closeCreateOrg,
    ],
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider",
    );
  }
  return context;
};

export { OrganizationProvider, useOrganization };
