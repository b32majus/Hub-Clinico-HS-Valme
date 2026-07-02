# Design: HS Monographic Clinical Fields (Slice A)

## Technical Approach

Append-only v2 column schema (`HEADERS_HS_VERSION = 'v2'`) over the existing single
source of truth (`hs_schema.js`). Update `DERIVED.ihs4Score` to include `fd`. Extend
the shared form to render toxic-habits/PROMs/flares/demographics/ultrasound inputs
with conditional visibility, then propagate the new fields into the longitudinal
view, dashboard map, TSV export, and the four Node checks. No new file is created
in `src/`; the change is bounded to Slice A files plus docs.

## Architecture Decisions

### Decision: Single source of truth, append-only v2 columns

**Choice**: All v2 column names live in `buildHeadersHS()`. New v2 columns append
after the last v1 column (`hallazgos_interes`) and before any future
`seguimiento_*` tail, keeping the v1 prefix byte-identical.
**Alternatives**: Reordering columns (rejected — breaks v1 workbooks and parity
test); per-circuit columns (rejected — both circuits share `buildHeadersHS()`).
**Rationale**: Append-only is the spec contract; byte-identical v1 prefix keeps
existing loaded workbooks readable.

### Decision: IHS4 formula includes `fd`

**Choice**: `DERIVED.ihs4Score({n, a, f, fd}) => n + a*2 + (f + fd)*4`. Regional
totals already include `fd`; only the formula change is needed.
**Alternatives**: Weight `fd` lower than `f` (rejected — clinical intent is equal
weight per `severity-proms` spec).
**Rationale**: Matches the corrected clinical contract; historical totals rise
only when `fd > 0` was previously recorded, which is the documented data-integrity
correction.

### Decision: Soft per-region fistula warning

**Choice**: In `updateIhs()`, when both `ihs_<region>_f` and `ihs_<region>_fd` are
non-zero, append a `.ihs-warning` element to the region block with copy "Confirma
si fistulas y fistulas drenantes son lesiones distintas." No export block.
**Alternatives**: Modal/blocking dialog (rejected — spec requires non-blocking).
**Rationale**: Surfaces ambiguity without changing the clinician flow.

### Decision: Backward-compatible tobacco column

**Choice**: New `fumador_estado` select (Fumador/Exfumador/Nunca ha fumado). On
`collectFormData`, derive `fumador` as `Si` when `fumador_estado === 'Fumador'`,
else `No`. Legacy `fumador` column is preserved in the header list.
**Alternatives**: Drop `fumador` (rejected — `toxic-habits` spec keeps it for
backward compat until deprecation).
**Rationale**: Honors the spec's "keep until deprecation" rule and avoids v1 data
rewriting.

### Decision: Mode-specific flare input

**Choice**: New `renderFlaresSection(mode)` helper; first visit renders
`flares_total_ultimo_anio`; follow-up renders `flares_desde_ultima_visita`. The
non-rendered field is collected as empty string.
**Alternatives**: One field with a dynamic label (rejected — spec requires two
distinct column names).
**Rationale**: Clean column separation aligns with TSV export per circuit.

### Decision: `HEADERS_HS_VERSION` mismatch handling

**Choice**: Bump constant to `'v2'`. The loader's `normalizeRow` already
back-fills missing columns with empty strings, so v1 workbooks load with empty
v2 cells. A console-only warning is added in `loader.js` when the loaded
workbook's first row lacks any v2-only column (`comorb_acne_conglobata` or
`eva_prurito`).
**Alternatives**: Hard-fail on v1 workbook (rejected — spec mandates
backward-compatible load).
**Rationale**: Surfaces the migration signal without blocking clinicians.

## Data Flow

