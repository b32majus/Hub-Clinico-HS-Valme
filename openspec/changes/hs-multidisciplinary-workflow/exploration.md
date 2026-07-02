# Exploration: hs-multidisciplinary-workflow (Slice B)

> Phase: `sdd-explore` (interactive)
> Artifact store: hybrid (Engram `sdd/hs-multidisciplinary-workflow/explore` + this file)
> Date: 2026-07-02
> Workspace: `C:/Users/b32ma/Documents/HS Care Andalucia/Valme`
> Project key: `valme` (Engram), `Hub-Clinico-HS-Valme` (workspace label)
> Change parent (proposed): `hs-multidisciplinary-workflow`
> Slice: B — provisional, clinician-reviewable proposal. **NOT for implementation yet.**

## 0. Status labels used in this document

Every section/field below is labeled with one of the following to make the hypothesis boundary explicit:

- **HYPOTHESIS** — inferred from the legacy forms, the surgery protocol, the process redesign report, the GT1 minutes, and the current hub. The user can defend or reject it.
- **NEEDS CLINICIAN VALIDATION** — cannot be defended from the docs alone; must be confirmed in the next clinician meeting (Dra. Fiorella Vasquez + Cirugia General + Silvia Marquez) per "Pendiente 2" of `Informe_Multi_HS_Valme_v2.docx` section 13.

> This exploration is explicitly **not** a closed design. Several sections are framed as questions to the clinicians, with our best guess and the trade-offs visible.

## 1. Current state (relevant to this change)

The unified HS Valme hub is implemented under `HCE/hs_valme_hub/` (Vite + static, GitHub Pages deployed). The previous SDD change `hce-unified-clinical-tool` is archived; its modular specs live under `openspec/specs/`. A follow-up exploration `hs-clinical-form-updates` is on file and identified two future slices:

- **Slice A — `hs-monographic-clinical-fields`** — proposable now (proposal already drafted at `openspec/changes/hs-monographic-clinical-fields/proposal.md`).
- **Slice B — `multidisciplinary-workflow-modeling`** — explicitly gated on clinician input. This file is the dedicated exploration for that slice.
- **Slice C — `visual-redesign-icons`** — separate future change.

This exploration is the structured hypothesis the user can take to clinicians for Slice B.

### 1.1 What the hub does today for the multidisciplinary circuit

- A single `Multidisciplinar` Excel sheet exists (canonical key: `SHEET_KEYS.multidisciplinar = 'Multidisciplinar'`) and is read/written via the same `buildHeadersHS()` header as the monographic sheet (`HCE/hs_valme_hub/src/schema/hs_schema.js:240`).
- The visit form has only two modes: `primera` and `seguimiento` (`HCE/hs_valme_hub/src/form/visit_form.js:59`). The `consulta` selector (mono vs multi) lives inside the form, but the rest of the form is identical for both circuits.
- The current "Cirugia" block (`renderSurgerySection`, `HCE/hs_valme_hub/src/form/shared_fields.js:277`) is a first-visit-only block of 5 surgical specialties with a checkbox + free-text note each. It contains **no** fields for:
  - anesthetic type,
  - injected mixture volume,
  - intervention areas / number / type of lesions,
  - closure type,
  - wound healing,
  - prior surgery history,
  - OR agenda planning.
- `DASHBOARD_MAP.surgery` (`HCE/hs_valme_hub/src/schema/hs_schema.js:303`) only knows about the 5 specialties; `kpis.surgeryCounts` (`HCE/hs_valme_hub/src/service/kpis.js:62`) returns a list of `{label, count}` for those 5 specialties.
- The longitudinal view (`HCE/hs_valme_hub/src/patient/longitudinal.js:85`) shows surgery as a flat table with `cirugia_aplica` plus the 5 specialty booleans per visit.

### 1.2 What the existing clinical documents already say

The workspace contains rich, clinician-authored reference material that was not yet parsed in prior explorations. The following is a **hypothesis-grade** read; clinical phrases are kept verbatim where they matter for traceability.

Read-only artifacts (NOT to be edited by this change):

