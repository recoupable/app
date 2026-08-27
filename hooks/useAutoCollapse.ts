/**
 * Custom hook for auto-collapse behavior
 * 
 * Single Responsibility: Manages auto-open/close state based on streaming status
 * Used by components that need to automatically collapse when content finishes loading
 */

import { useEffect, useRef, useState } from 'react';

interface UseAutoCollapseOptions {
  isStreaming: boolean;
  defaultOpen?: boolean;
  hasContent: boolean;
}

export function useAutoCollapse({
  isStreaming,
  defaultOpen = true,
  hasContent,
}: UseAutoCollapseOptions) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasAutoClosedRef = useRef(false);

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming && !isOpen) {
      setIsOpen(true);
      hasAutoClosedRef.current = false;
    }
  }, [isStreaming, isOpen]);

  // Auto-close immediately when streaming ends (once only)
  useEffect(() => {
    if (defaultOpen && !isStreaming && isOpen && !hasAutoClosedRef.current && hasContent) {
      setIsOpen(false);
      hasAutoClosedRef.current = true;
    }
  }, [isStreaming, isOpen, defaultOpen, hasContent]);

  return { isOpen, setIsOpen };
}

