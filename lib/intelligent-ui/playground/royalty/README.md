# Synthetic royalty reconciliation review

The Intelligent UI playground's **Royalty reconciliation** example consumes
the pinned `result.json` through `createRoyaltySurface.ts`. It uses the existing
answer renderer, evidence dialog and synthetic replay route. No collection,
payment, account connection, storage write or backend tool is added.

`input.json` and `result.json` are unchanged supplied synthetic evidence.
`source-pin.json` identifies the Skills producer revision and input/script hashes.
This is a deliberately narrow static fixture adapter, not a parser for arbitrary
producer output. The independent Catalog work owns producer qualification.
The fixed result passes the pinned v1 consumer acceptance schema. Hash tests
lock the qualified input/result bytes; changing either requires explicit source
qualification and review. The adapter accepts no runtime output or user input.
Malformed, partial, other-version or newly repinned producer output is outside
this example's acceptance scope. It must not be fed into this adapter.
The evidence inspector's observation timestamps record this UI fixture capture,
not the dates of the historical transactions or a live bank observation.

Review the statement USD 100, remittance USD 100, fee USD -3 and verified
receipt USD 97 separately. “Verified” describes the producer's synthetic
allocation result. `current_payable: null` remains **Unknown**, and
`supplied_statement_only` remains visible. Neither “Paid” nor zero unmatched
records establishes a current balance, debt or authorization to pay.

Every allocation evidence reference opens its matching supplied records; the
method citation exposes the complete result and source pin. Synthetic references
are identifiers, not external bank/document URLs.
Allocations and records are joined by stable IDs. Fee kind and amount come from
the original input allocation's adjustment record, not from a sign-based guess.
Dates come from the original statement/receipt records. Exact decimal strings
remain strings; no floating-point arithmetic or repeat fee deduction occurs.

Validation: `RoyaltyReview.test.tsx` checks the monetary values, unknown payable,
citation preservation, source dialog and Escape focus return. The shared example
stream tests validate every revision against existing surface contracts.
Native speech and physical-device acceptance are not covered by DOM tests.
