# Saved chat history

As of 2026-10-25, the App1771 reconciliation uses the current Workflow transport
rather than restoring its historical implementation. `getChatMessages` requires
an HTTP success and an explicit messages array. HTTP, network, parse and missing
credential failures are not empty conversations. An explicit empty array is a
successful read.

`useMessageLoader` reports failures and offers a manual retry; inactive requests
cannot publish messages, errors or readiness. `useVercelChat` coordinates history
before mount-time resume for every existing canonical chat, independent of the
Intelligent UI flag. The existing committed account/workspace/session/chat guards
and deliberate-send/Stop cancellation remain authoritative. New-chat bootstrap
still skips history. The existing Workflow transport continues to own live IDs,
authentication, reconnects, and terminal 204 handling.

The error view offers **Retry loading messages**, which repeats the history read.
It does not regenerate, submit, delete messages, or execute a provider. Successful
retry installs saved history before one mount resume. Actual production access
and provider activity are separate from synthetic local acceptance.

Validation: loader contract tests, actual SDK/hook readiness and scope-switch
regressions, send/Stop recovery regressions, and local full-Next reload/retry
acceptance. Historical App1771 preview evidence is not transferred to this code.
