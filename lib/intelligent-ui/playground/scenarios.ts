import type { Component, Evidence, Surface, SurfaceEvent } from "../schema";
import { getCompletedExample } from "./getCompletedExample";
import { createSupplierScenario } from "./createSupplierScenario";
import { listeningScenario } from "./listeningScenario";
import { songScenario } from "./songScenario";

export type ScenarioId =
  | "release"
  | "sourcing"
  | "supplier"
  | "listening"
  | "song";
export type PlaygroundScenario = {
  id: ScenarioId;
  label: string;
  category: string;
  prompt: string;
  initial: Surface;
  events: SurfaceEvent[];
};

const releaseEvidence: Evidence[] = [
  {
    id: "delivery-sheet",
    label: "Delivery sheet · revision 3",
    sourceLabel: "Fictional label / delivery worksheet",
    observedAt: "2026-10-16T09:00:00Z",
    kind: "submitted",
    status: "current",
    text: "SYNTHETIC EXAMPLE. Four tracks are planned for the Night Swimming EP. Glasshouse and Low Tide have masters and artwork. After Hours has a master but is missing artwork. Daybreak has a master, but its contributor confirmation is still pending. Maya coordinates Glasshouse and Low Tide; Jules coordinates After Hours and Daybreak. This worksheet is a submitted claim, not proof of ownership or delivery.",
  },
  {
    id: "contributor-note",
    label: "Contributor follow-up",
    sourceLabel: "Fictional project / review note",
    observedAt: "2026-10-16T09:05:00Z",
    kind: "observed",
    status: "partial",
    text: "SYNTHETIC EXAMPLE. The example project contains contributor confirmations for Glasshouse, Low Tide, and After Hours. No confirmation for Daybreak is included. A missing document is a review item; it does not establish whether a right exists.",
  },
  {
    id: "release-assessment",
    label: "Readiness calculation",
    sourceLabel: "Example rule / required materials",
    observedAt: "2026-10-16T09:06:00Z",
    kind: "derived",
    status: "partial",
    text: "SYNTHETIC EXAMPLE. A track is marked ready for review only when a master, artwork, and contributor confirmation appear in this fixture. Two of four tracks meet that condition. This is neither an approval nor a distribution action.",
  },
];

const releaseRows = [
  {
    id: "glasshouse",
    label: "Glasshouse",
    values: {
      material: "Master + artwork",
      review: "Ready for review",
      owner: "Maya",
    },
    evidenceIds: ["delivery-sheet", "contributor-note"],
  },
  {
    id: "low-tide",
    label: "Low Tide",
    values: {
      material: "Master + artwork",
      review: "Ready for review",
      owner: "Maya",
    },
    evidenceIds: ["delivery-sheet", "contributor-note"],
  },
  {
    id: "after-hours",
    label: "After Hours",
    values: {
      material: "Artwork missing",
      review: "Needs artwork",
      owner: "Jules",
    },
    evidenceIds: ["delivery-sheet"],
  },
  {
    id: "daybreak",
    label: "Daybreak",
    values: {
      material: "Master; artwork unconfirmed",
      review: "Confirm contributors; check artwork",
      owner: "Jules",
    },
    evidenceIds: ["delivery-sheet", "contributor-note"],
  },
];

const releaseCollection: Component = {
  type: "collection",
  id: "release-tracks",
  title: "Track readiness",
  columns: [
    { key: "material", label: "Materials" },
    { key: "review", label: "Next step" },
    { key: "owner", label: "Owner" },
  ],
  rows: releaseRows,
  complete: true,
  totalCount: 4,
};
const releaseMetrics: Component = {
  type: "metrics",
  id: "release-metrics",
  title: "At a glance",
  items: [
    {
      id: "tracks",
      label: "Tracks reviewed",
      value: "4 / 4",
      detail: "All example records received",
      evidenceIds: ["delivery-sheet"],
    },
    {
      id: "ready",
      label: "Ready for review",
      value: "2",
      detail: "Materials present; not approved",
      evidenceIds: ["release-assessment"],
    },
    {
      id: "followups",
      label: "Open follow-ups",
      value: "2",
      detail: "Artwork and contributor confirmation",
      evidenceIds: ["delivery-sheet", "contributor-note"],
    },
  ],
};
const releaseInitial: Surface = {
  schemaVersion: 1,
  id: "example-release",
  revision: 0,
  title: "Night Swimming",
  description: "Release readiness · four-track EP",
  context: {
    workspaceId: "example-label",
    subject: {
      kind: "release",
      id: "night-swimming",
      label: "Night Swimming EP",
    },
  },
  components: [
    {
      type: "summary",
      id: "release-summary",
      title: "A clear next step",
      text: "The release is taking shape. Review the materials, inspect the source behind each claim, and collect your follow-ups before making a decision.",
      evidenceIds: ["delivery-sheet"],
    },
    {
      type: "metrics",
      id: "release-metrics",
      title: "At a glance",
      items: [
        {
          id: "tracks",
          label: "Tracks received",
          value: "2 / 4",
          detail: "Example stream has more records",
          evidenceIds: ["delivery-sheet"],
        },
        {
          id: "ready",
          label: "Readiness",
          value: "In progress",
          detail: "Waiting for the complete example",
          evidenceIds: ["delivery-sheet"],
        },
      ],
    },
    { ...releaseCollection, rows: releaseRows.slice(0, 2), complete: false },
  ],
  evidence: releaseEvidence,
  fallbackText:
    "Synthetic Night Swimming example. Two of four tracks received: Glasshouse and Low Tide have masters and artwork. More example records are pending. Source: fictional delivery worksheet, revision 3. No release approval or delivery has occurred.",
};

