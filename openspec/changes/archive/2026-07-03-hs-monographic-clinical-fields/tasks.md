# Tasks: HS Monographic Clinical Fields (Slice A)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~380 (schema ~30, form ~150, visit_form/loader/exporter ~25, longitudinal/list ~40, tests ~80, docs ~55) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR with 2 atomic commits |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Schema v2 + form renderers + loader/exporter behavior | PR 1 (commit 1) | Self-contained: app loads, renders, exports v2 correctly |
| 2 | Tests + dashboard/longitudinal + docs updates | PR 1 (commit 2) | Verifies and documents commit 1; no new runtime behavior |

## Phase 1: Schema & Form Core (Commit 1)

- [x] 1.1 `src/schema/hs_schema.js` — Set `HEADERS_HS_VERSION = 'v2'`. Append `cuero_cabelludo` to `IHS_REGIONS`. Append `comorb_acne_conglobata` to `COMORBIDITY_FIELDS`. In `buildHeadersHS()`, append v2 columns after the v1 tail: `comorb_acne_conglobata, ihs_cuero_cabelludo_{n,a,f,fd}, edad_inicio, nivel_educativo, fumador_estado, exfumador_anios, alcohol_consume, alcohol_cervezas_vino_semana, alcohol_copas_destilados_semana, alcohol_ube_semana, flares_total_ultimo_anio, flares_desde_ultima_visita, flares_requirio_urgencias, flares_requirio_cirugia, flares_requirio_antibioticos, eva_prurito, eva_olor, eva_supuracion, eco_hallazgos`. Remove `eco_doppler` from the header list. Update `DERIVED.ihs4Score` signature to `{n, a, f, fd}` and formula to `n + a*2 + (f+fd)*4`. Extend `DASHBOARD_MAP` with `proms` EVAs, `comorbidities` acne, and new `flares`/`ultrasound`/`toxicHabits` sections; remove `eco_doppler` references.
  - **Verify**: `node -e "import('./src/schema/hs_schema.js').then(m => { console.assert(m.HEADERS_HS_VERSION==='v2'); const h=m.buildHeadersHS(); console.assert(!h.includes('eco_doppler')); console.assert(h.includes('eva_prurito')); console.assert(h.includes('comorb_acne_conglobata')); console.assert(m.DERIVED.ihs4Score({n:1,a:1,f:1,fd:1})===11); console.log('OK') })"`

- [x] 1.2 `src/form/shared_fields.js` — Replace the `fumador` block in `renderAnamnesisSection()` with a `fumador_estado` select (Fumador/Exfumador/Nunca ha fumado) and a conditional `exfumador_anios` number input (visible only when Exfumador). Add `renderToxicHabitsSection()` with `alcohol_consume` select (si/no/nunca) and conditional `alcohol_cervezas_vino_semana` + `alcohol_copas_destilados_semana` number inputs (visible only when `si`). Add `renderDemographicsExtras()` with `edad_inicio` number and `nivel_educativo` select (Sin estudios/Primarios/Secundarios/Universitarios). Extend `renderPromsSection()` to add `eva_prurito`, `eva_olor`, `eva_supuracion` (0-10 integer inputs) alongside existing `eva_dolor`. Update `renderEcoSection()` to remove the `eco_doppler` input and add an `eco_hallazgos` textarea; keep `eco_ihs4` and `eco_gravedad`. Add `renderFlaresSection(mode)` — when mode is `first` render `flares_total_ultimo_anio`; when `followup` render `flares_desde_ultima_visita`; always render the three `flares_requirio_*` Si/No selects. In `bindFormInteractions()`, add UBE live calculation (`cervezas_vino + 2*copas_destilados`), f+fd same-region soft warning (`.ihs-warning` appended to region block when both non-zero), and conditional show/hide for `exfumador_anios` and alcohol weekly inputs. In `collectFormData()`, derive `fumador` as `Si` when `fumador_estado === 'Fumador'` else `No`; derive `alcohol_ube_semana`; compute IHS4 totals using `fd` from all regions including `cuero_cabelludo`. Update `prefillFromBase()` and `resetForm` for all new fields.
  - **Verify**: Manual — open form in browser, confirm all new sections render, UBE updates live, f+fd warning appears, conditional fields show/hide correctly.

- [x] 1.3 `src/form/visit_form.js` — Import `renderFlaresSection` from `shared_fields.js`. Insert `${renderFlaresSection(mode)}` after the anamnesis/demographics block in the form template, where `mode` is `'first'` or `'followup'` based on the visit type selector.
  - **Verify**: Open first-visit and follow-up forms; confirm correct flare label appears in each.