```
hs_schema.js (HEADERS_HS_VERSION='v2', IHS4 formula, new columns)
       |
       +--> form/shared_fields.js  (renderers, conditional logic, collectFormData)
       |           |
       |           +--> form/visit_form.js  (mode-aware flare section)
       |
       +--> tsv/exporter.js  (no logic change; column-aligned via COLUMNS)
       |
       +--> patient/longitudinal.js  (new PROMS/FLARES/ULTRASOUND sections)
       +--> service/list.js, service/dashboard_module.js  (DASHBOARD_MAP)
       |
       +--> excel/loader.js  (v1-workbook warning when v2 columns absent)
       +--> tests/*.mjs  (parity v2, TSV v2, dashboard, scope guard)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `HCE/hs_valme_hub/src/schema/hs_schema.js` | Modify | `HEADERS_HS_VERSION='v2'`, add `cuero_cabelludo` to `IHS_REGIONS`, add `comorb_acne_conglobata` to `COMORBIDITY_FIELDS`, append v2 columns in `buildHeadersHS()`, update `DERIVED.ihs4Score` to include `fd`, extend `DASHBOARD_MAP`. |
| `HCE/hs_valme_hub/src/form/shared_fields.js` | Modify | Add `renderFlaresSection`, `renderToxicHabitsSection`, `renderDemographicsExtras`, extend `renderPromsSection` (3 EVAs), `renderEcoSection` (drop Doppler, add `eco_hallazgos`), `renderAnamnesisSection` (replace `fumador` block), `bindFormInteractions` (UBE, f+fd warning, conditional show), `collectFormData` (derive `fumador`, `alcohol_ube_semana`, IHS4 with fd), `prefillFromBase` (new fields), `resetForm`. |
| `HCE/hs_valme_hub/src/form/visit_form.js` | Modify | Insert `renderFlaresSection(mode)` after the anamnesis/demographics block. |
| `HCE/hs_valme_hub/src/tsv/exporter.js` | Modify | Add `eva_*`, `flares_*`, `alcohol_*` numeric range validators (0-10/0+). |
| `HCE/hs_valme_hub/src/excel/loader.js` | Modify | Log a single warning if loaded v1 workbook lacks `comorb_acne_conglobata` or `eva_prurito`. |
| `HCE/hs_valme_hub/src/patient/longitudinal.js` | Modify | New `FLARES_COLUMNS` + `ULTRASOUND_COLUMNS`; extend `PROMS_COLUMNS` with 3 EVAs; new `renderFlares`, `renderUltrasound` sections. |
| `HCE/hs_valme_hub/src/service/list.js` | Modify | Add `flares_total_ultimo_anio`, `flares_desde_ultima_visita`, `eva_prurito`, `eva_olor`, `eva_supuracion` to `SUMMARY_COLUMNS` (optional behind a new flag, default off to avoid widening the table). |
| `HCE/hs_valme_hub/src/service/dashboard_module.js` | Modify | None mandatory; follow `DASHBOARD_MAP` updates. |
| `HCE/hs_valme_hub/tests/parity-check-node.mjs` | Modify | Update `makeBasePayload` for v2 columns; recompute IHS4 with fd; document expected divergence (only the v2 columns differ from legacy mock). |
| `HCE/hs_valme_hub/tests/tsv-export-check-node.mjs` | Modify | Add v2 column-count assertion, new fields in `makeValidPayload`, EVA range test. |
| `HCE/hs_valme_hub/tests/dashboard-check-node.mjs` | Modify | Assert `DERIVED.ihs4Score({n:1,a:1,f:1,fd:1}) === 11`; `topComorbidities` includes acne conglobata; new IHS region counted. |
| `HCE/hs_valme_hub/tests/scope-guard-check-node.mjs` | Verify only | Must still pass. |
| `docs/CONTRATO_DATOS_HS.md` | Modify | §2.2 version=v2, append rule; §7.1 IHS4 formula; document v2 fields; mark `eco_doppler` removed. |
| `docs/ESTADO_IMPLEMENTACION_HS.md` | Modify | Manual validation step 4 lists new PROMs/flares/ultrasound sections. |

## Interfaces / Contracts

```js
// hs_schema.js
HEADERS_HS_VERSION = 'v2';

IHS_REGIONS = [..., { key: 'cuero_cabelludo', label: 'Cuero cabelludo' }];

COMORBIDITY_FIELDS = [..., { key: 'comorb_acne_conglobata', label: 'Acne conglobata' }];

DERIVED.ihs4Score({ n=0, a=0, f=0, fd=0 })  // n + a*2 + (f+fd)*4

DASHBOARD_MAP.proms.columns = [..., 'eva_prurito', 'eva_olor', 'eva_supuracion'];
DASHBOARD_MAP.comorbidities.columns = [..., 'comorb_acne_conglobata'];
// New: DASHBOARD_MAP.flares, DASHBOARD_MAP.ultrasound, DASHBOARD_MAP.toxicHabits
```

New v2 columns appended after the v1 tail (positioned before any future
`seguimiento_*` tail):
`comorb_acne_conglobata, ihs_cuero_cabelludo_{n,a,f,fd}, edad_inicio,
nivel_educativo, fumador_estado, exfumador_anios, alcohol_consume,
alcohol_cervezas_vino_semana, alcohol_copas_destilados_semana,
alcohol_ube_semana, flares_total_ultimo_anio, flares_desde_ultima_visita,
flares_requirio_urgencias, flares_requirio_cirugia,
flares_requirio_antibioticos, eva_prurito, eva_olor, eva_supuracion,
eco_hallazgos`. (`eco_doppler` removed.)

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|---------|
| Unit (Node) | TSV row alignment, validation, IHS4 formula, dashboard KPIs, parity, scope | Extend the 5 existing Node checks; assert new v2 cell count, fd-included IHS4, EVA range, comorb scalp. |
| Manual | First vs follow-up flare wording, conditional UBE/exfumador/years, fistula warning UX, scalp counters | Load v1 workbook + register visit + copy row + paste in Excel per `docs/ESTADO_IMPLEMENTACION_HS.md` step 4. |
| Manual | v1 workbook load shows empty v2 cells without error | Load legacy `Base_Datos_HS_Valme.xlsx` and verify the load alert only warns (does not fail). |

## Migration / Rollout

- v1 workbooks keep loading; missing v2 columns read as empty strings via the
  existing `normalizeRow` back-fill in `loader.js`.
- `eco_doppler` is dropped from v2 — historical rows retain their data when read
  back (row carries the key, but new exports omit it).
- IHS4 totals for historical rows with `fd > 0` will rise on dashboard
  re-derivation; this is the documented data-integrity correction.
- Rollback: revert the single PR; restore `HEADERS_HS_VERSION='v1'`, the
  `n + a*2 + f*4` formula, and the legacy column set; re-run all five Node
  checks.

## Open Questions

- None blocking. Hurley / refined Hurley / HSPGA remain explicitly deferred to
  a future slice per the proposal.

## Review-Size Forecast

Estimated diff: ~+30 (schema) + ~150 (form) + ~30 (visit_form + exporter +
loader) + ~30 (longitudinal + list) + ~100 (tests) + ~80 (docs) ≈ 420 lines.
Slightly over the 400-line budget — recommend a single PR with **two atomic
commits** (schema+form+loader, then tests+docs) so reviewers can split by area.
Chained PRs are not required; the change is small and tightly coupled.
