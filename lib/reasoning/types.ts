/**
 * Reasoning Types
 *
 * Shared type definitions for reasoning components.
 * Single responsibility: Type definitions for reasoning system.
 */

import { type LucideIcon } from "lucide-react";

export interface ReasoningStep {
  icon: LucideIcon;
  label: string;
  description?: string;
  status: "complete" | "active" | "pending";
  content: string;
}

export interface ParsedStep {
  label: string;
  description?: string;
  content: string;
}
