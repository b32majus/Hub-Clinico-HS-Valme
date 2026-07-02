# Proposal: HS Monographic Clinical Fields

## Intent

Update the HS Valme monographic visit schema so clinicians can record currently missing clinical severity, symptom, toxic-habit, flare, and ultrasound details without changing the hub architecture, Excel/TSV write path, or excluded nursing/PsO scopes.

## Scope

### In Scope
- Add monographic clinical/form/schema fields: acne conglobata; scalp involvement (`cuero_cabelludo`); refined tobacco state; alcohol/UBE; EVA pruritus, odor, suppuration; flare counts/flags; education level; age of onset/debut.
- Correct IHS4 semantics to `n + a*2 + (f + fd)*4` and show a soft warning when regular and draining fistula are both marked in the same anatomical area.
- Update ultrasound capture: keep echographic IHS4, stop collecting Doppler in the form, add open text findings/comments.
- Bump `HEADERS_HS_VERSION` to `v2`; append new columns after the existing v1 columns and preserve existing v1 column order.
- Keep optional Hurley, refined Hurley, and HSPGA as low-risk optional fields only if the spec phase can define unambiguous dropdown values; otherwise leave them as an explicit open question.

### Out of Scope
- Multidisciplinary/surgical workflow modeling (Slice B).
- Visual redesign/icons (Slice C).
- Nursing, PsO, backend/database, browser persistence, automatic Excel writes, or storage changes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `visit-registration`: add v2 monographic clinical fields, IHS4 correction, mode-specific flare wording, and ultrasound comments.
- `excel-data-workflow`: validate/read v2 appended-column schema while keeping Excel/TSV clipboard as the only write path.
- `patient-dashboard`: surface new longitudinal clinical fields where useful, especially PROMs, IHS4, flares, comorbidities, and ultrasound comments.
- `service-dashboard`: update aggregate maps/KPIs affected by v2 PROM, IHS4, flare, comorbidity, and ultrasound fields.

## Approach

Update the schema source of truth in `HCE/hs_valme_hub/src/schema/hs_schema.js`, then adjust shared form renderers/interactions, TSV export validation, dashboard maps, Node checks, and docs. Treat Doppler as deprecated/not collected while preserving the legacy column position; append v2 fields instead of reordering/removing v1 headers.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `HCE/hs_valme_hub/src/schema/hs_schema.js` | Modified | v2 headers, fields, IHS4 formula, dashboard maps. |
| `HCE/hs_valme_hub/src/form/shared_fields.js` | Modified | Clinical sections, conditional fields, fistula warning. |
| `HCE/hs_valme_hub/src/tsv/exporter.js` | Modified | v2 TSV row alignment/validation. |
| `HCE/hs_valme_hub/src/{patient,service}/` | Modified | Display/aggregate new v2 values. |
| `HCE/hs_valme_hub/tests/*.mjs` | Modified | Update parity, TSV, dashboard, scope checks. |
| `docs/CONTRATO_DATOS_HS.md`, `docs/ESTADO_IMPLEMENTACION_HS.md` | Modified | Document v2 migration and changed semantics. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing workbook header mismatch | Medium | Append v2 columns, document migration, warn on missing columns. |
| IHS4 totals change when `fd` exists | Medium | Document as clinical data-integrity correction; update tests/dashboards. |
| Scope creep into surgery/redesign | Medium | Keep Slice B/C explicitly excluded. |
| Review budget pressure | Low | Keep specs/tasks atomic; single PR only if under 400 changed lines. |

## Rollback Plan

Revert the Slice A commit(s), restore `HEADERS_HS_VERSION = 'v1'`, v1 tests/docs, and continue using the current workbook headers.

## Dependencies

- Clinician confirmation only if Hurley/refined Hurley/HSPGA values are included as structured fields.

## Success Criteria

- [ ] v2 TSV rows append new columns and preserve v1 order.
- [ ] IHS4 includes draining fistulas and warns on same-area `f + fd`.
- [ ] Build and all hub Node checks pass, including scope guard.
