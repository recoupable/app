import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseCopyReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * Hook for copying text to clipboard with visual feedback
 *
 * @param resetDelay - Time in milliseconds before resetting the copied state (default: 2000)
 * @returns Object with copied state and copy function
 */
export function useCopy(resetDelay: number = 2000): UseCopyReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = async (text: string): Promise<void> => {
    if (!navigator?.clipboard?.writeText) {
      toast.error("Clipboard API is not available in this browser");
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, resetDelay);
    } catch (error: unknown) {
      toast.error((error as Error)?.message || "Failed to copy to clipboard");
    }
  };

  return { copied, copy };
}