- `Formulario_Monografica_HS_Valme_v1.docx` — base monographic form. Already covered in `hs-clinical-form-updates/exploration.md`.
- `Formulario_Multidisciplinar_HS_Valme_v1.docx` — v1 multidisciplinary form: session header (date, n_sesion, NUSHA, type, origin), 5 open-text "specialty assessment" boxes, 4 decision checkboxes (treatment modification, surgical indication, additional referrals, discharge), action plan by specialty, next session.
- `Formulario_Multidisciplinar_HS_Valme_v2.docx` — v2 multidisciplinary form. Adds structured 3.1 Dermatology (control, treatment adjustment, analgesia, in-room ultrasound, RM/eco endoanal, recommendations) and 3.2 Joint surgical evaluation (indication, areas, extension, anesthesia plan, preop tests, observations). Adds structured 4 (derivations + waiting list + discharge destination).
- `Protocolo_Cirugia_Derma_HS_Valme_v1.docx` — basic surgery-Derma coordination protocol.
- `Protocolo_Cirugia_Derma_HS_Valme_v2.docx` — version 2 of the same protocol with full coordination circuit, biologic perioperative management, indicators, and explicit principle "no patient is operated without prior Derma evaluation".
- `Informe_Multi_HS_Valme_v2.docx` — process design report. Section 13 explicitly lists **"Pendiente 2: Refinamiento del formulario de la consulta multidisciplinar. El formulario de registro de sesion (Formulario_Multidisciplinar_HS_Valme_v2) es funcional pero pendiente de revision y ajuste tras las primeras sesiones reales. El objetivo es estructurar mejor los campos abiertos para permitir la explotacion de datos."** This exploration directly addresses that pending item.
- `Acta_Multi HS_GT1_Nov_2025.docx` — foundational minutes of the working group (Nov 2025). Section 13 lists pending items including "Set minimo de variables clinicas y de proceso a registrar de forma sistematica, con vision asistencial e investigadora".

### 1.3 Fields the user explicitly listed in this exploration prompt

The user listed (in Spanish) fields the multidisciplinary workflow may mix. Each one is mapped to a moment in section 3 below:

- anesthetic type
- injected mixture volume
- affected / intervention areas
- number of lesions
- lesion types (simple vs complex fistulas, etc.)
- closure type (secondary intention, primary closure, flap)
- whether already surgically intervened
- wound healing / cicatrization state
- prior surgery history: service, area, technique, healing time, recurrence, complications, satisfaction
- information useful to plan OR agenda: number of patients, number / complexity of lesions, areas to intervene, estimated time / complexity

These are the **mandatory candidate set** to be evaluated by clinicians. No field here is implicitly approved; all are HYPOTHESIS or NEEDS CLINICIAN VALIDATION.

## 2. Affected areas (preliminary, by slice)

This change will (eventually) modify, but **not in this exploration**:

| File | Why |
|---|---|
| `HCE/hs_valme_hub/src/schema/hs_schema.js` | Headers, version constant, surgery field list, dashboard map, derived counts. |
| `HCE/hs_valme_hub/src/form/shared_fields.js` | `renderSurgerySection` is a stub; needs a richer multidisciplinary surgery block plus a per-intervention sub-form. |
| `HCE/hs_valme_hub/src/form/visit_form.js` | Mode-conditional rendering — must distinguish `primera`/`seguimiento` AND `monografica`/`multidisciplinar`. |
| `HCE/hs_valme_hub/src/form/primera_visita.js`, `seguimiento.js` | Add a `circuit` parameter. |
| `HCE/hs_valme_hub/src/form/register_module.js` | Currently a 2-tab UI; multi vs mono is selected inside the form, not as a tab. May need a top-level selector. |
| `HCE/hs_valme_hub/src/tsv/exporter.js` | New columns must be appended after v1/v2; same Excel sheet by default, alternative sheet is an open question (see section 5). |
| `HCE/hs_valme_hub/src/patient/longitudinal.js` | Surgery section needs a richer view per patient; today it is a flat 5-specialty table. |
| `HCE/hs_valme_hub/src/service/{kpis, list, filters, dashboard_module, export}.js` | New surgery KPIs (e.g., % patients with surgical intervention, OR time per session, % secondary intention). |
| `HCE/hs_valme_hub/tests/parity-check-node.mjs` | Parity assertion must be updated to v2/v3 expectations; new columns are out-of-parity by construction. |
| `HCE/hs_valme_hub/tests/tsv-export-check-node.mjs` | Cell-count assertion must match the new column count for `multidisciplinar`. |
| `HCE/hs_valme_hub/tests/dashboard-check-node.mjs` | New surgery KPIs add fixtures. |
| `HCE/hs_valme_hub/tests/scope-guard-check-node.mjs` | Remains stable (HS-only, no nursing/PsO). |
| `docs/CONTRATO_DATOS_HS.md` | Sections 2, 6, 7, 9 must be updated when headers / circuit semantics change. |
| `docs/ESTADO_IMPLEMENTACION_HS.md` | "Que se ha construido" / parity notes must mention multidisciplinary surgery block. |
| `openspec/specs/visit-registration/spec.md` | MODIFIED scenarios for multi vs mono form, surgery block, prior surgery history. |
| `openspec/specs/{patient-dashboard, service-dashboard, excel-data-workflow}/spec.md` | MODIFIED scenarios for new surgery columns and OR planning aggregates. |

