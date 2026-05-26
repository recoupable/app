import { toKebabCase } from "@/lib/string/toKebabCase";
import { RECOUPABLE_GITHUB_OWNER } from "./githubOwner";

/**
 * Builds the GitHub URL for an account's per-account ("personal") repository,
 * used as the fallback when the user has no Recoupable organization selected.
 * Convention: `https://github.com/recoupable/<kebab(account_name)>-<account_id>`.
 *
 * Example: `recoupable/sweetman-fb678396-a68f-4294-ae50-b8cacf9ce77b`.
 *
 * Mirrors `buildOrgRepoUrl` for orgs (which uses an `org-` prefix); personal
 * repos use no prefix because the account name is already the disambiguator.
 *
 * Ported from open-agents `apps/web/lib/recoupable/build-personal-repo-url.ts`
 * so chat.recoupable.com and sandbox.recoupable.com construct the same
 * URL for the same account.
 */
export function buildPersonalRepoUrl(params: {
  accountName: string;
  accountId: string;
}): string {
  const slug = toKebabCase(params.accountName);
  return `https://github.com/${RECOUPABLE_GITHUB_OWNER}/${slug}-${params.accountId}`;
}
