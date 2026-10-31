# Browser scenario adapter

`scripts/scenario.mjs` is the canonical dependency-free ES module for
`public-estimate-spotify-rate/1`. It mirrors the unchanged Python reference and
accepts the same JSON request described by `references/scenario-request.schema.json`.
Scripts ship alongside this skill.

```javascript
import {runScenario} from './scenario.mjs';
const result = await runScenario(request);
```

The module snapshots inputs before its first await. Callers must discard superseded
async results when controls change quickly. Null `spotify_rate` restores the supplied
baseline. Outputs preserve observations, full assumptions, coverage, unknowns and
provenance. No network, storage, server Python, model or provider operation is used.
Web Crypto and TextEncoder must be available in a secure browser context or localhost.

## Consumption and provenance

Pin an exact Skills commit and the SHA-256 of `scripts/scenario.mjs` in the consuming
build or vendor manifest. Use a byte-identical copy, add a drift check, and update the
canonical module before changing consumer behavior. Do not duplicate formulas in App.
`execution_runtime` identifies this adapter version. `calculation_source_sha256` pins
Python's calculation reference; `calculation_source_role` explicitly says Python did
not execute in the browser. That hash does not authenticate JavaScript bytes: the
consumer's commit and module hash supply that binding. The module does not fetch its
own source or claim a self-verifying build hash.

## Conformance

From this skill directory, with Node 22+ and Python 3.12 available:

```bash
node --test tests/scenario-browser.test.mjs
```

Tests transport requests through JSON to compare actual cross-runtime semantics.
Python integer fields require decimal integer serialization: JavaScript values such
as 1e21 serialize in exponent form and are refused for `min_delta_days`. Counts and
their aggregate must be safe nonnegative integers. Calculations retain binary64
operation order with relative tolerance 1e-12 and absolute tolerance 1e-9; observation
hashes, text, assumptions and coverage must match exactly, including Unicode.
The suite covers baseline/rate/reset vectors, refusals, snapshot isolation and a
10,000-record cohort. Each Python subprocess has a 30-second timeout.

Only compatible exact 365-day measured Spotify observations or explicitly unknown
records are accepted. Daily, cumulative and run-rate explorer fixtures cannot be
relabeled as annual measurements. All cohort, currency, rights, period and coverage
refusals remain intact. Values are hypothetical, with no refreshed rate defaults.
Shared App/Context wiring, authenticated behavior and production activation are
separate work; this module does not establish those outcomes.