Reference docs that are read-only inputs (must NOT be edited by this change):

- `Formulario_Multidisciplinar_HS_Valme_v{1,2}.docx`
- `Protocolo_Cirugia_Derma_HS_Valme_v{1,2}.docx`
- `Informe_Multi_HS_Valme_v2.docx`
- `Acta_Multi HS_GT1_Nov_2025.docx`
- `HCE/hs_valme_formulario_clinico.legacy.html` (legacy; has the same 5-specialty surgery block the hub reproduces)

## 3. Conceptual workflow map (HYPOTHESIS)

The multidisciplinary circuit is a sequence of *moments*, each of which may correspond to one visit record, one intervention record, or one piece of aggregate planning data. The map below separates them so the clinicians can react to each independently.

```
                        (1) MD First visit
                                |
                                v
              (2) MD Follow-up pre-surgery  ----->  (3) OR agenda preparation
                                |                              |
                                v                              v
              (4) Surgical intervention record  <----- performed in joint OR
                                |
                                v
              (5) Post-surgical follow-up / healing
                                |
                                v
              (6) Prior surgery history   <--- cross-cutting (read-only in
                                              visits, writeable in dedicated
                                              first-visit block)
```

Key clarifications:

- **(1) MD First visit** (`consulta = multidisciplinar`, `tipo_visita = primera`) — multidisciplinary initial assessment. Already exists in the hub as a form-instance, but with no specific MD fields beyond the current 5-specialty block. HYPOTHESIS.
- **(2) MD Follow-up pre-surgery** — pre-surgical optimization visits in the multi circuit. Could be a new `tipo_visita` value (`seguimiento_preqx`) or just a `seguimiento` with a `en_lista_qx = Si` flag. NEEDS CLINICIAN VALIDATION.
- **(3) OR agenda preparation** — not a visit; aggregate planning data per OR session. Hypothesized as a new lightweight form/table that the Cirugia team uses to fill in `n_pacientes`, `complejidad_agenda`, `duracion_estimada`, etc. before the joint OR day. NEEDS CLINICIAN VALIDATION (does it belong in the hub at all, vs. a Diraya agenda export?).
- **(4) Surgical intervention record** — actual intervention, filled in by the surgical team on the day. May be one row per intervention per visit (a sub-collection under the visit) or a separate intervention record. NEEDS CLINICIAN VALIDATION.
- **(5) Post-surgical follow-up / healing** — new MD visit in the multi circuit, post-OR. Captures healing time, cicatrization state, complications, satisfaction. NEEDS CLINICIAN VALIDATION (see `Protocolo_Cirugia_Derma_HS_Valme_v2.docx` section 6.2: post-surgical review in multi, then decision: continues in multi or back to monographic).
- **(6) Prior surgery history** — cross-cutting block. It is *patient-level*, not visit-level. The form's `Form_Multi v2` does not currently model it. The legacy HTML monographic form captures it only as free text under "Tratamientos previos". HYPOTHESIS: model it as a separate structured block on the first MD visit (and possibly replicated in monographic) but not in every visit.

## 4. Candidate form sections, grouped by moment

The fields below are **candidates**. Each one is labeled:

- **R (likely required now)** — needed for the immediate post-validation use of the multi form, in our reading of `Form_Multi v2`, the protocol v2, and the GT1 minutes.
- **O (optional)** — useful but not in the critical path; may be deferred to a future slice.
- **V (validate with clinicians)** — cannot be decided without the next clinician meeting.
- **N (not for this form)** — belongs in a different artifact (Diraya agenda, OR record, etc.) or is out of scope for the hub.

### 4.1 Multidisciplinary first visit (`consulta = multidisciplinar`, `tipo_visita = primera`)

Builds on top of the current monographic first-visit form + current `renderSurgerySection`.

