# Visit Registration Specification

## Purpose

Define the HS medical visit forms (first and follow-up), schema alignment, validation, and the clipboard TSV export that remains the primary persistence path into the canonical Excel workbook.

## Scope

In scope: `Primera visita` and `Visita de seguimiento` forms, `Monográfica` and `Multidisciplinar` circuits, validation, TSV generation, clipboard copy.

Out of scope: nursing forms, PsO forms, in-browser Excel write, backend save, browser draft persistence.

## Requirements

### Requirement: First-visit form

The system MUST provide a `Primera visita` HS medical form that preserves the existing clinical wording from `hs_valme_formulario_clinico.html`.

#### Scenario: Open first visit

- GIVEN the user selects `Registrar visita` > `Primera visita`
- THEN the first-visit form renders with the existing field labels and order.

### Requirement: Follow-up form

The system MUST provide a `Visita de seguimiento` HS medical form that preserves the existing clinical wording.

#### Scenario: Open follow-up

- GIVEN the user selects `Registrar visita` > `Visita de seguimiento`
- THEN the follow-up form renders with the existing field labels and order.

### Requirement: Circuit selection

The system MUST let the user choose the `Monográfica` or `Multidisciplinar` circuit and MUST generate a TSV row aligned to the selected sheet schema.

#### Scenario: Monográfica export

- GIVEN a completed `Primera visita` with circuit `Monográfica`
- WHEN the user exports
- THEN the clipboard holds a one-row TSV matching the `Monografica` sheet schema.

### Requirement: Required field validation

The system MUST validate required fields before copying and MUST block export if validation fails.

#### Scenario: Validation blocks export

- GIVEN a form with a missing required field
- WHEN the user exports
- THEN export is blocked, an error is shown, and the clipboard is not modified.

### Requirement: Clipboard as primary write path

The system MUST copy the generated TSV to the clipboard as the primary persistence mechanism. Any file download MUST be secondary and clearly labeled.

#### Scenario: Primary clipboard path

- GIVEN a valid completed form
- WHEN the user copies the export
- THEN the clipboard contains a one-row TSV ready to paste into the canonical workbook.

### Requirement: No draft persistence

The system MUST NOT persist partially filled form data in browser storage or in-memory beyond the current page session; leaving or reloading the form MUST clear it.

#### Scenario: Reload clears form

- GIVEN a partially filled form
- WHEN the page reloads
- THEN the form is empty.

### Requirement: Pre-fill from loaded base

The system SHOULD pre-fill reference data, such as existing patient identifiers, when a base is loaded and a matching patient is selected.

#### Scenario: Pre-fill patient data

- GIVEN a loaded base and a selected patient
- WHEN the user opens `Registrar visita`
- THEN known reference fields are pre-filled.

## Cross-spec dependencies

- `hub-navigation` provides the `Registrar visita` route.
- `excel-data-workflow` supplies the loaded base for pre-fill and schema alignment.
- `patient-dashboard` may pass a selected patient to the form.
- `deployment-resilience` ensures no backend or persistent storage is used.
