# Saved per-track play counts (#1801)

The report already fetched a bounded page of latest-per-ISRC measurements but only rendered release aggregates. Manage songs (#2347) renders metadata, not observations. The report now renders that existing measurement page without any new request.

Rows retain response order and every returned observation. Metadata joins require a unique exact ISRC; title, position, case normalization and selected artist are not identity substitutes. Missing metadata falls back to the capture title. Missing/invalid counts stay Unknown; a nonnegative safe integer zero is displayed as 0. Capture timestamps are shown as supplied or Unknown, not replaced with current time. No valuation arithmetic changes.

The table reuses #2347's 50-row local pagination controls. Appends retain the page; shrinking responses clamp it. Catalog changes remount the table; pending/error/unauthorized report states remove it through existing report authority. The existing 100-measurement read cap remains explicit in the copy. Loaded measurement rows do not claim whole-catalog coverage. Metadata-only songs are not invented as measured rows.

Retained daily-stream helpers use a different provider/period contract and some traverse pages automatically; they are not appropriate for these saved play-count observations. No such API/provider operations are added. Catalog-specific inquiry/executor contracts remain outside this display follow-up.

Validation: table tests cover exact joins, metadata ambiguity, zero versus invalid/missing counts, row bounds, final-page reachability, append/shrink, and empty response. Actual report integration covers zero-stream rendering and immediate actor transition clearing; existing authority tests cover account, organization, actor and catalog transitions. Synthetic native acceptance is recorded separately; this document makes no authenticated production claim.