| Candidate field | Class | Notes / source |
|---|---|---|
| `sesion_fecha` | R | v1/v2 form header. Already partially captured as `fecha_visita`; "sesion" may be the same field or a separate one if a single visit can host multiple sessions. V: confirm. |
| `n_sesion_multi` | O | v1/v2 form has it. Useful as a session counter, not visit counter. V. |
| `tipo_sesion` (`primera` / `revision`) | R | v1/v2 form. |
| `origen_derivacion_multi` (`monografica` / `cirugia_general` / `retorno_postqx`) | R | v2 form §1. Currently `origen_paciente` is a free select; the multi form expects a more specific triage. V: keep as a separate field or extend `origen_paciente`? |
| `derma_control_inflamatorio` (`controlado` / `parcial` / `brote_activo`) | R | v2 form §3.1. V: wording + values. |
| `derma_ajuste_tto` (Sin cambios / Anadir / Suspender / Cambiar biologico) | R | v2 form §3.1. V: structured vs free text. |
| `derma_analgesia` (`adecuada` / `ajustar`) | O | v2 form §3.1. Useful for PROMs correlation. |
| `eco_en_sala` (`realizada` / `no_realizada` + findings) | R | v2 form §3.1. The `eco_*` columns already exist. V: preop vs in-room. |
| `rm_eco_endoanal` (`no_necesaria` / `solicitada`) | V | v2 form §3.1. V: structured or just free text. |
| `derma_recomendaciones` (free text) | O | v2 form §3.1. Useful, but should not block structured KPIs. |
| `cg_indi_qx` (`no_procede` / `electiva` / `pendiente`) | R | v2 form §3.2. Maps to today's 5-checkbox block but is more granular. |
| `cg_zonas_a_intervenir` (multi-region checkbox list) | R | v2 form §3.2. List should be the same as `IHS_REGIONS`. |
| `cg_extension_prevista` (`limitada` / `amplia`) | R | v2 form §3.2. V: confirm exact wording. |
| `cg_anestesia_prevista` (`local` / `sedacion` / `general_regional` / `a_confirmar`) | R | v2 form §3.2. The user's "anesthetic type". |
| `cg_pruebas_preop` (analitica / eco endoanal / RM / ECG-Rx / no necesarias) | R | v2 form §3.2. |
| `cg_plan_quirurgico` (free text) | O | v2 form §3.2. |
| `decision_modificacion_tto` | R | v1 form §4. |
| `decision_indicacion_qx` | R | v1 form §4. |
| `decision_derivaciones` (Psicologia, Endocrinologia, Med. Interna, AP, Plastica HUVR) | R | v1/v2 form §4. |
| `decision_alta_multi` (`continua_multi` / `alta_mono` / `alta_AP` / `pendiente`) | R | v2 form §4. Closes the visit. |
| `incluido_le_qx` (Si/No + fecha) | R | v2 form §4. Waiting list entry. |
| `plan_accion` (table per specialty) | O | v1/v2 form §5. V: structured vs free text. |
| `prox_sesion_fecha`, `prox_sesion_intervalo` | R | v1/v2 form §6. |
| `coordinador_sesion` (free text name) | O | v1/v2 form §6. V: identifier or free text? |

### 4.2 Multidisciplinary follow-up pre-surgery

Either a new `tipo_visita` value or a `seguimiento` with a `en_lista_qx` flag.

| Candidate field | Class | Notes |
|---|---|---|
| `en_lista_qx` (Si/No) | R | V: is this the same as `incluido_le_qx` from 4.1, or duplicated? |
| `fecha_prevista_intervencion` | O | V: free text date or derived from OR agenda? |
| `optimizacion_preqx` (free text: control del brote, vacuna, comorbilidad) | R | Aligns with `Protocolo_Cirugia v2` §9 (perioperative biologics). |
| `analitica_preqx_hecha` (Si/No) | R | Aligns with `Protocolo_Cirugia v2` §7.1. |
| `vacunacion_al_dia` (Si/No/Pendiente) | R | Already implicit in monographic form, but mandatory for pre-surgery. |
| `decision_tras_seguimiento` (`continuar` / `intervenir` / `aplazar` / `descartar_qx`) | R | Drives whether the patient moves to 4.3. |

### 4.3 OR agenda preparation (NEW — aggregate, not per-patient)

| Candidate field | Class | Notes |
|---|---|---|
| `or_sesion_id` | R | Identifier for an OR session. V: format. |
| `or_fecha` | R | |
| `or_servicio_responsable` (`derma` / `cg` / `mixto`) | R | |
| `or_anestesista_presente` (Si/No) | R | Aligns with `Informe v2` §7.2 (bimensual con anestesista). |
| `or_n_pacientes_previstos` | R | The user's "number of patients for OR". |
| `or_n_pacientes_intervenidos` | O | Filled post-hoc. |
| `or_duracion_estimada_total` (minutes) | O | V: how is it computed — sum of per-patient estimates? |
| `or_observaciones` (free text) | O | |

V (whole section): does the hub need to model OR agenda at all, or is it enough to provide a per-intervention sub-form and let Diraya own the agenda? GT1 minutes and `Informe v2` §7.3 explicitly say each OR session must record: type of intervention, anesthesia, time per patient, regions intervened. The most natural place is the intervention record (4.4) — the per-session aggregate is a rollup.

### 4.4 Surgical intervention record (NEW — sub-record under a visit)

