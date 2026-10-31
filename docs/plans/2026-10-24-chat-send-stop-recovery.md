# Chat send recovery and confirmed Stop

> Execution: use the subagent-driven-development skill for one coupled implementation task, followed by independent specification and quality reviews. Parent owns native acceptance, push, PR, and exact-head CI. Coordinator owns merge and release.

**Goal:** Preserve unaccepted text and attachments for visible manual retry, and make Stop use the authenticated server outcome without corrupting another chat or a newer request.

**Architecture:** Keep the installed AI SDK and Workflow transport in charge of streaming and cursor-based GET reconnect. Observe initial POST admission at the transport boundary, bind operations to captured chat/session identity and a committed lifecycle, and project admission/Stop state through the existing provider/composer. Use bounded local recovery state, never a queue or automatic resubmission. Clear only the accepted submitted draft/attachment identities; never erase newer edits. Treat unpersisted optimistic messages locally, with no trailing-history DELETE.

**Tech stack:** Next.js 16.3, React 19.2, ai 6.0.241, @ai-sdk/react 3.0.243, @workflow/ai 4.2.0, TypeScript, Vitest/JSDOM, existing shadcn components. No dependency changes.

## Source and scope

- App base: ff455fd9bbcc2c7d2c58193ddb137f5cd70e7813, tree 74c5aa787a88934b6c20291864888b140df7ef69.
- API reference only: 3adef46dc7abc38253311867f4a83d4997333b4a. API implementation belongs to its owner.
- Worktree: `.worktrees/chat/chat-send-stop-recovery`, branch `codex/chat-send-stop-recovery`.
- Main files: `lib/chat/createWorkflowChatTransport.ts`, `hooks/useChatTransport.ts`, `hooks/useVercelChat.ts`, `providers/VercelChatProvider.tsx`, `components/VercelChat/ChatInput.tsx`, `components/VercelChat/message-editor.tsx`, narrowly named lifecycle helpers and tests as needed.
- Read App AGENTS, Mono DESIGN and the installed Next client-components guide before coding. Reuse App tokens; preserve development snapshot/query/intent behavior.
- No historical App1771 source/comments/history. No provider/customer writes, spending, feature activation, manual deployment, merge, API edits, or changes to shared dependency targets.

## Coupled implementation task

1. Run a focused current-source baseline and add RED regressions using the real provider, hook, transport and pinned SDK, mocking only external auth, network, history, model and attachment boundaries. Preserve the independent baseline packet under `.local/audits/chat-unaccepted-turn-repro-2026-10-24/baseline-r1`.
2. Add exact `streamLifecycle=explicit-stop-v1` to initial POST `/api/chat` and GET `/api/chat/{chatId}/stream`, in ordinary production-default and development snapshot modes. Preserve SDK cursor/tail/retry semantics. No automatic POST replay.
3. Observe POST admission independently from SDK promise completion. On 409/429/503, auth or network rejection retain the exact unaccepted draft, file parts and text attachments with a visible manual Retry. Prevent unaccepted optimistic entries from being silently included in a subsequent send or invoking history DELETE via retry/edit. Do not claim the old server's 200 old-run resume proves new-turn persistence.
4. Guard composer state across delayed admission, edits, removed/new attachments, session switches, unmount and suspended/abandoned renders. Acceptance clears only captured submitted content still belonging to that submission; rejection cannot overwrite newer content. Use a single recovery affordance, not a submission queue.
5. Implement authenticated `POST /api/chat/{capturedChatId}/stop`, independent of the stream abort signal. Wait for confirmed `{success:true,stopped:boolean}`; report 200 true/false honestly. Keep 502/504/auth/network/malformed-response errors retryable. Duplicate Stop must not duplicate requests. Pending preparation cancellation must prevent late POST. Coordinate in-flight POST/Stop so a late admitted run cannot survive a false stopped claim. Do not let stale completion stop/clear/update the new session or request.
6. Keep UI minimal: existing composer action, accessible pending/error status and explicit recovery. No unrelated design expansion. Keep accepted-stream errors distinct from rejected sends.
7. GREEN focused cases: all denial statuses; real SDK swallowed rejection; new draft/attachment during admission; manual retry without extra POST/DELETE; unpersisted edit; two-tab active-run disagreement; authenticated GET cursor reconnect without POST; production-default resumed Stop; dev mode; Stop true/false/502/504/auth; pending-start and in-flight POST Stop; switches/unmount/reconnect; existing Q1 preparation and catalog tests.
8. Self-review, static checks and a descriptive unsigned commit with `git -c commit.gpgsign=false commit`. Do not push from implementer. Store exact source hashes, commands and results in the unsealed lifecycle audit directory.

## Review and completion gates

1. Fresh independent SPEC review of exact candidate; fix and repeat until approved.
2. Fresh independent quality review after SPEC approval; fix and repeat both affected reviews.
3. After final executable source, one final full Vitest run, TypeScript/typegen, scoped lint, Prettier and diff checks. Do not broaden/repeat without a new failure/change.
4. Parent performs source-bound native acceptance through supported CUA only. Honor fresh policy denial; no CLI browser/raw CDP/alternate surface workaround. Separate blocked native coverage from actual product failures.
5. Parent pushes feature branch and creates/attaches a PR against main. Read CI only using `mcp__code_review__pull_requests_checks` with exact head. Preserve review warnings and unproven live boundaries.
6. Coordinator handoff names exact App head/tree, review/test evidence and any remaining native/CI limits. Release order: API pending-Stop prerequisite (pending-* => retryable503, slot retained, watcher unchanged), then App, then full API1070/opt-in repair. Captured admission alone cannot safely bridge oldAPI across another tab claiming pending. Keep competing sends held while Stop is unconfirmed; bounded Stop retries only, never automatic chat resend. Existing old tabs stay on legacy absent/unknown-query semantics. No root merge/deploy/activation.
