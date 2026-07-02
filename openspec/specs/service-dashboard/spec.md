# Service Dashboard Specification

## Purpose

Define the service/population dashboard (`Cuadro de mando`): aggregate indicators, filters, and lists derived from the in-memory HS base.

## Scope

In scope: KPIs, filters, patient lists, aggregate indicators, recalculation on base reload.

Out of scope: real-time analytics, cross-pathology population views, backend reporting, persistent filter state.

## Requirements

### Requirement: Population KPIs

The system MUST display aggregate indicators derived from the in-memory base, equivalent to those in `hs_valme_cuadro_mando_clinico.html`.

#### Scenario: KPIs render

- GIVEN a loaded base
- WHEN the user opens `Cuadro de mando`
- THEN aggregate indicators are displayed.

### Requirement: Filters

The system MUST provide filters that update the KPIs and the patient list.

#### Scenario: Filter population

- GIVEN a loaded base
- WHEN the user applies a filter
- THEN the KPIs and list update to match.

### Requirement: Patient list

The system MUST display a filtered patient list with key HS fields.

#### Scenario: List updates

- GIVEN a filter is applied
- WHEN the list renders
- THEN it contains only patients matching the filter.

### Requirement: Reload updates dashboard

The system MUST update the dashboard when the base is reloaded.

#### Scenario: Base reload refreshes KPIs

- GIVEN the dashboard is open with a loaded base
- WHEN the user loads a new workbook
- THEN KPIs and list reflect the new dataset.

### Requirement: Empty state without base

The system MUST show an empty state prompting base load when no base is loaded.

#### Scenario: No base

- GIVEN no base is loaded
- WHEN the user opens `Cuadro de mando`
- THEN an empty state prompts to load the base.

### Requirement: Secondary export

The system MAY allow exporting the filtered list as a secondary CSV/TSV download.

#### Scenario: Export list

- GIVEN a filtered list
- WHEN the user chooses export
- THEN a CSV/TSV file is generated from the in-memory data.

## Cross-spec dependencies

- `hub-navigation` provides the `Cuadro de mando` route.
- `excel-data-workflow` supplies the shared in-memory dataset.
- `patient-dashboard` shares patient selection concepts.