A sub-collection: one MD follow-up pre-surgery visit can host 0..N intervention records. The form's `cg_zonas_a_intervenir` is the **plan**; the intervention record is the **execution**.

| Candidate field | Class | Notes |
|---|---|---|
| `intervencion_fecha` | R | |
| `intervencion_servicio_responsable` (`derma` / `cg` / `plastica_HUVR`) | R | Aligns with `Protocolo_Cirugia v2` §3. |
| `intervencion_tipo` (punch / drenaje / deroofing / exeresis_limitada / exeresis_amplia / reconstruccion_colgajo / otro) | R | Maps the cartera in `Informe v2` §3. |
| `intervencion_zonas` (multi-region) | R | Same list as `IHS_REGIONS` for consistency. |
| `intervencion_n_lesiones` (int) | R | The user's "number of lesions". |
| `intervencion_tipo_lesion` (`simple` / `compleja` / `fistula_simple` / `fistula_compleja` / `sinus`) | R | The user's "lesion types". |
| `intervencion_anestesia` (`local` / `sedacion` / `general` / `regional`) | R | The user's "anesthetic type". V: link to 4.3 `or_anestesista_presente`? |
| `intervencion_volumen_mezcla` (mL, int) | R | The user's "injected mixture volume". V: only when anestesia = local/sedacion? |
| `intervencion_cierre` (`secundaria` / `primaria` / `colgajo` / `mixto`) | R | The user's "closure type". |
| `intervencion_duracion_min` (int) | R | Aligns with `Informe v2` §7.3. |
| `intervencion_complicaciones_intraop` (free text) | O | |
| `intervencion_observaciones` (free text) | O | |

V: is the hub the right place for this record, or should it stay in the surgical act's informe (PDF/Diraya) and the hub just stores a `intervenido = Si` flag and a date? The hub's own data contract (`docs/CONTRATO_DATOS_HS.md` §2) is "read the Excel; do not write back" — but a clipboard-pasted row is fine. So in principle, intervention records can live on the `Multidisciplinar` sheet (or a new `Intervenciones` sheet) as additional rows.

### 4.5 Post-surgical follow-up / healing

| Candidate field | Class | Notes |
|---|---|---|
| `postqx_tiempo_cicatrizacion_dias` (int) | R | The user's "wound healing/cicatrization state". |
| `postqx_cierre_completo` (Si/No) | R | V: date of complete closure (better than days)? |
| `postqx_complicaciones` (free text or structured list) | R | The user's "complications". |
| `postqx_recidiva_local` (Si/No + fecha) | R | Aligns with `Protocolo_Cirugia v2` §11 quality indicator "tasa de reingreso quirurgico a 90 dias". |
| `postqx_satisfaccion` (1-5) | O | The user's "satisfaction". PREMs in GT1 minutes. |
| `postqx_seguimiento_destino` (`multi` / `monografica` / `alta_AP`) | R | Aligns with `Informe v2` §6.2. Closes the post-surgery loop. |
| `postqx_curas_complejidad` (`simples` / `complejas`) | O | Aligns with `Acta GT1` §6 (Enfermeria HS-linked). |
| `postqx_curas_responsable` (`AP` / `Derma` / `Enfermeria_HS` / `CG`) | O | Aligns with `Protocolo_Cirugia v2` §10. |

### 4.6 Prior surgery history (patient-level, writeable in first MD visit)

| Candidate field | Class | Notes |
|---|---|---|
| `histqx_servicio` (`derma` / `cg` / `plastica` / `gine` / `uro` / `otro`) | R | The user's "prior surgery history: service". |
| `histqx_area` (region) | R | The user's "area". |
| `histqx_tecnica` (free text or taxonomy) | R | The user's "technique". |
| `histqx_fecha` | R | |
| `histqx_tiempo_cicatrizacion_dias` (int) | R | The user's "healing time". |
| `histqx_recidiva` (Si/No + fecha) | R | The user's "recurrence". |
| `histqx_complicaciones` (free text) | R | The user's "complications". |
| `histqx_satisfaccion` (1-5) | O | The user's "satisfaction". |

V (whole section): the `Form_Multi v2` does not currently model prior surgery history. The legacy monographic form captures it only as free text. Should this be:

1. A repeated sub-record on the patient (1..N rows) — most clinically accurate.
2. A single free-text field — easiest to implement, but breaks data exploitation.
3. A separate patient-level sheet (e.g., `Antecedentes_Qx`) — the user's "history of surgeries performed by other services" leans this way.

The Acta GT1 (Nov 2025) §13 calls for "Set minimo de variables clinicas y de proceso" — this section directly answers that pending item.

## 5. Schema implications

### 5.1 Single `Multidisciplinar` sheet vs new sheets

