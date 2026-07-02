# Exploration: hs-clinical-form-updates

> Phase: `sdd-explore` (interactive)
> Artifact store: hybrid (Engram `sdd/hs-clinical-form-updates/explore` + this file)
> Date: 2026-07-02
> Workspace: `C:/Users/b32ma/Documents/HS Care Andalucia/Valme`
> Project key: `valme` (Engram), `Hub-Clinico-HS-Valme` (workspace label)

## 1. Current state (relevant to this change)

The unified HS Valme hub is implemented under `HCE/hs_valme_hub/` (Vite + static, GitHub Pages deployed at `b32majus/Hub-Clinico-HS-Valme`). The previous SDD change `hce-unified-clinical-tool` is archived (`openspec/changes/archive/2026-07-02-hce-unified-clinical-tool/`) and implemented; its modular specs live under `openspec/specs/{hub-navigation, excel-data-workflow, visit-registration, patient-dashboard, service-dashboard, deployment-resilience, hs-clinical-hub}/spec.md`.

Schema/canonical decisions that constrain this change:

- `HEADERS_HS_VERSION = 'v1'` (decision: keep `v1` until columns actually change; see `sdd/hce-unified-clinical-tool/schema-version`).
- Single source of truth: `HCE/hs_valme_hub/src/schema/hs_schema.js` (columns, regions, lesion types, comorbidities, surgery, PROMs, derived `IHS4`).
- Form rendering: `src/form/shared_fields.js` (`renderAnamnesisSection`, `renderIhsSection`, `renderEcoSection`, `renderPromsSection`, `renderSurgerySection`, `renderComorbiditySection`, …). First/follow-up entry points are thin wrappers in `src/form/primera_visita.js` and `src/form/seguimiento.js` over `createVisitForm` in `src/form/visit_form.js`.
- TSV export: `src/tsv/exporter.js` (writes one row matching `COLUMNS[circuit]` for `monografica` and `multidisciplinar`). The cumulative Excel workbook `Base_Datos_HS_Valme.xlsx` is the real database; clipboard/paste is the only write path. Data contract: `docs/CONTRATO_DATOS_HS.md`.
- Tests protecting the schema/parity: `tests/parity-check-node.mjs`, `tests/tsv-export-check-node.mjs`, `tests/scope-guard-check-node.mjs`, `tests/stale-base-check-node.mjs`, `tests/dashboard-check-node.mjs`.
- `docs/ESTADO_IMPLEMENTACION_HS.md` and `docs/CONTRATO_DATOS_HS.md` are committed public-facing docs that must be kept consistent with any schema change.

What is already in the schema (relevant subset):

- `fumador` is a `Si/No` select (no `Exfumador` state, no time-since-quitting field).
- Comorbidities include `comorb_acne` (generic). `acné conglobata` is not split out and is not a separate field.
- `IHS_REGIONS` has 14 fixed regions (`axila_d/i`, `ingle_d/i`, `gluteo_d/i`, `muslo_d/i`, `mama_d/i`, `intermamaria`, `genital`, `perianal`, `otras`). No scalp. "Atypical locations" are not a structured field beyond `otras_regiones` (free text) and `otras_lesiones`.
- `IHS_LESION_TYPES` already has four keys: `n` (nodulo), `a` (absceso), `f` (fistula), `fd` (fistula-drenante). The clinical score formula in `DERIVED.ihs4Score` is `n + a*2 + f*4` — i.e. regular `f` (fistula) IS already counted, and `fd` is NOT in the formula. The hint text in `renderIhsSection` reads "Fistulas drenantes x 4" (which contradicts the current formula). This is a wording-vs-code drift in the live hub and a clinical semantic that the user is asking to make explicit.
- PROMs section already exposes `eva_dolor` and the DLQI/HSQoL-24 summaries. No `pruritus`, `olor`, `supuracion`.
- No flare/recurrence field is collected at all.
- `education level` and `age of onset` are not represented (only `anio_inicio` and `anio_diagnostico` years).
- `Hurley`, refined Hurley, and `HSPGA` are not in the schema.
- Ultrasound section already has `eco_nodulos / eco_abscesos / eco_fistulas / eco_ihs4 / eco_gravedad / eco_doppler` and no open text field for findings.
- The CIRUGIA section is currently a *first-visit* block of 5 specialties with checkboxes + free-text notes (`cirugia_dermatologia`, `cirugia_general`, `cirugia_plastica`, `cirugia_ginecologia`, `cirugia_urologia`). There are no fields for anesthetic type, injected mixture volume, number of lesions, lesion types (simple vs complex), closure type, or surgical outcome. The legacy HTML and the existing protocol docs (`Protocolo_Cirugia_Derma_HS_Valme_v1.docx`/`v2.docx`) and the multidisciplinary form templates (`Formulario_Multidisciplinar_HS_Valme_v1.docx`/`v2.docx`) live in the workspace but are not parsed in this exploration.

