# Catalog report header

The canonical `/catalogs/[catalogId]` header displays the original catalog name from the current account's authorized catalog list, matched by stable ID and selected workspace owner. Until a fresh identity read succeeds, or after a failed read, it uses the generic heading. This does not infer a catalog from the first list entry or selected artist.

The header is outside the report's loading/measuring/error/ready branches. Its total comes only from the existing first-100-songs response's `pagination.total_count`. The report and header share that bounded query; no additional song pages are fetched. A successful zero remains zero; pending, failed, missing or invalid counts read “Total songs unknown.” Loaded rows and measured songs are never substitutes for the header total.

Header identity is freshly checked in a separate read-only catalog-list query. Song query keys include authenticated subject, account, selected organization and catalog ID so old in-flight responses cannot populate a new header scope. The same fresh catalog authority gates the report body. Measurement query keys also include authenticated subject, account and selected organization. Before authority resolves, after refusal, or after a scope change, body data is withheld; old in-flight responses stay in their own query scope. No schedules, report execution, credits, provider calls, API contracts or total-count database logic change.

Verification covers original-name/true-total rendering across report body states, zero/unknown counts, missing/foreign catalogs, account and organization transitions, late responses, and shared first-page fetching. Native acceptance uses the actual Next route with synthetic providers/read adapters; it is not live account or production authorization proof.

The report body preserves unknown membership totals in its measured-track statistic and skips coverage conclusions that require a known total. It never substitutes measured rows for total membership. Known zero is preserved, and the valuation formula is unchanged. The Manage songs tab retains its existing explicit pagination behavior.

The initial header-only candidate exposed cached-body and unknown-denominator failures in synthetic acceptance. The repair extends current authority to the report body and fixes its denominator; the original evidence remains an immutable baseline, with revised actual-Next acceptance recorded separately.