Three options, with the trade-offs visible:

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A. Same `Multidisciplinar` sheet, append columns** | Keep the canonical workbook. Add ~30-50 new columns for moments 4.1-4.6, mostly nullable. | No workbook migration; no new loader. Parity test stays conceptually simple. | Sheet becomes very wide. Hard to model 1..N intervention records per visit (1:N blows up the column count). |
| **B. Same `Multidisciplinar` sheet + new `Intervenciones_Qx` sheet** | One row per visit in `Multidisciplinar`; one row per intervention in `Intervenciones_Qx`; one row per prior surgery in `Antecedentes_Qx`. Loader unions them on read. | Models 1:N cleanly. Fits the user's "history of surgeries" as a first-class concept. | Two/three sheets to validate; new tests; loader changes; dashboard needs to join. |
| **C. Just the form, no schema change** | Render the new fields, then concatenate them as TSV in free-text fields. | Zero schema impact. | Breaks `Informe v2` §13 explicit goal: "estructurar mejor los campos abiertos para permitir la explotacion de datos". Not acceptable. |

**Recommendation: Option B (new sheets) for the 1:N sub-records (interventions, prior surgery history), Option A for the per-visit fields.** This matches the user's listed fields cleanly and the GT1 / Informe v2 stated direction. V: confirm with clinicians.

### 5.2 Version bump

The change introduces new columns (and possibly new sheets). If even one column moves in the canonical sheet, `HEADERS_HS_VERSION` must bump. Realistic options:

- **v3**: append all new columns after v2, mark them `nullable` in docs.
- **v3 + new sheets**: append v3 to `Multidisciplinar` and create new sheets for sub-records. Loader reads them; clipboard writes back to the matching destination sheet.

**Recommendation: v3 + new sheets.** V: confirm with clinicians.

### 5.3 Dashboard impact

- Longitudinal surgery section needs a richer view: per-visit surgery yes/no, per-intervention mini-list (zone, type, closure, healing), post-QX cicatrization.
- Service dashboard needs new KPIs:
  - % patients on surgical waiting list.
  - % interventions with closure type = secundaria / primaria / colgajo.
  - Median healing time.
  - 90-day surgical re-entry rate (aligns with `Protocolo_Cirugia v2` §11 indicator).
  - % interventions in joint OR with anesthesiologist (aligns with `Informe v2` §7.2).
- OR agenda (if 4.3 is in scope at all) needs a new "Quirófano HS" view, not in scope for the patient dashboard.

### 5.4 Parity test impact

`tests/parity-check-node.mjs` asserts byte-equality of TSV with the legacy HTML. The legacy form does NOT have any of the new multidisciplinary fields. **Parity must be explicitly broken for the `multidisciplinar` circuit's new columns**, with parity still asserted for the unmodified columns. The test fixture must be updated. This is the same pattern Slice A will follow.

### 5.5 Privacy and persistence rules (unchanged)

No patient data in the repo, no localStorage, no IndexedDB, no telemetry. The new fields respect the same rules: they live in the user's Excel file and in memory only. The clipboard-paste workflow remains the only write path. **No new persistence mechanisms are introduced.**

## 6. Approaches: one change or many

Following the user-stated preference for atomic SDD changes (memory: "Keep SDD specs and tasks atomic"), this exploration recommends **NOT** merging Slice B into Slice A (`hs-monographic-clinical-fields`). The two slices have different risk profiles, different reviewers, and different clinical conversations.

Two reasonable SDD change shapes for Slice B:

| Approach | Description | Pros | Cons |
|---|---|---|---|
| **B1. One change, one PR (~300-450 LoC)** | `hs-multidisciplinary-workflow` as a single change with proposal, spec, design, tasks, apply, verify. | Simpler tracking; clinicians see one deliverable. | Likely exceeds the 400-line review budget once dashboard + tests + docs are added. |
| **B2. One change, two chained PRs** | `hs-multidisciplinary-workflow` change with two chained PR slices: (a) MD form + sheet v3 + surgery/intervention record; (b) dashboard + KPIs + indicators. | Each PR is reviewable; clinicians see the form slice first and can stop the chain if it fails. | More orchestration overhead. |
| **B3. Two separate SDD changes** | `hs-multidisciplinary-workflow` (form + schema) and `hs-or-planning-dashboard` (KPIs). | Truly atomic. | Two state files, two review threads; loses the linkage clinicians will need. |

**Recommendation: B2 — one SDD change (`hs-multidisciplinary-workflow`) with two chained PR slices, ask-always strategy.** The chained-PR strategy is already configured in the project (per the orchestrator prompt: "Chained PR strategy: ask-always"). The 400-line budget is tight for the full deliverable. This also matches the user's preference for atomicity (memory: "Keep SDD specs and tasks atomic").

