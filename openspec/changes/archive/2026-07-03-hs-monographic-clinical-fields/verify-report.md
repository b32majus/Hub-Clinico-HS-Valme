# Verification Report: hs-monographic-clinical-fields

**Change**: `hs-monographic-clinical-fields`  
**Mode**: Standard SDD verify  
**Persistence**: Hybrid (`openspec` file + Engram topic `sdd/hs-monographic-clinical-fields/verify-report`)  
**Branch**: `main`  
**Verifier**: final archived-pass verification after stale CRITICAL fix  
**Verdict**: **PASS**

## Completeness

| Metric | Value |
|---|---:|
| Tasks total | 13 |
| Tasks complete | 13 |
| Tasks incomplete | 0 |

## Build & Test Evidence

| Command | Result | Evidence |
|---|---|---|
| `npm run build` | PASS | Vite built `dist/` successfully. Non-blocking Vite warnings for non-module vendor scripts were reported for vendored `xlsx` and `chart` scripts, matching the static-app setup. |
| `node tests/tsv-export-check-node.mjs` | PASS | `Monografica export: 236 cells OK`; `Multidisciplinar export: 236 cells OK`; v2 TSV export and validation checks passed. |
| `node tests/dashboard-check-node.mjs` | PASS | Dashboard derivation logic passed on synthetic in-memory rows, including corrected IHS4 derivation and v2 clinical fields. |
| `node tests/parity-check-node.mjs` | PASS | Three scenarios passed: 214 v1-prefix cells matched byte-for-byte; 22 v2 columns documented as expected hub-only divergence per scenario. |
| `node tests/scope-guard-check-node.mjs` | PASS | No nursing/PsO route references and no browser persistence APIs in 29 source files. |
| `node tests/stale-base-check-node.mjs` | PASS | Valid workbook load worked; invalid workbook cleared stale base; v1 schema warning emitted and v2 cells are backfilled empty. |
| Direct schema/task check | PASS | `HEADERS_HS_VERSION === 'v2'`; `eco_doppler` absent from both canonical column sets; `DERIVED.ihs4Score({n:1,a:1,f:1,fd:1}) === 11`; tasks are `13/13`. |
| Direct flare-render check | PASS | `renderFlaresSection('primera')` renders `flares_total_ultimo_anio` and not `flares_desde_ultima_visita`; `renderFlaresSection('seguimiento')` renders `flares_desde_ultima_visita` and not `flares_total_ultimo_anio`. |

## Spec Compliance Matrix

| Spec area | Scenario / requirement | Evidence | Result |
|---|---|---|---|
| `schema-v2` | Version constant is v2 | Direct schema check | COMPLIANT |
| `schema-v2` | v1 prefix preserved and v2 columns appended/documented | `parity-check-node.mjs` passed | COMPLIANT |
| `schema-v2` | Acne conglobata column exists | TSV/dashboard checks + schema inspection | COMPLIANT |
| `schema-v2` | Scalp counters exist and are counted | Dashboard check + schema inspection | COMPLIANT |
| `schema-v2` | `eco_doppler` removed; `eco_hallazgos` added | Direct schema check + docs inspection | COMPLIANT |
| `severity-proms` | PROM scales export and range validation blocks out-of-range values | `tsv-export-check-node.mjs` passed | COMPLIANT |
| `severity-proms` | IHS4 includes draining fistulas with score 11 for `{n:1,a:1,f:1,fd:1}` | Direct check + dashboard check | COMPLIANT |
| `severity-proms` | Same-region fistula warning is non-blocking | Source inspection: `updateIhs()` appends/removes `.ihs-warning`; export path remains unblocked | COMPLIANT |
| `toxic-habits` | Tobacco state, legacy `fumador`, alcohol state, conditional quantities, UBE derivation | Source inspection + TSV validation passed | COMPLIANT |
| `flares-demographics-ultrasound` | First visit asks `flares_total_ultimo_anio` | Direct runtime render check with production mode `primera` | COMPLIANT |
| `flares-demographics-ultrasound` | Follow-up asks `flares_desde_ultima_visita` | Direct runtime render check with production mode `seguimiento` | COMPLIANT |
| `flares-demographics-ultrasound` | Flare flags, education level, age of onset, ultrasound findings, and no Doppler input | Source/schema inspection + TSV validation | COMPLIANT |
| `dashboard-and-parity-impact` | Dashboards, parity tests, scope guard, and docs reflect v2 | Node checks passed; `docs/CONTRATO_DATOS_HS.md` and `docs/ESTADO_IMPLEMENTACION_HS.md` reviewed | COMPLIANT |
| Scope exclusions | No Slice B/C, nursing/PsO, backend/database/storage, or browser persistence changes | Scope guard passed; app source inspection | COMPLIANT |

**Compliance summary**: 14/14 checked requirement groups compliant.

## Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Append-only v2 schema | Implemented | `HEADERS_HS_VERSION` is `v2`; v2 fields append after `hallazgos_interes`; parity check confirms v1-prefix compatibility. |
| Removed Doppler / added findings | Implemented | Canonical `COLUMNS` omit `eco_doppler` and include `eco_hallazgos`; docs mark Doppler removed. |
| IHS4 fd correction | Implemented | Formula is `n + a*2 + (f + fd)*4`; direct score check returns 11. |
| Mode-specific flares | Implemented | Current `renderFlaresSection()` accepts both production Spanish modes (`primera`, `seguimiento`) and English aliases; direct checks pass. |
| Same-region fistula warning | Implemented | `bindFormInteractions()` appends `.ihs-warning` when both `f` and `fd` are non-zero in the same region and removes it when no longer applicable. |
| Docs | Implemented | Data contract documents v2, IHS4, validation, v2 fields, and removed Doppler; implementation status lists the current Node checks and v2 manual validation. |

## Coherence (Design)

| Design decision | Followed? | Notes |
|---|---|---|
| Single source of truth, append-only v2 columns | Yes | `hs_schema.js` remains the schema source of truth; tests consume it. |
| IHS4 formula includes `fd` | Yes | Direct and dashboard checks passed. |
| Soft per-region fistula warning | Yes | Warning is non-blocking and local to region blocks. |
| Backward-compatible tobacco column | Yes | Legacy `fumador` remains and is derived from `fumador_estado`. |
| Mode-specific flare input | Yes | The stale failure is fixed; first/follow-up render paths now match production modes. |
| v1 workbook warning | Yes | Stale-base check passed with v1 warning and no stale data retention after invalid load. |

## Issues Found

**CRITICAL**: None.  
**WARNING**: None.  
**SUGGESTION**: Add a dedicated automated regression assertion for `renderFlaresSection('primera')` / `renderFlaresSection('seguimiento')` to preserve the fixed behavior in future changes.

## Hard Exclusions

- Slice B/C: no implementation evidence found in the hub runtime scope for this change.
- Nursing/PsO: `scope-guard-check-node.mjs` passed.
- Backend/database/storage runtime changes: none found in the app implementation; the hub remains static and in-memory.
- Browser persistence APIs: scope guard passed.

## Final Verdict

**PASS** — all requested build/test commands passed, direct checks passed, tasks are 13/13 complete, and the archived stale CRITICAL finding for first-visit flare rendering is no longer valid against the current implementation.
