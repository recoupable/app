import { z } from "zod";
import { isChatIntelligentUIEnabled } from "./isChatIntelligentUIEnabled";

const catalogIdSchema = z.string().uuid().brand<"CatalogId">();
const workspaceIdSchema = z.string().uuid();
const querySchema = z
  .object({
    since: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return (
          Number.isFinite(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }, "since must be a valid UTC date"),
    days: z.string().min(1).pipe(z.coerce.number().int().min(1).max(366)),
    page: z
      .string()
      .min(1)
      .pipe(z.coerce.number().int().min(1).max(1_000_000))
      .default("1"),
    limit: z
      .string()
      .min(1)
      .pipe(z.coerce.number().int().min(1).max(25))
      .default("25"),
  })
  .strict();

export interface CatalogQueryInput {
  since?: string | string[];
  days?: string | string[];
  page?: string | string[];
  limit?: string | string[];
}

export interface CatalogSurfaceRequest {
  workspaceId: string;
  query: z.infer<typeof querySchema> & {
    catalog_id: z.infer<typeof catalogIdSchema>;
  };
}

type CatalogHost =
  | { kind: "absent" }
  | { kind: "invalid" }
  | {
      kind: "catalog";
      subject: { kind: "catalog"; id: z.infer<typeof catalogIdSchema> };
      workspace?: { kind: "organization" | "account"; id: string };
      query?: CatalogSurfaceRequest["query"];
      /** Local request identity only; not a server observation fingerprint. */
      queryKey: string;
    };

/** Browser context only. The API must independently authorize these references. */
export function getChatCatalogHost({
  catalogId,
  catalogQuery,
  workspaceInitialized,
  organizationId,
  accountId,
}: {
  catalogId?: string | string[];
  catalogQuery?: CatalogQueryInput;
  workspaceInitialized: boolean;
  organizationId: string | null;
  accountId?: string;
}): CatalogHost {
  if (!isChatIntelligentUIEnabled() || catalogId === undefined)
    return { kind: "absent" };
  const catalog = catalogIdSchema.safeParse(catalogId);
  if (!catalog.success) return { kind: "invalid" };
  const parsedQuery = querySchema.safeParse(catalogQuery ?? {});
  const query = parsedQuery.success
    ? { catalog_id: catalog.data, ...parsedQuery.data }
    : undefined;
  // A null initial selection is not a deliberate Personal selection.
  const workspace = workspaceIdSchema.safeParse(organizationId ?? accountId);
  return {
    kind: "catalog",
    subject: { kind: "catalog", id: catalog.data },
    query,
    queryKey: JSON.stringify(
      query ?? { invalidCatalogQuery: catalogQuery ?? {} },
    ),
    ...(workspaceInitialized && workspace.success
      ? {
          workspace: {
            kind: organizationId === null ? "account" : "organization",
            id: workspace.data,
          },
        }
      : {}),
  };
}