## 7. Clinician-question list (concrete, answerable)

These are the questions to put on the table in the next clinician meeting (Dra. Fiorella Vasquez, Dr. Carlos Cruz, Silvia Marquez, possibly Dra. Lourdes Gomez and Dra. Amalia Perez Gil). They are framed to be answered "Yes / No / Let's discuss" with a 1-sentence justification.

### 7.1 Workflow boundaries

1. Do you confirm that the multidisciplinary first visit is the same patient-level record as a monographic first visit, with a `consulta = multidisciplinar` flag — or do you want a separate patient identifier for the multi circuit? (We currently assume the same NUSHA.)
2. Should a "MD follow-up pre-surgery" be a new `tipo_visita` value (`seguimiento_preqx` / `preqx`) or just a `seguimiento` with a `en_lista_qx = Si` flag? — `Form_Multi v2` does not pre-resolve this.
3. Does the hub need to model the OR agenda at all (`sesion_id`, `n_pacientes_previstos`, `anestesista_presente`)? Or is the per-intervention sub-record enough, and the OR agenda stays in Diraya? — `Informe v2` §7.3 calls for per-session systematic recording; the hub can either own it or mirror it.
4. Is the post-surgical follow-up a new MD visit (`consulta = multidisciplinar`, `tipo_visita = revision_postqx`) or a `seguimiento` of the pre-surgery visit?

### 7.2 Form fields

