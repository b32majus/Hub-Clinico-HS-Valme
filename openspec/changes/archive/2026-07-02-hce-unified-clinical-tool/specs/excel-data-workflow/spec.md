# Excel Data Workflow Specification

## Purpose

Define how the user manually loads the protected hospital Excel workbook, how the hub parses and shares it in memory, and the privacy rules that keep patient data out of browser storage and the repo.

## Scope

In scope: file selection, sheet parsing (`Monografica`, `Multidisciplinar`), parse-error handling, in-memory dataset sharing, reload, privacy.

Out of scope: automatic base download, server upload, cloud sync, writing back to the Excel file, bundled demo patient data.

## Requirements

### Requirement: Manual base load

The system MUST let the user manually select `Base_Datos_HS_Valme.xlsx` from the local hospital computer through a single hub-level file input.

#### Scenario: Load base

- GIVEN no base is loaded
- WHEN the user selects the protected workbook
- THEN the system parses it and shares the rows in memory.

### Requirement: Expected sheets

The system MUST parse the `Monografica` and `Multidisciplinar` sheets and MUST report an explicit error if either sheet is missing.

#### Scenario: Missing sheet

- GIVEN a workbook without `Multidisciplinar`
- WHEN the user loads it
- THEN an error message is shown and no stale data remains in memory.

### Requirement: Parse errors

The system MUST report parse errors in plain language without logging or exposing patient-identifiable data.

#### Scenario: Corrupt file

- GIVEN a corrupted workbook
- WHEN the user loads it
- THEN an error is displayed and the previous in-memory dataset, if any, is cleared.

### Requirement: In-memory-only dataset

The system MUST keep parsed rows in runtime memory only. It MUST NOT write rows to `localStorage`, `sessionStorage`, `IndexedDB`, cookies, or the repo.

#### Scenario: Page reload clears data

- GIVEN a loaded base
- WHEN the page reloads
- THEN the dataset is gone and the hub prompts to load the base again.

### Requirement: Shared dataset across modules

The system MUST make the same parsed dataset available to `Registrar visita`, `Ver paciente`, and `Cuadro de mando` without requiring each module to reload the file.

#### Scenario: Shared read

- GIVEN a loaded base
- WHEN the user opens `Ver paciente`
- THEN the dashboard reads the same rows loaded at hub level.

### Requirement: Reload base

The system MUST allow the user to load a new file, replacing the previous in-memory dataset.

#### Scenario: Replace base

- GIVEN a loaded base
- WHEN the user selects a different workbook
- THEN the new dataset replaces the old one everywhere.

### Requirement: Column validation

The system SHOULD validate that required columns defined by the shared HS schema are present and SHOULD list any missing columns.

#### Scenario: Schema mismatch

- GIVEN a workbook missing a required column
- WHEN the user loads it
- THEN the hub warns which columns are missing.

## Cross-spec dependencies

- `hub-navigation` displays load status and triggers reload.
- `visit-registration`, `patient-dashboard`, and `service-dashboard` consume the shared dataset.
- `deployment-resilience` ensures no backend or persistent storage is used.