- [x] 1.4 `src/excel/loader.js` — After `normalizeRow` loads a workbook, check if the first data row lacks any v2-only column (`comorb_acne_conglobata` or `eva_prurito`). If so, log a single `console.warn` indicating the workbook is v1 and v2 cells will be empty. Do not block loading.
  - **Verify**: Load a v1 workbook; confirm warning appears in console and data loads without error.

- [x] 1.5 `src/tsv/exporter.js` — Add numeric range validators: `eva_prurito`, `eva_olor`, `eva_supuracion` must be 0-10 integers; `flares_total_ultimo_anio`, `flares_desde_ultima_visita` must be >= 0 integers; `alcohol_cervezas_vino_semana`, `alcohol_copas_destilados_semana`, `alcohol_ube_semana` must be >= 0 numbers. Block export with a clear message on range violation.
  - **Verify**: Attempt export with EVA value `11`; confirm blocked with validation message.

## Phase 2: Tests, Dashboard & Docs (Commit 2)

- [x] 2.1 `tests/parity-check-node.mjs` — Update `makeBasePayload()` to include all v2 columns with sensible defaults. Recompute expected IHS4 using `fd`. Document which v2 columns are expected to diverge from the legacy form mock (all new columns). Assert v1 columns still match byte-for-byte.
  - **Verify**: `node tests/parity-check-node.mjs` → PASS.

- [x] 2.2 `tests/tsv-export-check-node.mjs` — Add v2 fields to `makeValidPayload()`. Assert the v2 cell count per circuit matches `buildHeadersHS().length`. Add EVA range test (value `11` must fail). Add UBE derivation assertion.
  - **Verify**: `node tests/tsv-export-check-node.mjs` → PASS.

- [x] 2.3 `tests/dashboard-check-node.mjs` — Assert `DERIVED.ihs4Score({n:1,a:1,f:1,fd:1}) === 11`. Assert `topComorbidities` includes `comorb_acne_conglobata`. Assert the new `cuero_cabelludo` region is counted in IHS regional totals.
  - **Verify**: `node tests/dashboard-check-node.mjs` → PASS.

- [x] 2.4 `tests/scope-guard-check-node.mjs` — Run without changes. Must still pass (no nursing/PsO routes or browser persistence APIs introduced).
  - **Verify**: `node tests/scope-guard-check-node.mjs` → PASS.

- [x] 2.5 `src/patient/longitudinal.js` — Add `FLARES_COLUMNS` array and `ULTRASOUND_COLUMNS` array (including `eco_hallazgos`). Extend `PROMS_COLUMNS` with `eva_prurito`, `eva_olor`, `eva_supuracion`. Add `renderFlares(rows)` and `renderUltrasound(rows)` section functions. Remove any `eco_doppler` references.
  - **Verify**: Open patient detail view; confirm new PROMs, flares, and ultrasound sections render with v2 data.

- [x] 2.6 `src/service/list.js` — Add `flares_total_ultimo_anio`, `flares_desde_ultima_visita`, `eva_prurito`, `eva_olor`, `eva_supuracion` to `SUMMARY_COLUMNS` behind a new opt-in flag (default off to avoid widening the table).
  - **Verify**: Service list renders unchanged by default; flag-on shows new columns.

- [x] 2.7 `docs/CONTRATO_DATOS_HS.md` — Update §2.2 to `version=v2` with append rule. Update §7.1 IHS4 formula to `n + a*2 + (f+fd)*4`. Document all new v2 fields. Mark `eco_doppler` as removed.
  - **Verify**: Manual review — sections 2.2, 7.1, 9, 10 describe v2 schema.

- [x] 2.8 `docs/ESTADO_IMPLEMENTACION_HS.md` — Update manual validation step 4 to list new PROMs/flares/ultrasound/toxic-habits sections. Update parity notes to reference v2.
  - **Verify**: Manual review — steps reference v2 fields and checks.

## Commit Plan

| Commit | Scope | Files | Est. lines |
|--------|-------|-------|------------|
| `feat(schema): add v2 monographic columns, IHS4 fd correction, and form renderers` | Tasks 1.1–1.5 | `hs_schema.js`, `shared_fields.js`, `visit_form.js`, `loader.js`, `exporter.js` | ~235 |
| `test(docs): update Node checks, dashboards, and docs for v2 schema` | Tasks 2.1–2.8 | 3 test files, `longitudinal.js`, `list.js`, 2 docs | ~145 |
| **Total** | | | **~380** |
