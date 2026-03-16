"use client";

import { Copy, Check } from "lucide-react";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";

interface CopyIconButtonProps {
  value: string;
  className?: string;
  size?: string;
}

const CopyIconButton = ({
  value,
  className,
  size = "size-3.5",
}: CopyIconButtonProps) => {
  const { copied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copy(value);
      }}
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors",
        className,
      )}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className={cn(size, "text-green-600 dark:text-green-400")} />
      ) : (
        <Copy className={size} />
      )}
    </button>
  );
};

export default CopyIconButton;
