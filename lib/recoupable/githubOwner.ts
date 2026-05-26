/**
 * The GitHub organization that owns every Recoupable workspace repo,
 * both per-Recoupable-org repos (`recoupable/org-<slug>-<id>`) and
 * per-account personal repos (`recoupable/<slug>-<account_id>`).
 *
 * Single source of truth so renames or alternate-environment overrides
 * stay in lockstep across builders, parsers, and GitHub API callers.
 *
 * Ported from open-agents `apps/web/lib/recoupable/github-owner.ts`.
 */
export const RECOUPABLE_GITHUB_OWNER = "recoupable";
