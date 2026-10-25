# Empty catalog guidance

Historical #1803 proposed an empty-state agent action through `/?q=...`. Current `useInitialMessageAutoSend` sends that prompt automatically after session provisioning, and both `/` and `/chat` mount the selected-artist bootstrap. Those destinations are unsuitable for a navigation-only guidance action.

#1973 preserves the existing one-click valuation control on personal and organization empty states. Its closure records valuation/status delivery; it does not explicitly retire agent guidance. The valuation button and its execution contract remain unchanged.

The supported `/agents` route lists actor-authorized templates using the shared AgentTemplateProvider introduced by #2358. The new “Browse agents” link has no prompt, catalog, artist, organization or account query parameters and disables prefetch. Opening that chooser does not provision a chat or submit a prompt. Previewing a template is read-only; selecting a card is a separate existing action which starts its prompt. This change does not claim that an agent has run or a catalog has been created.

Catalog filtering, account-wide personal-list behavior, organization names, loading/error states and #1973 valuation actions remain unchanged. The new guidance appears only in the existing empty branch. Tests cover both scopes and suppress guidance for loading, error and nonempty lists; destination scope/cache tests are retained. Native acceptance uses actual Next `/catalogs` → `/agents` routes, synthetic data, and effect counters, not live account/provider calls.
