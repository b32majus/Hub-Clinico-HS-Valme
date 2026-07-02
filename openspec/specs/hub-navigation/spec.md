# Hub Navigation Specification

## Purpose

Define the static entry point, desktop-first navigation, module routing, and base-loaded status for the Hub Clínico HS Valme. This spec isolates navigation risk from data and clinical-content specs.

## Scope

In scope: home/entry screen, approved module labels, routing between modules, base-status indicator, desktop-first layout.

Out of scope: nursing navigation, PsO pathology switch, professional/session gate, backend authentication.

## Requirements

### Requirement: Single static entry point

The system MUST provide a single static HTML entry point for the HS hub, deployable on GitHub Pages, that loads without server-side processing.

#### Scenario: Entry point loads

- GIVEN the hub URL is opened
- THEN the entry point renders and shows navigation.

### Requirement: Approved module navigation

The system MUST display navigation for `Registrar visita`, `Ver paciente`, `Cuadro de mando`, and `Cargar/actualizar base de datos`, preserving the existing module labels.

#### Scenario: Approved navigation visible

- GIVEN the hub is open
- THEN only the approved HS modules and the load-base affordance are visible.

### Requirement: No nursing navigation

The system MUST NOT display any nursing, multidisciplinary-nursing, or cure-post-Qx module or navigation item.

#### Scenario: Nursing absent

- GIVEN the hub is open
- THEN no `Enfermería`, `Cura Post-Qx`, or nursing-related nav item is present.

### Requirement: Route without base reload

The system MUST route between modules without a full browser reload that would discard the in-memory loaded base.

#### Scenario: Route preserves base

- GIVEN a base is loaded
- WHEN the user selects `Ver paciente`
- THEN the same in-memory dataset is available in the new view.

### Requirement: Base-loaded status indicator

The system MUST display whether a base is loaded and MUST show the parsed sheet row counts for `Monografica` and `Multidisciplinar`.

#### Scenario: Status reflects load

- GIVEN the user loads `Base_Datos_HS_Valme.xlsx`
- THEN the status indicator shows loaded and the sheet row counts.

### Requirement: Desktop-first layout

The system MUST be optimized for desktop monitors; tablet adaptation is allowed, and mobile-specific layouts are not required.

#### Scenario: Desktop use

- GIVEN a desktop browser
- WHEN the hub is opened
- THEN the layout remains usable at standard desktop resolutions.

## Cross-spec dependencies

- `excel-data-workflow` supplies the loaded-state events and row counts.
- `visit-registration`, `patient-dashboard`, and `service-dashboard` are the route targets.
- `deployment-resilience` governs the static entry point and GitHub Pages constraints.
