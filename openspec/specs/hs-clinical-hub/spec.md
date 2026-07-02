# HS Clinical Hub — Modular Specification Index

## Purpose

This document indexes the modular OpenSpec requirements for the `hce-unified-clinical-tool` change. Each linked domain spec isolates one risk area for the Hub Clínico HS Valme. The modules together replace the prior compact spec.

## Domain specs

| Domain | File | Concern |
|---|---|---|
| hub-navigation | `specs/hub-navigation/spec.md` | Entry point, routing, module labels, base status, desktop-first navigation. |
| excel-data-workflow | `specs/excel-data-workflow/spec.md` | Manual Excel load, parsing, in-memory sharing, privacy, parse errors. |
| visit-registration | `specs/visit-registration/spec.md` | First/follow-up HS forms, schema alignment, TSV generation, copy action. |
| patient-dashboard | `specs/patient-dashboard/spec.md` | Patient search/selection and longitudinal individual dashboard. |
| service-dashboard | `specs/service-dashboard/spec.md` | Population/service dashboard and aggregate indicators. |
| deployment-resilience | `specs/deployment-resilience/spec.md` | GitHub Pages static deployment, vendored dependencies, icons, legacy transition. |

## Cross-cutting constraints

- HS only; nursing and PsO implementation are out of scope.
- No backend, no real local/cloud database, no committed patient data.
- `Base_Datos_HS_Valme.xlsx` remains the real cumulative database; clipboard/paste into the canonical workbook is the primary write path.
- No browser persistence of clinical form drafts or base data.
- Static/client-side, GitHub Pages friendly, desktop-first.

## Source decisions

This modular set implements the decisions recorded under Engram topic keys `sdd/hce-unified-clinical-tool/{write-path, pathology-scope, navigation, base-loading, draft-persistence, legacy-files, deployment-constraints, packaging, data-hosting, dependencies, icons, build-strategy, design-direction, spec-structure}`.
