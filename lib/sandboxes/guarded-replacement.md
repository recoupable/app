# Opt-in guarded replacement in Files

Owning work: app #2116/#2140, Context checkpoint D. Depends on API #1044 merged as `1564985b55fb4606a6e4c38054b5b8cf401b4da5`. This extends the existing open-file/drop-replacement journey, not the separate Arweave knowledge editor or the sandbox filesystem tools.

## Serving prerequisite verified read-only

On October 19, 2026, Vercel inspection of `api.recoupable.dev` resolved production deployment `dpl_MJrdPPJzDCumWeSCyqCrcTrLnuNp`, READY, Git source `1564985b55fb4606a6e4c38054b5b8cf401b4da5`, immutable URL `https://api-qnxf41ygv-recoup.vercel.app`. The GitHub merge and deployment metadata match. No file save, staging upload, customer read, provider action or permission/configuration change was used to verify this prerequisite.

READY/source provenance is not an authenticated file-roundtrip receipt. Hosted writes remain separately approved work.

## Default-off gate and activation boundary

`NEXT_PUBLIC_GUARDED_GIT_API_ORIGIN` is empty by default. A maintainer may configure it only after verifying the exact immutable deployment contains #1044's guarded read/write behavior. The existing API selector must point to exactly that same origin. Only deployment-shaped `https://api-<9-character-id>-recoup.vercel.app` origins pass the syntax check; common production, branch and short test aliases fail it. Naming alone cannot establish immutability: never configure an alias even if it mimics this shape. The trusted configuration and deployment-provenance check carry that guarantee.

No managed environment variable or browser API override was activated by this implementation. Ordinary builds and unsupported API selections keep the existing Files journey. The optional feature appears only with the explicitly configured matching target. The configuration is a trusted release decision, not automatic online capability discovery. Its URL shape alone does not prove a build's Git revision; the maintainer must verify provenance before configuration.

This narrow immutable-target gate matters because predecessor APIs ignore unknown `expected_sha` fields, which can otherwise become unconditional writes. There is no fallback to legacy upload after a failed protected read/save. A wider rollout on mutable aliases requires a stronger guarded-only method/route or equivalent fail-closed protocol, rather than assuming an optional body field proves enforcement after a rollback.

## Existing user journey

1. Select an existing repository file. Opt into **Protect replacement of the opened file**. The versioned read obtains content and SHA together; it accepts valid empty text. Supported files follow API #1044's regular/inline content and encoding limits.
2. The opened revision is bound to the exact logical path, API origin and signed-in Privy identity. Query caching includes these values. Background focus/reconnection does not silently advance this revision; explicit re-selection/reopen performs a fresh read. Late authentication/results from another identity/target are withheld.
3. Drop exactly one replacement with the same filename. The original observed SHA is supplied unchanged as `expected_sha`. New-file/folder/batch uploads are outside this protected acceptance case. When protection is off and no replacement is pending, they retain the legacy upload journey.
4. The context is checked before staging and again before the commit request. An origin/account/path/revision change or unmounted view blocks continuation rather than selecting a newer SHA or switching APIs. Confirmed single-file success clears the retained replacement and explicitly reopens the saved file. Partial/uncertain success is not treated as confirmed.
5. A conflict keeps the actual local `File` object and original revision, with a clear error. **Keep a copy** downloads that exact file; **View latest file** reopens current content without retrying the replacement; **Discard replacement** explicitly clears it. Protection cannot be switched off while any replacement is pending, including after an account switch, and drops stay guarded until it is explicitly discarded. Recovery controls remain visible when the file list is loading, empty or unavailable. New protected drops are blocked while a replacement is retained, including in another account; keep/discard it in its original account before starting another. Reconciliation and choosing a replacement again are explicit actions.

Replacement retention is in memory for this mounted Files view; it is not a new persistent draft store. Keep a copy before navigating away/closing the tab. A prior account's retained replacement is withheld when the identity changes, and no operation is resumed automatically.

## Selected-account reads

The Files account-selection companion depends on [API #1131](https://github.com/recoupable/api/pull/1131), reviewed source `b6ee204c`. Deploy that API change before this App change. Explicit `account_id` reads of `/api/sandboxes` and `/api/sandboxes/file` require the response to confirm the same authorized `account_id`; an older or mismatched API origin fails closed instead of showing the signed-in account's files. Default self-account reads retain their existing response shape.

Listing, preview and mentioned-file reads follow the selected account and isolate their cache/results by authenticated identity, selection and API origin. Pending email resolution never falls back to self. Superseded lookups and responses cannot persist a different account's selection or content, including when switching away and back while a request is pending.

Every explicit account override is **read-only**, including an override naming the current account: the existing upload and deletion endpoints target the authenticated account, not an override. Upload, delete and protected replacement remain unavailable until returning to the default account. No writable opened revision is created for an override, and an account/authentication/origin change blocks a pending write before staging or commit. This does not enable cross-account writes or alter the default-off protected-replacement gate above. No hosted write or production permission/configuration change is established by these source and regression checks.

## Tests and remaining limits

Synthetic tests exercise the actual upload/read helpers, revision query, replacement controller and Files UI. They cover a disabled/mismatched gate with no guarded request or staged upload; predecessor read without a SHA; unchanged SHA forwarding; conflict without retry; success receipt; uncertain outcome; context change after staging; retained File/original revision after viewing newer data; duplicate-drop suppression; empty text; identity changes during authentication; explicit reopen; and the unchanged legacy upload branch. Provider/auth boundaries are fixtures, not hosted mutation evidence.

The existing blob-staging mechanism is reused. If context changes after a blob has been staged, the Git commit is blocked and the local file remains; that temporary blob may remain because existing server cleanup runs only after POST. No unreviewed cleanup endpoint or unsafe commit is used to remove it. The staged-upload lifecycle remains a platform cleanup limitation, as with other interrupted uploads.

This does not protect SDK/bash sandbox writes, synchronize an active sandbox, attach draft-origin path/version provenance to Context, accept company facts, or change rights/financial records. Those existing checkpoint D/#2140 requirements remain open. API #1044's canonical documentation publication and broader hosted acceptance remain their own release prerequisites. Do not infer hosted file persistence or authorization from synthetic tests or an automatic preview build.

Recovery follows the account-authorized pending File, independently of error text and file-list status. A confirmed commit clears retention even if the view changed during the response; automatic reopen runs only while the original context remains current. No retry is triggered.
