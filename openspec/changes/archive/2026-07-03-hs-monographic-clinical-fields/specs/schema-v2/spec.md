# Delta for HS Schema v2

## Purpose

Define the `HEADERS_HS_VERSION` bump to `v2`, the appended-column rule for new monographic fields, the new `comorb_acne_conglobata` and `cuero_cabelludo` region columns, and the removal of `eco_doppler` from the canonical schema.

## ADDED Requirements

### Requirement: Schema version bump

The system MUST set `HEADERS_HS_VERSION` to `'v2'` because the canonical monographic/multidisciplinary column set changes.

#### Scenario: Version constant is v2

- GIVEN the schema source of truth is loaded
- THEN `HEADERS_HS_VERSION` equals `'v2'`.

### Requirement: Append-only column placement

The system MUST preserve the existing v1 column order and meaning and MUST append all new v2 columns after the last v1 column.

#### Scenario: v1 prefix is unchanged

- GIVEN the v1 column list up to `eco_doppler`
- WHEN `buildHeadersHS()` runs
- THEN the columns from `nusha` through the v1 block appear in the same relative order as in v1.

#### Scenario: New columns append after v1

- GIVEN the v1 column list
- WHEN `buildHeadersHS()` runs
- THEN every new v2 column appears after the last v1 column and before any `seguimiento_*` tail that existed in v1.

### Requirement: New comorbidity column

The system MUST add `comorb_acne_conglobata` to the comorbidity block in `buildHeadersHS()`.

#### Scenario: Acne conglobata column exists

- GIVEN a generated TSV row for either circuit
- THEN the row contains a `comorb_acne_conglobata` cell.

### Requirement: Scalp region columns

The system MUST add `cuero_cabelludo` as an additional IHS region with the four lesion counter columns (`ihs_cuero_cabelludo_n`, `ihs_cuero_cabelludo_a`, `ihs_cuero_cabelludo_f`, `ihs_cuero_cabelludo_fd`) and MUST include it in regional totals.

#### Scenario: Scalp counters exist

- GIVEN the IHS region list
- THEN `cuero_cabelludo` is present and its counters appear in the header list.

## MODIFIED Requirements

### Requirement: Ultrasound schema columns

The system MUST remove the `eco_doppler` column from the canonical header list and MUST add `eco_hallazgos` as an open-text findings column.

(Previously: ultrasound columns ended with `eco_doppler` and had no findings text field.)

#### Scenario: Doppler column removed

- GIVEN `buildHeadersHS()` returns the v2 list
- THEN `eco_doppler` is absent.

#### Scenario: Findings column added

- GIVEN `buildHeadersHS()` returns the v2 list
- THEN `eco_hallazgos` is present after the remaining ultrasound columns.

## REMOVED Requirements

### Requirement: `eco_doppler` collection

(Reason: Doppler is no longer collected because it does not add clinical value in the current workflow.)
(Migration: Existing rows that already contain `eco_doppler` values remain readable; the column is simply not emitted in new TSV rows. Dashboards MUST NOT depend on new `eco_doppler` values.)

## Cross-spec dependencies

- `toxic-habits`, `severity-proms`, and `flares-demographics-ultrasound` supply the behavioral rules for the new v2 columns.
- `excel-data-workflow` validates that loaded workbooks contain the v2 headers.
- `dashboard-and-parity-impact` updates consumers of the new and removed columns.