const sourcingEvidence: Evidence[] = [
  {
    id: "quote-sheet",
    label: "Supplier quotes · October",
    sourceLabel: "Fictional operations / quote comparison",
    observedAt: "2026-10-16T10:00:00Z",
    kind: "submitted",
    status: "current",
    text: "SYNTHETIC EXAMPLE. For 500 reusable studio bags, Northline quoted $2,400 with a 21-day lead time; Common Ground quoted $2,650 with a 14-day lead time; Fieldwork quoted $2,250 with a 28-day lead time. These are invented quotes, not offers from real suppliers.",
  },
  {
    id: "sample-log",
    label: "Sample review log",
    sourceLabel: "Fictional operations / sample notes",
    observedAt: "2026-10-16T10:05:00Z",
    kind: "observed",
    status: "partial",
    text: "SYNTHETIC EXAMPLE. Northline and Common Ground have sample reviews in the fixture. Fieldwork has no sample review. Material certification is not included for any supplier; no purchasing approval is recorded.",
  },
  {
    id: "sourcing-assessment",
    label: "Review recommendation",
    sourceLabel: "Example rule / lead-time comparison",
    observedAt: "2026-10-16T10:06:00Z",
    kind: "proposed",
    status: "partial",
    text: "SYNTHETIC EXAMPLE. Common Ground has the shortest quoted lead time. That observation is a proposal for further review. It does not authorize a purchase, validate a certification, or establish that a quote remains available.",
  },
];
const sourcingRows = [
  {
    id: "northline",
    label: "Northline",
    values: { quote: "$2,400", lead: "21 days", review: "Sample reviewed" },
    evidenceIds: ["quote-sheet", "sample-log"],
  },
  {
    id: "common-ground",
    label: "Common Ground",
    values: { quote: "$2,650", lead: "14 days", review: "Sample reviewed" },
    evidenceIds: ["quote-sheet", "sample-log"],
  },
  {
    id: "fieldwork",
    label: "Fieldwork",
    values: { quote: "$2,250", lead: "28 days", review: "Sample pending" },
    evidenceIds: ["quote-sheet", "sample-log"],
  },
];
const sourcingCollection: Component = {
  type: "collection",
  id: "supplier-quotes",
  title: "Supplier comparison",
  columns: [
    { key: "quote", label: "Quote / 500 units" },
    { key: "lead", label: "Lead time" },
    { key: "review", label: "Review" },
  ],
  rows: sourcingRows,
  complete: true,
  totalCount: 3,
};
const sourcingInitial: Surface = {
  schemaVersion: 1,
  id: "example-sourcing",
  revision: 0,
  title: "Studio essentials",
  description: "Supplier review · reusable studio bags",
  context: {
    workspaceId: "example-studio",
    subject: {
      kind: "sourcing-review",
      id: "studio-bags",
      label: "Studio bags / 500 units",
    },
  },
  components: [
    {
      type: "summary",
      id: "sourcing-summary",
      title: "Compare with confidence",
      text: "Compare the quotes, check what the sample notes actually support, and save a shortlist. The same working surface adapts to an operations decision.",
      evidenceIds: ["quote-sheet"],
    },
    {
      type: "metrics",
      id: "sourcing-metrics",
      title: "At a glance",
      items: [
        {
          id: "quotes",
          label: "Quote rows loaded",
          value: "1 / 3",
          detail: "Example stream has more records",
          evidenceIds: ["quote-sheet"],
        },
        {
          id: "volume",
          label: "Order quantity",
          value: "500",
          detail: "Units in the example request",
          evidenceIds: ["quote-sheet"],
        },
      ],
    },
    { ...sourcingCollection, rows: sourcingRows.slice(0, 1), complete: false },
  ],
  evidence: sourcingEvidence,
  fallbackText:
    "Synthetic supplier example for 500 studio bags. One of three quote rows loaded: Northline, $2,400, 21 days, sample reviewed. Source: fictional October quote comparison and sample log. No purchase has been approved or placed.",
};

