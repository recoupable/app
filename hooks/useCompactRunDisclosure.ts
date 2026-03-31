"use client";

import { useEffect, useState } from "react";
import { TERMINAL_STATUSES } from "@/components/TasksPage/Run/runDetailsConstants";

export function useCompactRunDisclosure(status: string) {
  const isTerminal = TERMINAL_STATUSES.has(status);
  const [isOpen, setIsOpen] = useState(!isTerminal);

  useEffect(() => {
    if (!isTerminal) {
      setIsOpen(true);
    }
  }, [isTerminal]);

  return { isOpen, setIsOpen };
}