## 2. Affected areas (preliminary, by slice)

| File | Why |
|---|---|
| `HCE/hs_valme_hub/src/schema/hs_schema.js` | Column list, version constant, comorbidity array, lesion types, derived IHS4, region list, PROM lists, surgery fields. |
| `HCE/hs_valme_hub/src/form/shared_fields.js` | Anamnesis, comorbidity, IHS4, eco, PROMs, surgery, terapia, seguimiento render functions and `bindFormInteractions` (calculations, totals, warnings). |
| `HCE/hs_valme_hub/src/form/visit_form.js` | Mode-conditional rendering of `renderSurgerySection` (only `primera`); therapy normalization; reset/export. |
| `HCE/hs_valme_hub/src/form/primera_visita.js`, `seguimiento.js` | Thin wrappers; only need a `mode`-conditional render if a field becomes first-visit-only or follow-up-only. |
| `HCE/hs_valme_hub/src/tsv/exporter.js` | Validators, header order, destination sheet selection. Any new column must align with `COLUMNS[circuit]`. |
| `HCE/hs_valme_hub/src/patient/longitudinal.js` | Dashboard table sections; if PROM/comorbidity/surgery maps change, sections may need new columns. |
| `HCE/hs_valme_hub/src/service/{kpis, list, filters, dashboard_module, export}.js` | If `eco_doppler` is removed or `ihs4_total` weighting changes, KPIs and filters must follow. |
| `HCE/hs_valme_hub/tests/parity-check-node.mjs` | Reference fixtures (must be updated for any column change). |
| `HCE/hs_valme_hub/tests/tsv-export-check-node.mjs` | Cell-count and validation assertions. |
| `HCE/hs_valme_hub/tests/scope-guard-check-node.mjs` | Remains stable — the change is HS-only, not nursing/PsO. |
| `HCE/hs_valme_hub/tests/dashboard-check-node.mjs` | KPI fixtures if surgery/IHS4 weighting changes. |
| `docs/CONTRATO_DATOS_HS.md` | Sections 2, 7, 8, 9, 10 must be updated when headers/IHS4/therapy/surgery change. |
| `docs/ESTADO_IMPLEMENTACION_HS.md` | Update "Que se ha construido" / parity notes after each slice. |
| `openspec/specs/visit-registration/spec.md` | MODIFIED scenarios if the form is split or new fields are added. |
| `openspec/specs/{patient-dashboard, service-dashboard, excel-data-workflow}/spec.md` | MODIFIED scenarios if a new column needs dashboard visualization or changes the schema contract. |

Reference docs in workspace (read-only, for clinician wording and paridad mental, not to be modified by this change):

- `HCE/hs_valme_formulario_clinico.legacy.html` — legacy HS monográfica; "Fumador Si/No", `aniosFumador`, no alcohol UBE, no scalp, `otrasLesiones` free text.
- `HCE/HS_consulta_enfermeria_HVR_2.html` — nursing form; out of scope but reference for alcohol UBE, `sg_n_brotes`, surgical fields (`cx_tipo_cierre`, `cx_anestesia_local`, `cx_analgesia`, `cx_tipo_qx`), and prior-surgery history block (`pv_n_cirugias`, `pv_bio_previo`).
- `HCE/PsO/*` — out of scope; reference for `comorb_alcohol`, `desenc_alcohol`, and `eva_prurito` patterns.
- `Formulario_Monografica_HS_Valme_v1.docx`, `Formulario_Multidisciplinar_HS_Valme_v1.docx`, `Formulario_Multidisciplinar_HS_Valme_v2.docx`, `Protocolo_Cirugia_Derma_HS_Valme_v{1,2}.docx`, `Informe_Multi_HS_Valme_v2.docx`, `Acta_Multi HS_GT1_Nov_2025.docx` — Word docs that probably enumerate the multidisciplinary consultation data needed; **not extracted as text in this exploration** because the user explicitly asked to inspect them "if accessible" but not to edit them. A future task should extract and reference them.