5. Confirm the field set in section 4.1 (MD first visit) — anything missing, anything to drop?
6. Is `cg_anestesia_prevista` a planned value (4.1) and `intervencion_anestesia` an executed value (4.4), or are they the same field with a `plan / real` toggle?
7. `intervencion_volumen_mezcla` (mL) — is this a per-anesthesia-prep field (always recorded) or only when `intervencion_anestesia ∈ {local, sedacion}`?
8. `intervencion_tipo_lesion` — keep it as `simple / compleja / fistula_simple / fistula_compleja / sinus`, or align with the existing `n / a / f / fd` taxonomy? (We recommend the latter; this reuses the hub's existing lesion model.)
9. Confirm `intervencion_cierre` taxonomy: `secundaria / primaria / colgajo / mixto` — anything else (injerto, laser prophylactic, etc.)?
10. For prior surgery history (4.6): is the data set complete? Should `histqx_tecnica` be a structured dropdown (matching `intervencion_tipo` in 4.4) or free text?
11. Is `postqx_satisfaccion` (1-5) sufficient, or do you also want a free-text `postqx_comentario_paciente`?

### 7.3 Schema

12. Same `Multidisciplinar` sheet with ~30-50 new columns (Option A) or new `Intervenciones_Qx` + `Antecedentes_Qx` sheets (Option B)? — We recommend B for the 1:N sub-records, A for the per-visit fields.
13. Confirm the version bump to `v3` (or `v3 + new sheets`). `docs/CONTRATO_DATOS_HS.md` will be updated in the same change.
14. Should the legacy `cirugia_dermatologia / cirugia_general / cirugia_plastica / cirugia_ginecologia / cirugia_urologia` checkbox block stay for backward compatibility, or be replaced by the new MD-specific blocks? — We recommend keeping it for the monographic circuit (where it still has meaning as a "needs surgery?" triage) and deprecating it inside the multi circuit.

### 7.4 Indicators and dashboards

15. Confirm the 90-day surgical re-entry rate (`Informe v2` §11) as a required dashboard KPI. What is the source of the "re-entry" event — a new MD visit with a post-QX tag, or a re-intervention record in `Intervenciones_Qx`?
16. Confirm the 30-min-per-patient, 4-6 first-visits-per-month multi agenda (`Informe v2` §6.1) is a target, not a constraint — i.e., the form should not enforce it, but the dashboard should display it.
17. Do you want a "Quirófano HS" tab in the service dashboard, summarizing OR sessions (date, n patients, n interventions, type breakdown)? Or is that out of scope for the hub?

### 7.5 Out-of-scope checks (to confirm the boundaries)

18. The hub must NOT touch nursing (`HCE/HS_consulta_enfermeria_HVR_2.html`), PsO (`HCE/PsO/`), or the HUV Rocio reference templates. Confirm this remains true for the multi form.
19. The hub must NOT store patient data on the server. Confirm the new fields follow the same in-memory + clipboard-paste rule.
20. The new MD form is HS-only. Confirm no other pathways (oncology, IBD, etc.) need to be modeled in the same change.

## 8. What should NOT be implemented yet

The following must remain unimplemented until clinicians validate them. Any of these appearing in a PR without clinician sign-off is a stop-the-line defect.

- New Excel columns (per visit) on the `Multidisciplinar` sheet. Even a single column.
- New `Intervenciones_Qx` or `Antecedentes_Qx` sheets in the canonical workbook.
- `HEADERS_HS_VERSION` bump from `v2` (post Slice A) to `v3`.
- New `tipo_visita` values (`seguimiento_preqx`, `revision_postqx`).
- New service-dashboard KPIs (90-day re-entry, % secondary intention closure, OR time).
- New "Quirófano HS" tab.
- Any change to the privacy/persistence rules (in-memory only, clipboard paste, no localStorage).
- Any modification of the existing monographic first-visit `cirugia_dermatologia / general / plastica / ginecologia / urologia` checkbox block inside the multi circuit.
- Any integration with Diraya, the surgical act's informe, or the OR agenda system.
- Any new persistence mechanism (IndexedDB, sessionStorage, etc.).

## 9. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Clinicians reject the 1:N sub-record (interventions, prior surgery history) and prefer a single free-text field | Medium | Frame Option B (new sheets) as a default but keep Option A (wide row) as a fallback. The proposal phase can pivot. |
| Version `v3` causes friction with already-deployed `Base_Datos_HS_Valme.xlsx` files | Medium | Append new columns after v2; document migration in `docs/CONTRATO_DATOS_HS.md`; show a clear warning when v2 columns are missing. |
| Dashboard additions push the change over the 400-line review budget | High | Recommend B2 (chained PRs). The form slice stays under 400 LoC, the dashboard slice stays under 400 LoC. |
| Mis-modeling of "tipo_visita" semantics breaks `kpis.primeras` / `kpis.seguimientos` | Medium | Keep the existing 2 values unchanged; new values are additive and additively counted. |
| Scope creep into the OR agenda (4.3), which the clinicians may decide lives in Diraya | Medium | Mark 4.3 as V in section 4 and gate it on a specific clinician answer. |
| Privacy boundary drift (someone adds localStorage) | Low | `scope-guard-check-node.mjs` already guards `localStorage` / `sessionStorage` / `IndexedDB`. Keep it in the change. |
| Confusion between monographic and multidisciplinary forms | Medium | Make `consulta` a top-level form selector (not a hidden field inside the form), per `Form_Multi v2` §1. |
| Out-of-scope references (nursing, PsO) are pulled in for "consistency" | Low | `scope-guard-check-node.mjs` already blocks the routes. Keep the references in the legacy nursing/PsO files, do not import them. |
| Slice A is not yet applied when Slice B is proposed | Low | The proposal phase will read Slice A's proposal and design as inputs; if Slice A is not yet merged, the v2 schema changes must be sequenced first. |
| Public docs (`docs/CONTRATO_DATOS_HS.md`, `docs/ESTADO_IMPLEMENTACION_HS.md`) become inconsistent with code | Medium | Update the docs in the same change, per the project's `phase_rules.verify` and `phase_rules.archive` rules. |

## 10. Ready for proposal

**This exploration is a structured hypothesis, not a proposal.** It is ready to be:

- Walked through with the clinicians to answer the V questions in section 7.
- Refined into a `proposal.md` for `hs-multidisciplinary-workflow` once at least items 1, 2, 3, 4, 12, and 14 of section 7 are answered.

**Not yet ready for `sdd-propose`** because:

- Multiple sections are explicitly NEEDS CLINICIAN VALIDATION (4.2, 4.3, 4.4, 4.5, 4.6; option 5.1.B; questions 1-20).
- The "Pendiente 2" of `Informe_Multi_HS_Valme_v2.docx` is a clinician-validated decision, not a developer decision.

**Recommended next step**: take this document to the next clinician meeting (Dra. Fiorella Vasquez + Cirugia General + Silvia Marquez) and use the question list in section 7 as the agenda. Once the V questions are answered, the orchestrator can run `sdd-propose` for `hs-multidisciplinary-workflow` with the change shaping per section 6 (B2: one change, two chained PR slices, ask-always strategy).

## 11. Artifacts

- This file: `openspec/changes/hs-multidisciplinary-workflow/exploration.md`
- Engram: `sdd/hs-multidisciplinary-workflow/explore` (mirrored with `capture_prompt: false`).
- Input artifacts (read-only): `Formulario_Multidisciplinar_HS_Valme_v{1,2}.docx`, `Protocolo_Cirugia_Derma_HS_Valme_v{1,2}.docx`, `Informe_Multi_HS_Valme_v2.docx`, `Acta_Multi HS_GT1_Nov_2025.docx`.
- Related explorations/proposals: `openspec/changes/hs-clinical-form-updates/exploration.md`, `openspec/changes/hs-monographic-clinical-fields/proposal.md`.
