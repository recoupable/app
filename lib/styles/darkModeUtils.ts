/**
 * Dark mode utility functions using semantic tokens.
 * All utilities use semantic tokens that automatically adapt to light/dark mode.
 *
 * Reference: documentation/styling-system.md
 */

// ============================================================================
// Background Utilities
// ============================================================================

export const bgUtils = {
  primary: "bg-background",
  secondary: "bg-muted",
  tertiary: "bg-card",
  input: "bg-background",
  hover: "hover:bg-accent",
  active: "bg-accent",
} as const;

// ============================================================================
// Text Color Utilities
// ============================================================================

export const textUtils = {
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  muted: "text-muted-foreground",
  placeholder: "text-muted-foreground",
} as const;

// ============================================================================
// Border Utilities
// ============================================================================

export const borderUtils = {
  default: "border-border",
  light: "border-border/50",
  focus: "focus:border-ring",
} as const;

// ============================================================================
// Shadow Utilities
// ============================================================================

export const shadowUtils = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const;

// ============================================================================
// Component-Specific Utilities
// ============================================================================

/**
 * Common input field styling with semantic tokens
 *
 * @param hasError
 */
export const getInputClasses = (hasError = false): string => {
  const base =
    "w-full rounded-md border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  if (hasError) {
    return `${base} border-destructive focus-visible:ring-destructive`;
  }

  return `${base} border-input`;
};

/**
 * Common button styling with semantic tokens
 *
 * @param variant
 */
export const getButtonClasses = (
  variant: "primary" | "secondary" | "danger" | "ghost" | "outline" = "primary",
): string => {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return `${base} ${variants[variant]}`;
};

/**
 * Common card/container styling with semantic tokens
 *
 * @param interactive
 */
export const getCardClasses = (interactive = false): string => {
  const base = "bg-card text-card-foreground border border-border rounded-lg shadow-sm";

  if (interactive) {
    return `${base} hover:shadow-md transition-shadow cursor-pointer`;
  }

  return base;
};

/**
 * Common dropdown/menu styling with semantic tokens
 */
export const getDropdownClasses = (): string => {
  return "bg-popover text-popover-foreground border border-border rounded-md shadow-md";
};

/**
 * Common modal overlay styling with semantic tokens
 */
export const getModalOverlayClasses = (): string => {
  return "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm";
};

/**
 * Common skeleton loader styling with semantic tokens
 */
export const getSkeletonClasses = (): string => {
  return "animate-pulse bg-muted rounded-md";
};

/**
 * Icon wrapper with semantic tokens
 *
 * @param variant
 */
export const getIconClasses = (variant: "primary" | "secondary" | "muted" = "primary"): string => {
  const variants = {
    primary: "text-foreground",
    secondary: "text-muted-foreground",
    muted: "text-muted-foreground",
  };

  return variants[variant];
};
