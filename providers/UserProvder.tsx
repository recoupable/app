"use client";

import useUser from "@/hooks/useUser";
import { useAutoLogin } from "@/hooks/useAutoLogin";
import React, { createContext, useContext, useMemo } from "react";

const UserContext = createContext<ReturnType<typeof useUser>>(
  {} as ReturnType<typeof useUser>,
);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  const value = useMemo(() => ({ ...user }), [user]);

  return (
    <UserContext.Provider value={value}>
      <UserAutoLogin />
      {children}
    </UserContext.Provider>
  );
};

/** Runs auto-login under the provider so `useUserProvider` sees real user state. */
function UserAutoLogin() {
  useAutoLogin();
  return null;
}

const useUserProvider = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserProvider must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUserProvider };
