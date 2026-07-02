# Verification Report: hs-monographic-clinical-fields

**Change**: `hs-monographic-clinical-fields`  
**Mode**: Standard SDD verify  
**Persistence**: Hybrid (`openspec` file + Engram topic `sdd/hs-monographic-clinical-fields/verify-report`)  
**Branch**: `main`  
**Verdict**: **FAIL**

## Completeness

| Metric | Value |
|---|---:|
| Tasks total | 13 |
| Tasks complete | 13 |
| Tasks incomplete | 0 |

## Build & Test Evidence

| Command | Result | Evidence |
|---|---|---|
| `npm run build` | PASS | Vite built `dist/` successfully. Non-blocking Vite warnings for non-module vendor scripts were reported. |
| `node tests/tsv-export-check-node.mjs` | PASS | `Monografica export: 236 cells OK`; `Multidisciplinar export: 236 cells OK`; v2 TSV and validation checks passed. |
| `node tests/dashboard-check-node.mjs` | PASS | Dashboard derivation, IHS4 `fd`, acne conglobata, scalp region, summaries, and privacy runtime checks passed. |
| `node tests/parity-check-node.mjs` | PASS | 214 unchanged v1-prefix cells matched for each checked scenario; 22 v2 columns documented as hub-only. |
| `node tests/scope-guard-check-node.mjs` | PASS | No nursing/PsO route references and no browser persistence APIs in 29 source files. |
| `node tests/stale-base-check-node.mjs` | PASS | Valid load worked; invalid workbook cleared stale base; v1 warning emitted. |
| Direct schema/task check | PASS | `HEADERS_HS_VERSION='v2'`; `eco_doppler` absent from both `COLUMNS`; `DERIVED.ihs4Score({n:1,a:1,f:1,fd:1}) === 11`; tasks `13/13`. |
| Direct flare-render check | FAIL | `renderFlaresSection('primera')` rendered `flares_desde_ultima_visita` instead of `flares_total_ultimo_anio`. |

## Spec Compliance Matrix

| Spec area | Scenario / requirement | Evidence | Result |
|---|---|---|---|
| `schema-v2` | Version constant is v2 | Direct schema check | COMPLIANT |
| `schema-v2` | `eco_doppler` absent; `eco_hallazgos` present | Direct schema check + TSV test | COMPLIANT |
| `schema-v2` | v1 prefix preserved and v2 columns documented | `parity-check-node.mjs` passed | COMPLIANT |
| `schema-v2` | Acne conglobata and scalp counters exist | Dashboard and TSV checks passed | COMPLIANT |
| `severity-proms` | IHS4 includes `fd` | Dashboard and direct schema checks passed with score 11 | COMPLIANT |
| `severity-proms` | EVA range validation blocks out-of-range value | `tsv-export-check-node.mjs` passed | COMPLIANT |
| `severity-proms` | Same-region fistula warning | Source inspection: `updateIhs()` appends `.ihs-warning`; no browser runtime test executed | PARTIAL |
| `toxic-habits` | Tobacco state, legacy `fumador`, alcohol UBE | Source inspection + TSV UBE validation passed | COMPLIANT |
| `flares-demographics-ultrasound` | First visit asks `flares_total_ultimo_anio` | Direct runtime render check failed for production mode value `primera` | FAILING |
| `flares-demographics-ultrasound` | Follow-up asks `flares_desde_ultima_visita` | Direct runtime render check passed for `seguimiento` | COMPLIANT |
| `dashboard-and-parity-impact` | Dashboards and docs reflect v2 | Dashboard test passed; docs reviewed | COMPLIANT |
| Scope exclusions | No Slice B/C, nursing/PsO, backend/storage runtime changes | Scope guard passed; source grep found only existing load-base `database` icon text, not backend/storage logic | COMPLIANT |

## Correctness Findings

### CRITICAL

1. **First-visit flare question is wrong at runtime.**  
   `createVisitForm()` passes Spanish mode values (`primera`, `seguimiento`) into `renderFlaresSection(mode)`, but `renderFlaresSection()` checks `mode === 'first'`. Therefore a first visit renders `flares_desde_ultima_visita` instead of `flares_total_ultimo_anio`, violating `flares-demographics-ultrasound` and task 1.3 despite the task being marked complete.

### WARNING

1. Same-region fistula warning was verified by source inspection only, not a browser/DOM runtime test.
2. Manual browser validation for conditional tobacco/alcohol visibility, patient detail rendering, and service list flag-on display was not executed in this verify pass.

### SUGGESTION

1. Add a Node/browser-adjacent test that imports `renderFlaresSection()` or renders both visit forms and asserts the first/follow-up flare field split, so this regression is caught by the automated suite.

## Design Coherence

| Design decision | Status | Notes |
|---|---|---|
| Single source of truth, append-only v2 columns | FOLLOWED | `hs_schema.js` remains the source of truth; parity check passes. |
| IHS4 formula includes `fd` | FOLLOWED | Runtime and direct checks pass. |
| Soft per-region fistula warning | PARTIAL | Implemented in source; not runtime-tested in browser. |
| Backward-compatible tobacco column | FOLLOWED | `fumador` is derived from `fumador_estado`. |
| Mode-specific flare input | NOT FOLLOWED | First-visit mode mismatch causes the follow-up flare field to render. |
| v1 workbook warning | FOLLOWED | Stale-base test emitted the v1 schema warning without blocking load. |

## Hard Exclusions

- Slice B/C: no implementation evidence found in hub runtime source.
- Nursing/PsO: `scope-guard-check-node.mjs` passed.
- Backend/database/storage runtime changes: no backend/storage implementation found; grep hit only an existing `database` icon label in `src/main.js` for the base-load UI.
- Browser persistence APIs: scope guard passed.

## Final Verdict

**FAIL** — the automated build and core Node checks pass, but a required runtime behavior fails: first visits render the wrong flare-count field. The change is not archive-ready until this blocker is fixed and re-verified.
