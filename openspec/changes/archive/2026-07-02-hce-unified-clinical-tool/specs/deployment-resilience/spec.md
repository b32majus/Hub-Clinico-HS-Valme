# Deployment Resilience Specification

## Purpose

Define static deployment, dependency packaging, icon handling, offline resilience, and the legacy transition for the Hub Clínico HS Valme.

## Scope

In scope: GitHub Pages static delivery, vendored dependencies, local icons, offline operation, legacy file handling, scope documentation.

Out of scope: backend, database, runtime CDN dependency for core function, mobile-first design, nursing/PsO code.

## Requirements

### Requirement: Static GitHub Pages deployment

The system MUST be deployable as static files to GitHub Pages with no server-side processing.

#### Scenario: Deploy to GitHub Pages

- GIVEN the built static assets
- WHEN deployed to GitHub Pages
- THEN the hub loads and routes correctly.

### Requirement: Vendored critical dependencies

The system MUST bundle or vendor critical runtime dependencies (Excel parsing, charting, icons/fonts) locally where licensing permits.

#### Scenario: No CDN dependency for core functions

- GIVEN the network is disabled
- WHEN the user loads the hub, parses a base, or views a chart
- THEN core functions work without external requests.

### Requirement: Vendored icon library

The system MUST package the chosen icon library locally and MUST NOT load it from an external CDN at runtime.

#### Scenario: Icons render offline

- GIVEN the network is disabled
- WHEN the hub renders navigation icons
- THEN icons display correctly.

### Requirement: No patient data in repo or deployment

The system MUST NOT include real patient data in the repo, built assets, or GitHub Pages. Any demo data MUST be synthetic and clearly separated.

#### Scenario: Repo checkout contains no patient data

- GIVEN a fresh repository checkout
- THEN no files contain real patient-identifiable data.

### Requirement: Legacy transition

The system SHOULD keep legacy HS HTML files usable until the hub is verified, MUST preserve equivalent TSV and dashboard output, and MUST document excluded reference-only files and repos.

#### Scenario: Equivalent legacy output

- GIVEN the same visit data
- WHEN both the hub and `hs_valme_formulario_clinico.html` export
- THEN both TSV rows paste identically into the canonical workbook.

### Requirement: Reference-only documentation

The system MUST document in `AGENTS.md` and `openspec/config.yaml` that `HCE/HS_consulta_enfermeria_HVR_2.html`, `Plantillas Historia Clinica HUV Rocio/`, and the HS-Canarias and Badajoz repos are reference-only and not source-of-truth.

#### Scenario: Scope guard documented

- GIVEN a contributor reads `AGENTS.md`
- THEN the reference-only status of excluded files and repos is explicit.

### Requirement: Build command

The system SHOULD provide a lightweight build command (e.g., Vite) that produces the static assets for GitHub Pages.

#### Scenario: Build succeeds

- GIVEN source files
- WHEN the build command runs
- THEN static assets are emitted and core functions work offline.

## Cross-spec dependencies

- All other specs depend on this spec for static delivery and dependency packaging.
