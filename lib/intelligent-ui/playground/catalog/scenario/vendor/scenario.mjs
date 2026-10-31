/** Catalog-owned browser adapter. No imports, network, storage or model calls. */
export const METHOD_VERSION = 'public-estimate-spotify-rate/1';
export const ADAPTER_VERSION = 'catalog-browser-scenario/1';
export const REFERENCE_SOURCE_SHA256 = '4f16497387a73eaca0f900a9a4136443ef84ef174894772655b51c6a8ebda055';
const bands = ['low', 'central', 'high'];
const basisKeys = ['cohort_id', 'period_start', 'period_end', 'currency', 'right_kind', 'unit'];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const exact = (v, keys) => object(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
// Python str.strip whitespace semantics, including C0 separators and NEL.
const nonblank = v => typeof v === 'string' && !/^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*$/u.test(v);
const number = (v, name) => assert(typeof v === 'number' && Number.isFinite(v) && v >= 0, `${name} must be finite and nonnegative`);

function canonical(value, ancestors = new Set(), depth = 0) {
  assert(depth <= 16, 'Input nesting exceeds JSON contract');
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    assert(Number.isFinite(value), 'Nonfinite JSON number');
    return JSON.stringify(value);
  }
  assert(value && typeof value === 'object' && !ancestors.has(value), 'Expected acyclic JSON data');
  assert(Array.isArray(value) || [Object.prototype, null].includes(Object.getPrototypeOf(value)), 'Expected plain JSON data');
  ancestors.add(value);
  let result;
  if (Array.isArray(value)) {
    assert(Object.keys(value).length === value.length, 'Sparse or extended arrays are unsupported');
    result = '[' + Array.from(value, v => canonical(v, ancestors, depth + 1)).join(',') + ']';
  } else {
    result = '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k], ancestors, depth + 1)).join(',') + '}';
  }
  ancestors.delete(value);
  return result;
}

function date(value) {
  assert(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && value.slice(0, 4) !== '0000', 'Explicit ISO dates required');
  const parsed = new Date(value + 'T00:00:00.000Z');
  assert(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, 'Invalid measurement date');
  return parsed.getTime();
}

function model(tracks, cfg, complete) {
  const covered = tracks.filter(t => t.ttm_source === 'measured_365d');
  const supported = covered.length > 0;
  const status = !supported ? 'insufficient_measurement' : covered.length === tracks.length && complete ? 'complete_input_subset' : 'partial_subset';
  const spotifyGross = covered.reduce((sum, t) => sum + t.sp_ttm, 0) * cfg.rates.spotify;
  const annualGross = {}, annualNls = {}, value = {};
  for (const band of bands) {
    // Preserve Python model_tracks operation order; no extra fee or rounding.
    const gross = spotifyGross * (1 + cfg.other_dsp_grossup[band]);
    const net = gross * cfg.nls_band[band] * cfg.controlled_share;
    annualGross[band] = supported ? gross : null;
    annualNls[band] = supported ? net : null;
    value[band] = supported ? net * cfg.multiple[band] : null;
    assert(!supported || [gross, net, value[band]].every(Number.isFinite), 'Scenario arithmetic overflow');
  }
  return {status, scope: 'covered recording subset only', currency: cfg.currency,
    covered_tracks: covered.length, input_tracks: tracks.length, coverage_share: covered.length / tracks.length,
    population_complete: complete, uncaptured_albums: [], annual_gross: annualGross, annual_nls: annualNls, value,
    unknown_track_ids: tracks.filter(t => t.ttm_source === 'none').map(t => t.id),
    limitations: ['Money is modeled, not reported or collected royalties.',
      'Missing tracks/platforms are unknown, not zero; no catalog-wide extrapolation.',
      'Rights and controlled share are assumptions, not ownership findings.',
      'Net factors already include modeled deductions; do not deduct fees again.',
      'A single comparable statement can calibrate one slice; residual uncertainty remains.']};
}

