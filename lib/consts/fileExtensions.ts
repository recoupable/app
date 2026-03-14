/**
 * Shared file extension configurations
 */

export const TEXT_EXTENSIONS = [
  ".txt",
  ".csv",
  ".json",
  ".md",
  ".log",
  ".xml",
  ".yaml",
  ".yml",
] as const;

export type TextExtension = (typeof TEXT_EXTENSIONS)[number];