const protocolScenarios: PlaygroundScenario[] = [
  {
    id: "release",
    label: "Release readiness",
    category: "Music",
    prompt: "What needs attention before this EP is ready?",
    initial: releaseInitial,
    events: [
      { type: "surface.snapshot", surface: releaseInitial },
      {
        type: "surface.patch",
        surfaceId: releaseInitial.id,
        baseRevision: 0,
        revision: 1,
        upsert: [releaseCollection, releaseMetrics],
        remove: [],
        fallbackText:
          "Synthetic Night Swimming example. All four tracks received. Glasshouse and Low Tide are ready for review. After Hours needs artwork; Daybreak needs contributor confirmation and its artwork is unconfirmed. Sources: fictional delivery worksheet revision 3, contributor follow-up, and readiness calculation. No release approval or delivery has occurred.",
      },
      {
        type: "surface.patch",
        surfaceId: releaseInitial.id,
        baseRevision: 1,
        revision: 2,
        upsert: [
          {
            type: "checklist",
            id: "release-followups",
            title: "Before the next decision",
            items: [
              {
                id: "masters",
                label: "Masters are present",
                detail: "All four example tracks include a master.",
                status: "ready",
                evidenceIds: ["delivery-sheet"],
              },
              {
                id: "artwork",
                label: "Add the After Hours artwork",
                detail: "Jules · follow up with the creative team.",
                status: "missing",
                evidenceIds: ["delivery-sheet"],
              },
              {
                id: "confirmation",
                label: "Check Daybreak documentation",
                detail:
                  "Jules · confirm contributors and check the unrecorded artwork before review.",
                status: "needs-review",
                evidenceIds: ["contributor-note"],
              },
            ],
          },
        ],
        remove: [],
      },
      { type: "surface.complete", surfaceId: releaseInitial.id, revision: 2 },
    ],
  },
  {
    id: "sourcing",
    label: "Supplier review",
    category: "Operations",
    prompt: "Help me compare these suppliers and find the gaps.",
    initial: sourcingInitial,
    events: [
      { type: "surface.snapshot", surface: sourcingInitial },
      {
        type: "surface.patch",
        surfaceId: sourcingInitial.id,
        baseRevision: 0,
        revision: 1,
        upsert: [
          sourcingCollection,
          {
            type: "metrics",
            id: "sourcing-metrics",
            title: "At a glance",
            items: [
              {
                id: "quotes",
                label: "Quotes compared",
                value: "3",
                detail: "All example quotes received",
                evidenceIds: ["quote-sheet"],
              },
              {
                id: "fastest",
                label: "Shortest lead time",
                value: "14 days",
                detail: "Common Ground · submitted quote",
                evidenceIds: ["quote-sheet"],
              },
              {
                id: "samples",
                label: "Samples reviewed",
                value: "2 / 3",
                detail: "Fieldwork review is missing",
                evidenceIds: ["sample-log"],
              },
            ],
          },
        ],
        remove: [],
        fallbackText:
          "Synthetic supplier comparison for 500 studio bags. Northline: $2,400, 21 days, sample reviewed. Common Ground: $2,650, 14 days, sample reviewed. Fieldwork: $2,250, 28 days, sample pending. No supplier has a material certification in this fixture. Sources: fictional October quotes, sample log, and review recommendation. No purchase has been approved or placed.",
      },
      {
        type: "surface.patch",
        surfaceId: sourcingInitial.id,
        baseRevision: 1,
        revision: 2,
        upsert: [
          {
            type: "checklist",
            id: "sourcing-followups",
            title: "Before the next decision",
            items: [
              {
                id: "compare",
                label: "Compare all three quotes",
                detail: "All suppliers quote the same example quantity.",
                status: "ready",
                evidenceIds: ["quote-sheet"],
              },
              {
                id: "sample",
                label: "Request the Fieldwork sample review",
                detail: "A missing review is still an open question.",
                status: "missing",
                evidenceIds: ["sample-log"],
              },
              {
                id: "certificate",
                label: "Review material certification",
                detail: "No certification is included for any supplier.",
                status: "needs-review",
                evidenceIds: ["sample-log"],
              },
            ],
          },
        ],
        remove: [],
      },
      { type: "surface.complete", surfaceId: sourcingInitial.id, revision: 2 },
    ],
  },
];

export const playgroundScenarios: PlaygroundScenario[] = [
  ...protocolScenarios,
  createSupplierScenario(
    getCompletedExample(
      protocolScenarios.find((item) => item.id === "sourcing")!,
    ),
  ),
  listeningScenario,
  songScenario,
];
