# Proposal: Hub Clínico HS Valme

## Intent

Create one desktop-first HS clinical hub that replaces fragmented HS entry points with a single navigation, one manually loaded Excel base, shared schema expectations, and preserved clipboard/paste persistence into the canonical workbook.

## Scope

### In Scope
- HS-only hub with: Registrar visita, Ver paciente, Cuadro de mando, Cargar/actualizar base de datos.
- First-visit and follow-up HS medical forms, individual longitudinal dashboard, and service/population dashboard.
- Hub-level Excel load/parsing shared in memory across modules.
- Migration from existing HS form/dashboard as legacy sources after verification.

### Out of Scope / Disallowed
- Nursing: no module, nav item, migration target, rebrand, or database-coupled form from `HCE/HS_consulta_enfermeria_HVR_2.html`.
- PsO implementation in this change; architecture must not block later PsO integration.
- Real local/cloud database, backend, hosted patient data, or committed real patient data.
- Browser draft persistence for clinical form inputs.

## Capabilities

### New Capabilities
- `hs-clinical-hub`: HS hub navigation and module routing.
- `hs-excel-data-flow`: manual Excel loading, in-memory base sharing, clipboard primary write path, privacy rules.
- `hs-legacy-migration`: safe transition from existing HS standalone HTML files.

### Modified Capabilities
- None; no existing OpenSpec specs found.

## Approach

Build a GitHub Pages-friendly static multi-file app, likely with Vite or equivalent for development and static assets for production. Preserve clinical wording from the current HS form/dashboard. Use the Canarias/Badajoz hubs only as pattern inspiration for no-install delivery, easy navigation, and local-first operation. Vendor/bundle critical runtime dependencies and icons locally where licensing permits; avoid runtime CDN/icon-font reliance.

## Data, Privacy, and Architecture

- `Base_Datos_HS_Valme.xlsx` remains the real cumulative database.
- Users manually load the protected hospital Excel once per hub session.
- Generated Excel downloads, if any, are secondary exports only; clipboard/paste remains primary persistence.
- Unsaved clinical form data must not survive reload/leaving the form.
- GitHub Pages hosts only app code/assets; demo data, if used, must be synthetic and separated.
- Visual direction: premium modern clinical dashboard, high legibility, desktop-first.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `HCE/` | New/Modified | New HS hub app and shared assets/modules. |
| `HCE/hs_valme_formulario_clinico.html` | Migration source | Preserve clinical wording/schema behavior. |
| `HCE/hs_valme_cuadro_mando_clinico.html` | Migration source | Preserve dashboard KPIs/views. |
| `HCE/HS_consulta_enfermeria_HVR_2.html` | Reference only | Must remain non-functional for this change. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Schema drift | High | Define shared HS schema contract before UI migration. |
| Clipboard regression | Medium | Verify TSV output against canonical workbook before replacing entry points. |
| Scope creep into nursing/PsO | Medium | Keep explicit disallowed scope in specs/design/tasks. |
| Dependency blocking | Medium | Bundle/vendor critical assets locally. |

## Rollback Plan

Keep existing HS standalone files usable until the hub is verified. If validation fails, revert links/entry guidance to current HTML files and keep the new hub unpublished or clearly marked experimental.

## Dependencies

- Protected hospital Excel workbook loaded manually by the user.
- Locally bundled Excel/chart/icon dependencies where licensing permits.
- Manual browser validation via `python start_server.py`.

## Success Criteria

- [ ] One HS hub opens and exposes only approved modules.
- [ ] One loaded Excel base feeds all HS views in memory.
- [ ] Clipboard/paste output remains compatible with the canonical workbook.
- [ ] No real patient data, nursing module, backend, or draft persistence is introduced.
