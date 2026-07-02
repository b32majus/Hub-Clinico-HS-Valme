# Delta for Severity and PROMs

## Purpose

Add EVA PROMs for pruritus, odor, and suppuration; correct the IHS4 formula to include draining fistulas; and show a soft warning when both regular and draining fistula are marked in the same region. Hurley, refined Hurley, and HSPGA are explicitly excluded from this change.

## ADDED Requirements

### Requirement: EVA PROMs beyond pain

The system MUST capture `eva_prurito`, `eva_olor`, and `eva_supuracion` as 0-10 integer scales and MUST export each value.

#### Scenario: PROM scales export

- GIVEN the user enters `5` for pruritus, `3` for odor, and `0` for suppuration
- WHEN the form is collected
- THEN the TSV row contains `5`, `3`, and `0` in the corresponding cells.

#### Scenario: PROM scale range enforced

- GIVEN the user enters a value outside 0-10
- WHEN validation runs
- THEN export is blocked for that field.

### Requirement: IHS4 draining-fistula weight

The system MUST calculate the clinical IHS4 score as `n + a*2 + (f + fd)*4`, where `fd` (draining fistula) counts with the same weight as `f`.

#### Scenario: Draining fistula counts

- GIVEN a region has `n=1`, `a=1`, `f=1`, `fd=1`
- WHEN the IHS4 score is derived
- THEN the contribution is `1 + 2 + (1+1)*4 = 11`.

#### Scenario: Existing visits with fd increase

- GIVEN a historical row with `fd > 0`
- WHEN the dashboard recalculates IHS4
- THEN the score uses the new formula and reflects the higher total.

### Requirement: Same-region fistula warning

The system MUST show a non-blocking warning when both `f` and `fd` are marked for the same anatomical region, to ask whether they represent the same lesion.

#### Scenario: Warning on overlapping fistulas

- GIVEN `ihs_axila_d_f` is `1` and `ihs_axila_d_fd` is `1`
- WHEN the form updates
- THEN a soft warning appears near the axilla region and export is not blocked.

#### Scenario: No warning with single fistula type

- GIVEN only `ihs_axila_d_f` is `1`
- WHEN the form updates
- THEN no overlapping-fistula warning is shown.

## REMOVED Requirements

### Requirement: IHS4 formula excluding draining fistulas

(Reason: The legacy formula `n + a*2 + f*4` ignored `fd`, contradicting clinical intent and the existing data contract wording.)
(Migration: Dashboards, KPIs, and tests MUST use `n + a*2 + (f + fd)*4`. Clinicians MUST be informed that historical IHS4 totals may increase when `fd` was recorded.)

## RENAMED Requirements

None.

## Explicit exclusions

- Hurley stage, refined Hurley, and HSPGA are NOT included in this change. They remain open questions for a future slice pending clinician-defined dropdown values and scoring rules.

## Cross-spec dependencies

- `schema-v2` adds `eva_prurito`, `eva_olor`, `eva_supuracion`, and updates `DERIVED.ihs4Score`.
- `dashboard-and-parity-impact` updates tests and dashboards that assert IHS4 totals.
