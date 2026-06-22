# Chat Tool-Response UI Audit

A living audit of every **chat tool-response** component — their user journeys,
states, gaps, and the improvements made to bring them to an "award-winning" bar.

## Contents

- **[`user-journeys.md`](./user-journeys.md)** — user journeys & customer
  expectations vs. the app's reality, the shared design system, cross-cutting
  findings, and the per-domain narrative.
- **[`tool-ui-audit.csv`](./tool-ui-audit.csv)** — the running spreadsheet: one
  row per `tool × component × state`, tracking expectation, prior reality, the
  improvement made, and the severity of the gap fixed.

## The design system

All tool cards build on shared primitives in
`components/VercelChat/tools/shared/`:
`ToolCard`, `ToolCardBody`, `ToolCardRow`, `ToolCardSkeleton`, `ToolEmpty`,
`ToolError`, `ToolStatusPill`, and `toolCardTokens`.

New tools should compose these rather than hand-rolling cards, and must design
all four states: **loading, success, empty, error**.
