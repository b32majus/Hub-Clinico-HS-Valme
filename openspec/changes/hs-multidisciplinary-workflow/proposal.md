# Proposal: HS Multidisciplinary Workflow

## Intent

Create a clinician-validable proposal for Slice B: refining the multidisciplinary/surgical HS workflow so `Formulario_Multidisciplinar` can support data exploitation and OR planning. This closes the documented `Informe_Multi_HS_Valme_v2` pending need to structure currently open fields. This is **not implementation-ready** until clinicians validate the assumptions below.

## Scope

### In Scope
- Workflow hypothesis across six moments: MD first visit, MD pre-surgical follow-up, OR planning, surgical intervention record, post-surgical follow-up/healing, prior surgery history.
- Candidate field groups classified as Required now / Optional / Validate / Not this form.
- Schema recommendation and validation agenda for the clinical team.

### Out of Scope
- Slice A monographic changes, visual/icon redesign, nursing, PsO, backend/database/storage changes.
- Any new surgical fields, sheets, visit types, or KPIs before clinician sign-off.

## Capabilities

### New Capabilities
- `multidisciplinary-surgical-workflow`: clinician-validated MD surgical workflow, including intervention/prior-surgery sub-records if approved.
- `schema-v3`: versioned append-only v3 schema and optional new surgical sheets, only if validated.

### Modified Capabilities
- `visit-registration`: circuit-aware MD form sections and validated visit/intervention moments.
- `excel-data-workflow`: parse/write TSV for `Multidisciplinar` plus validated new sheets.
- `patient-dashboard`: richer longitudinal surgery/healing display.
- `service-dashboard`: validated OR/surgery indicators.
- `dashboard-and-parity-impact`: v3 parity divergence, checks, and docs.

## Approach / Hypothesis

| Moment | Candidate groups | Classification |
|---|---|---|
| 1. MD first visit | session header, referral origin, Derma control/treatment, joint surgical indication, planned areas/anesthesia/preop tests, decisions, next session | Required now + validate wording |
| 2. MD pre-surgical follow-up | waiting-list status, planned date, optimization, labs, vaccination, proceed/aplazar decision | Required now, validate visit type |
| 3. OR planning | OR session id/date, responsible service, anesthetist, expected patients, estimated duration | Validate; possibly not this form if Diraya owns agenda |
| 4. Surgical intervention record | date, service, technique, zones, lesion count/type, anesthesia, injected volume, closure, duration, complications | Required only after validation |
| 5. Post-surgical follow-up | healing days/closure, complications, recurrence, satisfaction, follow-up destination | Required now + optional PREM detail |
| 6. Prior surgery history | service, area, technique, date, healing time, recurrence, complications, satisfaction | Validate; patient-level, not repeated visit text |

Schema recommendation: **Option B** — keep `Multidisciplinar` for per-visit fields and add `Intervenciones_Qx` / `Antecedentes_Qx` only if clinicians validate 1:N records. Any accepted column/sheet change bumps to `HEADERS_HS_VERSION = 'v3'` and remains append-only. Privacy stays unchanged: Excel + runtime memory + clipboard only.

## Clinical Validation Gates

- Clinicians must confirm moments 1-6, required/optional fields, field taxonomies, and whether OR planning belongs in the hub.
- They must choose wide-sheet vs new-sheet model and approve v3 migration.
- Stop-the-line: no implementation before answers on workflow boundaries, schema option, and legacy surgery block handling.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `HCE/hs_valme_hub/src/form/*` | Modified | Circuit-aware MD sections after validation. |
| `HCE/hs_valme_hub/src/schema/hs_schema.js` | Modified | v3 columns/sheets if approved. |
| `HCE/hs_valme_hub/src/tsv/exporter.js`, loader services | Modified | TSV/new-sheet handling. |
| `HCE/hs_valme_hub/src/patient/*`, `src/service/*` | Modified | Surgery/healing views and KPIs. |
| `HCE/hs_valme_hub/tests/*.mjs` | Modified | Export, dashboard, parity, scope guards. |
| `docs/CONTRATO_DATOS_HS.md`, `docs/ESTADO_IMPLEMENTACION_HS.md` | Modified | v3/data-contract updates. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Wrong clinical model | High | Use proposal as meeting artifact; do not implement until signed off. |
| v3 workbook friction | Medium | Append-only columns, documented migration, explicit warnings. |
| 400-line budget overrun | High | One SDD change with two chained PRs: form/schema first, dashboards/docs second. |
| OR agenda scope creep | Medium | Gate OR tab/session fields separately. |
| Nursing/PsO/privacy drift | Low | Keep scope guard and no browser persistence. |

## Rollback Plan

If rejected, archive this proposal as clinician-deferred with no code changes. If later implemented and reverted, restore v2 headers/docs/tests and remove any new sheets/views from the active hub.

## Clinician Meeting Agenda

1. Confirm six workflow moments and visit-type semantics.
2. Approve/drop required fields and taxonomies, especially anesthesia, lesion type, closure, healing, and prior surgery history.
3. Decide whether OR planning is in hub or Diraya-only.
4. Choose schema strategy: wide `Multidisciplinar` vs `Multidisciplinar` + `Intervenciones_Qx`/`Antecedentes_Qx`.
5. Confirm required dashboard indicators and out-of-scope boundaries.

## Success Criteria

- [ ] Clinicians validate or reject the six-moment model.
- [ ] Field classifications and schema strategy are decided before spec.
- [ ] Next phase is blocked or proceeds with explicit clinician-approved assumptions.

## Next Recommended Phase

Blocked on clinical validation before `sdd-spec`. After validation, proceed to `sdd-spec`, then design/tasks with chained PR planning.
