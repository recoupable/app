/**
 * Centralized UI patterns using semantic tokens from the styling system.
 * All patterns use semantic tokens that automatically adapt to light/dark mode.
 *
 * Reference: documentation/styling-system.md
 *
 * Usage:
 * import { buttonPatterns, cardPatterns, textPatterns } from '@/lib/styles/patterns';
 * <button className={buttonPatterns.primary}>Save</button>
 */

// ============================================================================
// Button Patterns
// ============================================================================

export const buttonPatterns = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",

  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",

  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors",

  ghost: "hover:bg-accent hover:text-accent-foreground transition-colors",

  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",

  icon: "p-2 cursor-pointer hover:bg-accent rounded-full transition-colors",
} as const;

// ============================================================================
// Form Patterns
// ============================================================================

export const formPatterns = {
  input:
    "w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  label: "text-sm font-medium text-foreground",

  error: "text-sm text-destructive",

  textarea:
    "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  helper: "text-sm text-muted-foreground",
} as const;

// ============================================================================
// Card/Container Patterns
// ============================================================================

export const containerPatterns = {
  card: "bg-card text-card-foreground border border-border rounded-lg shadow-sm",

  cardHover:
    "bg-card text-card-foreground border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow",

  modal: "bg-card text-card-foreground border border-border rounded-lg shadow-lg",

  modalOverlay:
    "fixed left-0 top-0 w-screen h-screen z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm",

  sidebar: "bg-sidebar border-r border-sidebar-border",

  dropdown: "bg-popover text-popover-foreground border border-border rounded-md shadow-md",

  popover: "bg-popover text-popover-foreground border border-border rounded-md shadow-md",
} as const;

// ============================================================================
// Text Patterns
// ============================================================================

export const textPatterns = {
  primary: "text-foreground",

  secondary: "text-muted-foreground",

  muted: "text-muted-foreground",

  placeholder: "text-muted-foreground",

  heading: "text-foreground font-semibold",

  error: "text-destructive",

  success: "text-green-600 dark:text-green-400",

  link: "text-primary hover:underline",
} as const;

// ============================================================================
// Icon Patterns
// ============================================================================

export const iconPatterns = {
  primary: "text-foreground",

  secondary: "text-muted-foreground",

  muted: "text-muted-foreground",

  error: "text-destructive",

  success: "text-green-600 dark:text-green-400",
} as const;

// ============================================================================
// Border Patterns
// ============================================================================

export const borderPatterns = {
  default: "border border-border",

  light: "border border-border/50",

  focus: "border border-input focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-2",

  divider: "border-b border-border",
} as const;

// ============================================================================
// Interactive State Patterns
// ============================================================================

export const statePatterns = {
  hover: "hover:bg-accent",

  active: "bg-accent",

  selected: "bg-accent text-accent-foreground",

  disabled: "opacity-50 cursor-not-allowed pointer-events-none",

  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
} as const;

// ============================================================================
// Skeleton/Loading Patterns
// ============================================================================

export const loadingPatterns = {
  skeleton: "animate-pulse bg-muted rounded-md",

  shimmer: "animate-shimmer bg-gradient-to-r from-muted via-accent to-muted",

  spinner: "animate-spin text-muted-foreground",
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Combine multiple pattern classes with custom classes
 *
 * @param patterns - Array of pattern strings
 * @param customClasses - Additional custom classes
 */
export const combinePatterns = (...patterns: string[]): string => {
  return patterns.filter(Boolean).join(" ");
};
