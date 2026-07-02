# Patient Dashboard Specification

## Purpose

Define the individual patient dashboard (`Ver paciente`): patient search/selection and the longitudinal visualization of HS clinical data from the in-memory base.

## Scope

In scope: patient search, patient selection, longitudinal sections: Evolución IHS-4, Tratamientos, Peso, PROMs, Cirugía, Comorbilidades.

Out of scope: editing visits, writing back to Excel, cross-pathology views, backend queries.

## Requirements

### Requirement: Patient search

The system MUST provide search over the in-memory base to find patients by identifier or name.

#### Scenario: Search filters patients

- GIVEN a loaded base
- WHEN the user types a search term
- THEN the list shows only matching patients.

### Requirement: Patient selection

The system MUST let the user select one patient and MUST display that patient's longitudinal dashboard.

#### Scenario: View patient

- GIVEN a loaded base and a selected patient
- WHEN the dashboard opens
- THEN longitudinal sections render from the in-memory rows.

### Requirement: Longitudinal sections

The system MUST display the sections Evolución IHS-4, Tratamientos, Peso, PROMs, Cirugía, and Comorbilidades, preserving the existing section names.

#### Scenario: Sections render

- GIVEN a selected patient with historical visits
- WHEN the dashboard loads
- THEN each section shows the relevant data and trends.

### Requirement: Recalculation on reload

The system MUST recalculate the dashboard when the base is reloaded.

#### Scenario: New data reflected

- GIVEN a patient dashboard is open
- WHEN the user reloads the base with new rows
- THEN the dashboard reflects the updated data.

### Requirement: Empty state

The system MUST show a clear empty state when the selected patient has no visits in the loaded base.

#### Scenario: No visits

- GIVEN a selected patient with no rows
- WHEN the dashboard opens
- THEN an empty-state message is shown.

### Requirement: No browser storage

The system MUST NOT store selected patient or dashboard data in browser storage.

#### Scenario: Reload clears selection

- GIVEN a patient is selected
- WHEN the page reloads
- THEN no patient is selected and the dashboard is empty.

## Cross-spec dependencies

- `hub-navigation` provides the `Ver paciente` route and base-status indicator.
- `excel-data-workflow` supplies the shared in-memory dataset.
- `service-dashboard` may share filter patterns.
