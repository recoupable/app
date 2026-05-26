import { toKebabCase } from "@/lib/string/toKebabCase";
import { RECOUPABLE_GITHUB_OWNER } from "./githubOwner";

/**
 * Builds the GitHub URL for a Recoupable org's per-org repository.
 * Convention: `https://github.com/recoupable/org-<kebab(name)>-<organization_id>`.
 *
 * Ported from open-agents `apps/web/lib/recoupable/build-org-repo-url.ts`
 * so chat.recoupable.com and sandbox.recoupable.com construct the same
 * URL for the same org.
 */
export function buildOrgRepoUrl(params: {
  organizationName: string;
  organizationId: string;
}): string {
  const slug = toKebabCase(params.organizationName);
  return `https://github.com/${RECOUPABLE_GITHUB_OWNER}/org-${slug}-${params.organizationId}`;
}