## 3. Slicing strategy (small, atomic, reviewable)

This change is intentionally NOT a single mega-change. The 400-line review budget plus user preference for modular SDD slices points to four short PRs (each a separate SDD change). The first PR is the only one whose scope is now firm enough to propose without clinician interviews; the others are exploratory and need clarification before they can be proposed.

### Slice A — `monographic-clinical-fields` (proposable now, ~150–250 LoC)

Clear, low-risk schema/form additions where the wording is already mostly settled:

1. New comorbidity: `comorb_acne_conglobata` (acné conglobata). Adds one column. No migration risk for existing rows.
2. New IHS region: `cuero_cabelludo` (afectación de cuero cabelludo), atypical. Adds four IHS counter columns (n/a/f/fd) and a totals column chunk. May bump the schema version to `v2` because the columns shift.
3. New toxic-habits fields:
   - `fumador_estado` (`fumador`/`exfumador`/`nunca_ha_fumado`) — replaces or supplements current `fumador` (`Si/No`). Open question: keep `fumador` for parity and add a new state column, or repurpose. Recommendation: add `fumador_estado` and deprecate `fumador` only after data contract review.
   - `exfumador_anios` (time since quitting, only when `fumador_estado = exfumador`).
   - Alcohol block:
     - `alcohol_consume` (`si`/`no`/`nunca`).
     - `alcohol_cervezas_vino_semana` (int).
     - `alcohol_copas_destilados_semana` (int).
     - `alcohol_ube_semana` (derived: cervezas_vino*1 + copas_destilados*2; stored for stability).
4. New PROM/EVA items beyond pain:
   - `eva_prurito` (0-10).
   - `eva_olor` (0-10).
   - `eva_suppuration` (0-10).
5. Flare questions:
   - `flares_total_ultimo_anio` (int) — first-visit default; numeric.
   - `flares_desde_ultima_visita` (int) — follow-up only; numeric.
   - `flares_requirio_urgencias` (Si/No).
   - `flares_requirio_cirugia` (Si/No).
   - `flares_requirio antibioticos` (Si/No — note: column name without accent, `flares_requirio_antibioticos`).
6. Education level and age of onset/debut:
   - `nivel_educativo` (Sin estudios / Primarios / Secundarios / Universitarios — derived from regional form).
   - `edad_inicio` (int years) and/or keep `anio_inicio` (year). `edad_inicio` is more clinically portable; `anio_inicio` already exists. Decision: keep both or replace. Recommendation: keep both for clinician cleanup; do not delete `anio_inicio` in this slice.
7. Hurley and refined Hurley / HSPGA as optional severity supplements — *defer to a follow-up slice* because the user marked these "consider" and they need score conventions.
8. Ultrasound updates:
   - Remove `eco_doppler` (Doppler is not adding clinical value per current preference). Open question: deprecate silently or remove column? Recommendation: remove and bump version; if version must stay v1, keep column with empty value and a deprecation note in the contract.
   - Add `eco_hallazgos` (open text field for ultrasound findings).