/** Async only for local Web Crypto SHA256. Caller owns rendering/persistence. */
export async function runScenario(input) {
  // Snapshot before the async hash so later caller edits cannot alter this result.
  const request = JSON.parse(canonical(input));
  assert(exact(request, ['method_version', 'observations', 'assumptions', 'spotify_rate']), 'Request fields mismatch');
  assert(request.method_version === METHOD_VERSION, 'Unsupported method version');
  const {observations: obs, assumptions: cfg, spotify_rate: override} = request;
  assert(exact(obs, ['basis', 'population_complete', 'coverage_notes', 'tracks']), 'Observation envelope mismatch');
  const basis = obs.basis;
  assert(exact(basis, basisKeys) && nonblank(basis.cohort_id), 'Explicit compatible basis required');
  assert(basis.right_kind === 'master' && basis.unit === 'spotify_streams', 'Unsupported rights or unit');
  assert(typeof basis.currency === 'string' && /^[A-Z]{3}$/.test(basis.currency), 'Explicit currency required');
  assert(date(basis.period_end) - date(basis.period_start) === 365 * 86400000, 'Only measured365-day windows supported');
  assert(typeof obs.population_complete === 'boolean', 'Explicit population coverage required');
  assert(Array.isArray(obs.coverage_notes) && obs.coverage_notes.length > 0 && obs.coverage_notes.every(nonblank), 'Coverage limitations required');
  assert(Array.isArray(obs.tracks) && obs.tracks.length > 0 && obs.tracks.length <= 10000, 'Provide1to10000recordings');
  const ids = new Set(); let total = 0;
  for (const track of obs.tracks) {
    assert(exact(track, ['id', 'title', 'sp_ttm', 'ttm_source', 'basis', 'source_ref', 'captured_at']), 'Track fields mismatch');
    assert(typeof track.id === 'string' && track.id.length > 0 && !ids.has(track.id), 'Unique nonempty recording IDs required');
    ids.add(track.id);
    assert(typeof track.title === 'string', 'Track title must remain text');
    assert(canonical(track.basis) === canonical(basis), 'Incompatible currency, period, cohort, rights or unit');
    assert(nonblank(track.source_ref) && nonblank(track.captured_at), 'Source reference and capture timestamp required');
    assert(['measured_365d', 'none'].includes(track.ttm_source), 'Cumulative/run-rate observations unsupported');
    if (track.ttm_source === 'none') assert(track.sp_ttm === null, 'Unknown measurement must remain null');
    else {
      assert(Number.isSafeInteger(track.sp_ttm) && track.sp_ttm >= 0, 'Measured streams must be safe nonnegative integers');
      total += track.sp_ttm;
    }
  }
  assert(Number.isSafeInteger(total), 'Combined count exceeds interoperable integer precision');
  assert(exact(cfg, ['currency', 'right_kind', 'controlled_share', 'assumption_status', 'assumption_sources', 'rates', 'other_dsp_grossup', 'nls_band', 'multiple', 'window_days', 'min_delta_days']), 'Complete explicit assumptions required');
  assert(cfg.currency === basis.currency && cfg.right_kind === basis.right_kind, 'Assumption basis mismatch');
  assert(cfg.assumption_status === 'illustrative_unverified', 'Dev assumptions remain illustrative_unverified');
  assert(Array.isArray(cfg.assumption_sources) && cfg.assumption_sources.length > 0 && cfg.assumption_sources.every(nonblank), 'Assumption provenance required');
  assert(cfg.window_days === 365 && Number.isInteger(cfg.min_delta_days) && cfg.min_delta_days > 0 && /^[0-9]+$/.test(JSON.stringify(cfg.min_delta_days)), 'Invalid measurement configuration');
  number(cfg.controlled_share, 'controlled_share'); assert(cfg.controlled_share <= 1, 'Controlled share exceeds1');
  assert(exact(cfg.rates, ['spotify']), 'Only explicit Spotify rate supported');
  number(cfg.rates.spotify, 'rates.spotify');
  for (const group of ['other_dsp_grossup', 'nls_band', 'multiple']) {
    assert(exact(cfg[group], bands), 'Exact scenario bands required');
    for (const band of bands) number(cfg[group][band], group + '.' + band);
    assert(cfg[group].low <= cfg[group].central && cfg[group].central <= cfg[group].high, 'Unordered scenario bands');
    if (group === 'nls_band') assert(cfg[group].high <= 1, 'Net factor exceeds1');
  }
  if (override !== null) number(override, 'spotify_rate');
  const scenarioCfg = JSON.parse(canonical(cfg));
  if (override !== null) scenarioCfg.rates.spotify = override;
  const baseline = model(obs.tracks, cfg, obs.population_complete);
  const scenario = model(obs.tracks, scenarioCfg, obs.population_complete);
  const observationJson = canonical(obs);
  // Python ensure_ascii=False encodes Unicode scalars; refuse lone UTF16 surrogates.
  const scalars = value => typeof value === 'string' ? !/[\uD800-\uDFFF]/u.test(value)
    : value && typeof value === 'object' ? Object.values(value).every(scalars) : true;
  assert(scalars(obs), 'Observation contains unpaired Unicode surrogate');
  assert(globalThis.crypto?.subtle, 'Local Web Crypto SHA256 unavailable');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(observationJson));
  const observationsHash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  return {method_version: METHOD_VERSION, calculation_schema: 'public-estimate/2', calculation_source_sha256: REFERENCE_SOURCE_SHA256,
    execution_runtime: ADAPTER_VERSION, calculation_source_role: 'Python conformance reference; not executed in browser',
    observations: obs, observations_sha256: observationsHash, baseline_assumptions: cfg, scenario_assumptions: scenarioCfg,
    baseline, scenario, reset_to_baseline: override === null,
    output_basis: 'hypothetical only; not measured royalties, ownership, receivables or cash',
    units: {spotify_rate: basis.currency + '/Spotify stream', annual_gross: basis.currency + '/365 days', annual_nls: basis.currency + '/365 days', value: basis.currency},
    numeric_policy: 'Existing binary64 estimate arithmetic; no row rounding; compare finite outputs at relative tolerance 1e-12 and absolute tolerance 1e-9'};
}
