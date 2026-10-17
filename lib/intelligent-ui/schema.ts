import { z } from "zod";
import { validateUniqueIds } from "./validateUniqueIds";
import {
  identifierSchema as id,
  labelSchema as label,
  revisionSchema as revision,
  evidenceIdsSchema as evidenceIds,
} from "./contractValues";
import { distributionSchema, timelineSchema } from "./representations/schemas";
import { validateRepresentation } from "./representations/validateRepresentation";
import { answerSchema } from "./presentation/answerSchema";
import { validateAnswer } from "./presentation/validateAnswer";

export const evidenceSchema = z
  .object({
    id,
    label,
    sourceLabel: label,
    observedAt: z
      .string()
      .max(64)
      .datetime({ offset: true })
      .refine(
        (value) => Number.isFinite(Date.parse(value)),
        "Invalid timestamp",
      ),
    text: z.string().min(1).max(8000),
    kind: z.enum(["observed", "submitted", "derived", "proposed"]),
    status: z.enum(["current", "partial", "withdrawn"]),
    href: z
      .string()
      .max(2048)
      .url()
      .refine((value) => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && !url.username && !url.password;
        } catch {
          return false;
        }
      }, "Evidence links must use HTTPS without credentials")
      .optional(),
  })
  .strict();

const summarySchema = z
  .object({
    type: z.literal("summary"),
    id,
    title: label,
    text: z.string().min(1).max(12000),
    evidenceIds,
  })
  .strict();

const metricsSchema = z
  .object({
    type: z.literal("metrics"),
    id,
    title: label,
    items: z
      .array(
        z
          .object({
            id,
            label,
            value: z.string().max(1000),
            detail: z.string().max(2000).optional(),
            evidenceIds,
          })
          .strict(),
      )
      .max(12),
  })
  .strict();

const collectionSchema = z
  .object({
    type: z.literal("collection"),
    id,
    title: label,
    columns: z
      .array(z.object({ key: id, label }).strict())
      .min(1)
      .max(12),
    rows: z
      .array(
        z
          .object({
            id,
            label,
            values: z.record(id, z.string().max(2000)),
            evidenceIds,
          })
          .strict(),
      )
      .max(200),
    complete: z.boolean(),
    totalCount: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .optional(),
  })
  .strict();

const checklistSchema = z
  .object({
    type: z.literal("checklist"),
    id,
    title: label,
    items: z
      .array(
        z
          .object({
            id,
            label,
            detail: z.string().max(2000).optional(),
            status: z.enum(["ready", "needs-review", "missing"]),
            evidenceIds,
          })
          .strict(),
      )
      .max(50),
  })
  .strict();

export const componentSchema = z
  .discriminatedUnion("type", [
    summarySchema,
    metricsSchema,
    collectionSchema,
    checklistSchema,
    distributionSchema,
    timelineSchema,
  ])
  .superRefine((component, ctx) => {
    if (component.type === "distribution" || component.type === "timeline") {
      validateRepresentation(component, ctx);
      return;
    }
    if (component.type === "metrics" || component.type === "checklist") {
      validateUniqueIds(
        component.items.map((item) => item.id),
        ctx,
        ["items"],
      );
    }
    if (component.type !== "collection") return;
    validateUniqueIds(
      component.columns.map((column) => column.key),
      ctx,
      ["columns"],
    );
    validateUniqueIds(
      component.rows.map((row) => row.id),
      ctx,
      ["rows"],
    );
    const keys = new Set(component.columns.map((column) => column.key));
    component.rows.forEach((row, index) => {
      for (const key of Object.keys(row.values)) {
        if (!keys.has(key)) {
          ctx.addIssue({
            code: "custom",
            path: ["rows", index, "values", key],
            message: "Unknown collection column",
          });
        }
      }
    });
    if (
      component.totalCount !== undefined &&
      (component.totalCount < component.rows.length ||
        (component.complete && component.totalCount !== component.rows.length))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["totalCount"],
        message: "Collection count contradicts loaded rows or completeness",
      });
    }
  });