9. IHS4 draining-fistula logic:
   - Make the score formula explicit: `n + a*2 + (f + fd)*4` — i.e. regular fistula AND draining fistula both count with weight 4 (the user's stated rule). The current code already does this for `f`; the change is to make `fd` also count (it does not today) and to fix the hint text. The user also asked for a soft warning when both `f` and `fd` are marked in the same anatomical region to ask whether they are the same lesion. This warning lives in `bindFormInteractions` (form-level) and is purely UX; it does not need to change the score.

Estimated diff size: ~150–250 LoC (schema + form rendering + collectors + tests + docs). Within 400-line budget. Single PR possible.

Schema version: this slice changes the column list, so `HEADERS_HS_VERSION` should be bumped from `v1` to `v2`. That triggers:
- `docs/CONTRATO_DATOS_HS.md` §2.2, §7, §8, §9, §10 update.
- `tests/parity-check-node.mjs` reference fixtures (cannot be byte-identical to legacy anymore, by definition).
- `tests/tsv-export-check-node.mjs` cell count assertions.

### Slice B — `multidisciplinary-workflow-modeling` (NOT proposable yet; needs clinician input)

Open clinical workflow questions that must be clarified before this slice can be proposed:

1. Should the multidisciplinary circuit keep a single first-visit form (current behavior) or split into a true `Primera consulta multidisciplinar` and `Seguimiento multidisciplinar`?
2. Where do these fields belong?
   - Multidisciplinary visit assessment: anesthetic type, injected mixture volume, areas planned, lesion count, lesion types.
   - Pre-surgical / OR agenda: which of those map to OR planning vs OR execution vs post-op follow-up?
   - Actual surgical intervention data: anesthetic type administered, mixture volume, intervened areas, number of lesions, lesion types (simple vs complex fistulas), closure type (secondary intention / primary / flap).
   - Post-surgical healing: healing time, recurrence, complications, satisfaction.
3. Prior surgery history: should it be a separate "Antecedentes quirúrgicos HS" block (service, area, technique, healing time, recurrence, complications, satisfaction) or merged into the visit?
4. Does each visit get a separate "Intervención realizada" sub-form, or does the visit record a summary that links to a future dedicated intervention record?
5. Does the user want the Excel `Multidisciplinar` sheet to receive additional columns for these fields, or should they live in a new sheet (e.g., `Intervenciones`)?

Until the user resolves these, this slice stays at "questions to clinicians" and is **not** part of Slice A.

### Slice C — `visual-redesign-icons` (LATER; explicit out-of-scope of this change)

Aesthetics, icon library quality, and any reference to original/reference hubs or Universidad de Madrid website go in a separate change. Do not include in any slice of `hs-clinical-form-updates`.

### Recommended ordering and PR strategy

- Slice A is proposable now and is a single PR, ~200 LoC, within the 400-line review budget. Chained PRs are not required if the diff stays tight.
- Slice B is gated on clinician interviews and is intentionally a separate SDD change.
- Slice C is a separate, future change.

## 4. Open questions to clinicians (blockers for Slice B; informational for Slice A)

1. **Toxic habits — fumador**:
   a. Keep the current binary `fumador` `Si/No` column for legacy parity, and add a new `fumador_estado` field (`fumador`/`exfumador`/`nunca_ha_fumado`) — or replace `fumador` outright?
   b. When `exfumador`, the time-since-quit field: store as years (int) or as a quitting year? Year is more stable; years-since is more clinically relevant.
2. **Alcohol UBE**: confirm the 1 UBE / 2 UBE weights (beer/wine = 1, cup/spirit = 2) and whether consumption should be tracked as a *total weekly* (consume Si/No + 2 weekly counts) or as a per-drink-type list.
3. **Atypical location — scalp**: confirm exact label `Cuero cabelludo`; whether both `f` and `fd` should be counted for scalp like any other region.
4. **Flare wording**: the user's suggestion `¿Ha sufrido algún brote desde la última visita?` applies to follow-up. For first visit, is `Número aproximado de brotes en los últimos 12 meses` acceptable? Should the form also ask about "brotes graves" (requirieron urgencias, cirugía, antibióticos)?
5. **IHS4 logic**: confirm draining fistula counts as weight 4 (same as regular fistula). Confirm the soft warning for `f + fd` in the same region is acceptable UX (it does not block export).
6. **Doppler ultrasound**: confirm Doppler can be removed entirely from the schema (column drop) or kept as an optional future-use field.
7. **Hurley / refined Hurley / HSPGA**: are they desired as structured data, or is the user only asking to consider them? If structured, do clinicians want the dropdown values and totals derived in JS, or raw counts?
8. **Multidisciplinary workflow** (Slice B blockers):
   a. Single first-visit form or split?
   b. Which of the requested surgical fields (anesthetic type, mixture volume, areas, lesions count/types, closure type) belong in (i) the multidisciplinary visit, (ii) the pre-surgical/OR agenda, (iii) the post-intervention record, and (iv) the prior-surgery history block?
   c. Is the prior-surgery history a separate "Antecedentes quirúrgicos" block (one row per past intervention) or part of the active visit?
   d. Does each new surgical field need to be on the same Excel sheet, or is a new sheet (e.g., `Intervenciones_HS` / `Antecedentes_Qx_HS`) acceptable?
9. **Schema version**: do the clinicians accept a `v2` bump now (because the columns change), or do they prefer keeping `v1` and deprecating legacy fields? The data contract explicitly says columns cannot change without a version bump; user preference is `v2` when columns change.
10. **Education level**: confirm the 4-level set (Sin estudios / Primarios / Secundarios / Universitarios) and whether `edad_inicio` (years) is acceptable alongside the existing `anio_inicio`.

## 5. Risks

- **Schema compatibility**: every new column shifts the Excel header row. The current Excel file `Base_Datos_HS_Valme.xlsx` is a single-row canonical structure; new columns either append or replace. Appending is the safe default; replacing requires the user's local file to be re-shaped. **Mitigation**: only append; update `HEADERS_HS_VERSION` to `v2`; document migration in `docs/CONTRATO_DATOS_HS.md`.
- **Parity test breakage**: `tests/parity-check-node.mjs` is byte-identical to the legacy TSV by construction. Any column change makes the parity assertion invalid. The test must be updated, not removed. **Mitigation**: keep parity for unmodified circuits where possible, and explicitly mark new columns as out-of-parity where added.
- **Score semantics**: changing the IHS4 score to also weight `fd` at 4 will change the totals for every existing visit where `fd` is recorded. The legacy formula in `CONTRATO_DATOS_HS.md` §7.1 explicitly says `fistulas_drenantes * 4` and is consistent with the user's request, but the actual code currently does `f + a*2 + f*4` (regular fistula at 4, draining fistula at 0). This is a clinical data integrity fix; **mitigation**: communicate to clinicians and update contract + dashboard.
- **TSV cell count**: `tests/tsv-export-check-node.mjs` asserts the cell count per circuit. Any column add/remove breaks the test. **Mitigation**: update assertions alongside the schema change.
- **Dashboard impacts**: `DASHBOARD_MAP` in `hs_schema.js` enumerates which columns the longitudinal and service dashboards read. New columns (e.g., `eva_prurito`, `flares_total_ultimo_anio`) may need new dashboard sections; removing `eco_doppler` simplifies the eco dashboard. **Mitigation**: update `DASHBOARD_MAP` and the relevant `src/patient/longitudinal.js` and `src/service/*` consumers in the same slice.
- **Form-conditional fields**: introducing `fumador_estado = exfumador` showing `exfumador_anios`, or `alcohol_consume = si` showing weekly counts, requires updating `bindFormInteractions` (`updateConditional`) and `collectFormData`. **Mitigation**: keep the new fields' visibility in lockstep with the schema.
- **Out-of-scope references**: `HCE/HS_consulta_enfermeria_HVR_2.html` and `HCE/PsO/*` contain patterns the user mentioned (alcohol UBE, `eva_prurito`, surgery fields). The `scope-guard-check-node.mjs` test will still pass because the patterns live in those files, not in `src/`. **Mitigation**: do NOT add references to nursing/PsO routes; the guard remains in place and unchanged.
- **Multidisciplinary scope creep**: the surgical fields the user is asking about touch workflow modeling, not just data capture. Without a clinician interview, adding them now risks implementing the wrong thing. **Mitigation**: keep Slice A small and surgical-fields out of this change; gate Slice B on clinician input.
- **Review budget**: Slice A is sized to fit one PR at ~200 LoC. The combined slices (A+B+C) are well over the budget, which is exactly why splitting is recommended. **Mitigation**: keep PRs atomic.
- **Public-facing docs**: `docs/ESTADO_IMPLEMENTACION_HS.md` and `docs/CONTRATO_DATOS_HS.md` are committed and will be visible after the next deploy. **Mitigation**: update them in the same slice as the code they describe; verify the changes do not mention features that have not shipped.

## 6. Ready for proposal

**Slice A only** is ready for `sdd-propose`. A single PR per slice, ~200 LoC, no chained PRs required.

**Slices B and C** are NOT ready for proposal; they need clinician input and a future change respectively.

## 7. Artifacts

- This file: `openspec/changes/hs-clinical-form-updates/exploration.md`
- Engram: `sdd/hs-clinical-form-updates/explore` (mirrored with `capture_prompt: false`).
