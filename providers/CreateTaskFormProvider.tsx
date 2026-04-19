"use client";

import React, { createContext, useContext } from "react";
import { useCreateTaskForm } from "@/hooks/useCreateTaskForm";

type CreateTaskFormContextValue = ReturnType<typeof useCreateTaskForm>;

const CreateTaskFormContext = createContext<CreateTaskFormContextValue | null>(
  null,
);

export function CreateTaskFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useCreateTaskForm();
  return (
    <CreateTaskFormContext.Provider value={value}>
      {children}
    </CreateTaskFormContext.Provider>
  );
}

export function useCreateTaskFormContext(): CreateTaskFormContextValue {
  const ctx = useContext(CreateTaskFormContext);
  if (ctx === null) {
    throw new Error(
      "useCreateTaskFormContext must be used within CreateTaskFormProvider",
    );
  }
  return ctx;
}