export const surfaceSchema = z
  .object({
    schemaVersion: z.literal(1),
    id,
    revision,
    title: label,
    description: z.string().max(2000),
    context: z
      .object({
        workspaceId: id,
        subject: z.object({ kind: id, id, label }).strict(),
      })
      .strict(),
    components: z.array(componentSchema).max(24),
    evidence: z.array(evidenceSchema).max(128),
    fallbackText: z.string().min(1).max(24000),
    answer: answerSchema.optional(),
  })
  .strict()
  .superRefine((surface, ctx) => {
    validateAnswer(surface, ctx);
    validateUniqueIds(
      surface.components.map((component) => component.id),
      ctx,
      ["components"],
    );
    validateUniqueIds(
      surface.evidence.map((entry) => entry.id),
      ctx,
      ["evidence"],
    );
    const available = new Set(surface.evidence.map((entry) => entry.id));
    const rowIds = new Set<string>();
    surface.components.forEach((component, index) => {
      // View selection uses bare row IDs, so identities must stay unambiguous
      // even when separate collections appear in the same surface.
      if (component.type === "collection") {
        component.rows.forEach((row, rowIndex) => {
          if (rowIds.has(row.id)) {
            ctx.addIssue({
              code: "custom",
              path: ["components", index, "rows", rowIndex, "id"],
              message: "Collection row IDs must be unique across the surface",
            });
          }
          rowIds.add(row.id);
        });
      }
      const references =
        component.type === "summary"
          ? [
              {
                ids: component.evidenceIds,
                path: ["components", index, "evidenceIds"],
              },
            ]
          : (component.type === "collection"
              ? component.rows
              : component.type === "timeline"
                ? component.sections
                : component.items
            ).map((item, itemIndex) => ({
              ids: item.evidenceIds,
              path: [
                "components",
                index,
                component.type === "collection"
                  ? "rows"
                  : component.type === "timeline"
                    ? "sections"
                    : "items",
                itemIndex,
                "evidenceIds",
              ],
            }));
      for (const reference of references) {
        reference.ids.forEach((evidenceId, evidenceIndex) => {
          if (!available.has(evidenceId)) {
            ctx.addIssue({
              code: "custom",
              path: [...reference.path, evidenceIndex],
              message: `Unknown evidence ID: ${evidenceId}`,
            });
          }
        });
      }
    });
  });

export const surfaceEventSchema = z
  .discriminatedUnion("type", [
    z
      .object({ type: z.literal("surface.snapshot"), surface: surfaceSchema })
      .strict(),
    z
      .object({
        type: z.literal("surface.patch"),
        surfaceId: id,
        baseRevision: revision,
        revision,
        upsert: z.array(componentSchema).max(24),
        remove: z.array(id).max(24),
        evidence: z.array(evidenceSchema).max(128).optional(),
        fallbackText: z.string().min(1).max(24000).optional(),
        answer: answerSchema.optional(),
      })
      .strict(),
    z
      .object({ type: z.literal("surface.complete"), surfaceId: id, revision })
      .strict(),
  ])
  .superRefine((event, ctx) => {
    if (event.type !== "surface.patch") return;
    validateUniqueIds(
      event.upsert.map((component) => component.id),
      ctx,
      ["upsert"],
    );
    validateUniqueIds(event.remove, ctx, ["remove"]);
    if (event.evidence)
      validateUniqueIds(
        event.evidence.map((entry) => entry.id),
        ctx,
        ["evidence"],
      );
    const removed = new Set(event.remove);
    event.upsert.forEach((component, index) => {
      if (removed.has(component.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["upsert", index],
          message:
            "A component cannot be removed and upserted in the same patch",
        });
      }
    });
  });

export type Evidence = z.infer<typeof evidenceSchema>;
export type SurfaceComponent = z.infer<typeof componentSchema>;
export type Component = SurfaceComponent;
export type SummaryComponent = z.infer<typeof summarySchema>;
export type MetricsComponent = z.infer<typeof metricsSchema>;
export type CollectionComponent = z.infer<typeof collectionSchema>;
export type ChecklistComponent = z.infer<typeof checklistSchema>;
export type Surface = z.infer<typeof surfaceSchema>;
export type SurfaceEvent = z.infer<typeof surfaceEventSchema>;
