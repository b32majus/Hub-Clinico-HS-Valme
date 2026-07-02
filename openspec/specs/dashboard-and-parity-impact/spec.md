# Delta for Dashboard and Parity Impact

## Purpose

Define the updates required in dashboards, Node checks, and public docs so that the v2 schema change is verifiable and does not break existing workflows.

## ADDED Requirements

### Requirement: Dashboard map updates

The system MUST update `DASHBOARD_MAP` to include the new v2 clinical columns (`eva_prurito`, `eva_olor`, `eva_supuracion`, `flares_total_ultimo_anio`, `flares_desde_ultima_visita`, `flares_requirio_*`, `nivel_educativo`, `edad_inicio`, `comorb_acne_conglobata`, `alcohol_ube_semana`, `fumador_estado`, `exfumador_anios`, `eco_hallazgos`) where relevant, and MUST remove `eco_doppler`.

#### Scenario: Patient dashboard shows new PROMs

- GIVEN a selected patient with v2 visits
- WHEN the PROMs section renders
- THEN `eva_prurito`, `eva_olor`, and `eva_supuracion` appear alongside `eva_dolor`.

#### Scenario: Service dashboard reflects v2 fields

- GIVEN the service dashboard loads a v2 base
- WHEN KPIs are computed
- THEN aggregates use the corrected IHS4 and the new comorbidity/PROM fields where applicable.

### Requirement: TSV export test update

The system MUST update `tests/tsv-export-check-node.mjs` to assert the v2 cell count per circuit and to validate the appended-column layout.

#### Scenario: v2 cell count passes

- GIVEN the schema is v2
- WHEN `node tests/tsv-export-check-node.mjs` runs
- THEN the test reports `PASS`.

### Requirement: Parity test update

The system MUST update `tests/parity-check-node.mjs` to acknowledge that v2 columns diverge from the legacy form and MUST assert that v1 columns still match byte-for-byte where unchanged.

#### Scenario: Parity test passes with documented divergence

- GIVEN the schema is v2
- WHEN `node tests/parity-check-node.mjs` runs
- THEN the test reports `PASS` and documents which columns are expected to differ.

### Requirement: Scope guard unchanged

The system MUST keep `tests/scope-guard-check-node.mjs` passing and MUST NOT introduce nursing or PsO routes or browser persistence APIs.

#### Scenario: Scope guard passes

- GIVEN the v2 changes are applied
- WHEN `node tests/scope-guard-check-node.mjs` runs
- THEN the test reports `PASS`.

## MODIFIED Requirements

### Requirement: Data contract documentation

The system MUST update `docs/CONTRATO_DATOS_HS.md` to document `HEADERS_HS_VERSION = 'v2'`, the appended-column rule, the new IHS4 formula, the removed `eco_doppler` column, and the new v2 fields.

(Previously: the contract documented `v1`, the old IHS4 formula, and `eco_doppler`.)

#### Scenario: Contract reflects v2

- GIVEN a reader opens `docs/CONTRATO_DATOS_HS.md`
- THEN sections 2.2, 7.1, 9, and 10 describe the v2 schema and the corrected IHS4 formula.

### Requirement: Implementation status documentation

The system MUST update `docs/ESTADO_IMPLEMENTACION_HS.md` to describe the v2 parity changes and the updated manual validation steps.

(Previously: the status document described v1 parity and the legacy checks.)

#### Scenario: Status doc reflects v2

- GIVEN a reader opens `docs/ESTADO_IMPLEMENTACION_HS.md`
- THEN the parity and manual-check sections mention v2 and the new PROM/ultrasound fields.

## Cross-spec dependencies

- `schema-v2`, `toxic-habits`, `severity-proms`, and `flares-demographics-ultrasound` supply the column and behavior changes that dashboards and docs must reflect.
- `patient-dashboard` and `service-dashboard` main specs govern the dashboard contracts that this delta extends.
- `excel-data-workflow` main spec governs base-loading validation that must tolerate v2 headers.
