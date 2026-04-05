/**
 * Single source of truth for all role-related configuration used across
 * the onboarding flow. Import from here instead of defining per-file.
 */

export interface RoleConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  companyLabel: string;
  artistPlaceholder: string;
}

export const ONBOARDING_ROLES: RoleConfig[] = [
  {
    id: "artist_manager",
    label: "Artist Manager",
    icon: "🎯",
    description: "I manage one or more artists",
    companyLabel: "Management company",
    artistPlaceholder: "Search for an artist you manage…",
  },
  {
    id: "label",
    label: "Record Label",
    icon: "🏷️",
    description: "I run a label or imprint",
    companyLabel: "Label name",
    artistPlaceholder: "Search for a roster artist…",
  },
  {
    id: "artist",
    label: "Artist",
    icon: "🎤",
    description: "I'm the artist",
    companyLabel: "Your artist name or team",
    artistPlaceholder: "Search for yourself or a collaborator…",
  },
  {
    id: "publisher",
    label: "Publisher",
    icon: "📝",
    description: "I handle publishing & sync",
    companyLabel: "Publishing company",
    artistPlaceholder: "Search for a catalog artist…",
  },
  {
    id: "dsp",
    label: "DSP / Platform",
    icon: "📱",
    description: "I work at a streaming platform",
    companyLabel: "Company / Platform",
    artistPlaceholder: "Search for an artist…",
  },
  {
    id: "other",
    label: "Other",
    icon: "✨",
    description: "Something else entirely",
    companyLabel: "Company or organization",
    artistPlaceholder: "Search for an artist…",
  },
];

export const ROLE_CONFIG_MAP = Object.fromEntries(
  ONBOARDING_ROLES.map(r => [r.id, r]),
) as Record<string, RoleConfig>;

export function getRoleConfig(roleId: string | undefined): RoleConfig {
  return (
    ROLE_CONFIG_MAP[roleId ?? ""] ?? {
      id: "other",
      label: "Other",
      icon: "✨",
      description: "",
      companyLabel: "Company",
      artistPlaceholder: "Search for an artist…",
    }
  );
}
