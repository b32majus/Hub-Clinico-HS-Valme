# Design: Hub Clínico HS Valme

## Technical Approach

Single static, multi-file HS hub served from `HCE/hs_valme_hub/` (Vite-style src tree, built output in `HCE/hs_valme_hub/dist/`). One entry point (`index.html`), hash-based router, shared in-memory dataset, shared HS schema module, vendored runtime. Legacy HS HTML files remain in `HCE/` as parity sources until parity is verified, then marked `*.legacy.html` with a "use the hub" notice. Implements decisions under `sdd/hce-unified-clinical-tool/{pathology-scope, write-path, navigation, base-loading, draft-persistence, legacy-files, deployment-constraints, packaging, data-hosting, dependencies, icons, build-strategy, design-direction}`.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| App shape | Multi-file static hub (`HCE/hs_valme_hub/index.html` + ESM modules), Vite dev/ESM, static dist | Single self-contained HTML; SPA framework (React/Vue) | Source files stay maintainable and reviewable; static output fits GitHub Pages; avoids framework weight for a 4-route hub; matches `build-strategy` decision. |
| Router | Hash-based, no library | History API; router library | Works on GitHub Pages without rewrites; one in-memory state, no full reload, satisfies `Route without base reload`. |
| State container | Single `ValmeHS.store` (plain object + tiny pub/sub) | Redux/MobX/Zustand | No backend, no persistence; explicit, inspectable, no abstraction tax; mirrors reference-repo `HubTools` discipline. |
| Global namespace | `window.ValmeHS` with sub-modules `schema`, `store`, `excel`, `tsv`, `form`, `patient`, `service`, `chart`, `ui` | Per-file ESM only with no globals | Static multi-file ESM + a tiny global keeps the in-browser dependency graph honest and supports the legacy parity check. |
| Schema ownership | Hand-written `src/schema/hs_schema.js`, versioned `HEADERS_HS_VERSION = 'v1'` to match the form | Generated from YAML/JSON | Form already declares `v1`; hand-written is the smallest contract that can hold validators, derived metrics, severity buckets, and dashboard mappings. |
| Build tool | Vite (dev + build) | None; esbuild; Rollup | `build-strategy` decision; npm-lightweight, ESM-native, outputs plain static assets. |
| Dependencies | SheetJS Community (vendored), Chart.js (vendored), Lucide icons (vendored SVG sprite) | CDN at runtime; inline copies | `dependencies` and `icons` decisions; hospital network safety and offline operation. |
| Persistence | None (memory only); clipboard for primary write | localStorage draft, IndexedDB | `draft-persistence` and `data-hosting` decisions; spec forbids browser persistence. |
| Icon source | Local Lucide SVG sprite + curated inline SVGs for clinical glyphs | Font Awesome CDN; emoji | `icons` decision; renders offline; avoids icon-font licensing pitfalls. |
| Visuals | CSS custom properties design tokens in `src/ui/tokens.css`; premium/modern clinical palette | Tailwind; hand-rolled per page | Aligns with `design-direction` decision (premium/modern, high legibility, desktop-first); tokens are auditable and easy to revise. |
| Pathology switch | Not exposed; module registry allows future PsO fold-in | Add `pathology: 'hs' | 'pso'` switch now | `pathology-scope` and `psO timing` decisions; HsO first, switch added when a real PsO change arrives. |

## File Structure

```
HCE/
  hs_valme_hub/
    index.html                  # static entry point
    src/
      main.js                   # bootstrap: load schema, wire router, mount shell
      router.js                 # hash router + module registry
      store.js                  # ValmeHS.store (pub/sub, no persistence)
      schema/
        hs_schema.js            # SHEET_KEYS, COLUMNS, IHS-4, severity, PROMs, validators
      excel/
        loader.js               # SheetJS-based read of Monografica + Multidisciplinar
        validators.js           # column-presence + sheet-presence checks
      tsv/
        exporter.js             # buildTSV(circuit, payload) -> string
        clipboard.js            # copyToClipboard, fallback path
      form/
        primera_visita.js       # registers form module + view
        seguimiento.js          # registers form module + view
        shared_fields.js        # pre-fill helpers, validation glue
      patient/
        search.js
        longitudinal.js         # IHS-4, Tratamientos, Peso, PROMs, Cirugía, Comorbilidades
      service/
        kpis.js
        filters.js
        list.js
        export.js               # secondary CSV/TSV download
      chart/
        chart_adapter.js        # vendored Chart.js wrapper
        themes.js
      ui/
        tokens.css
        shell.css
        components.css
        icons/                  # vendored Lucide SVG sprite + curated SVGs
        img/                    # logos, illustrations (no patient data)
    vendor/
      xlsx.full.min.js          # SheetJS Community
      chart.umd.min.js          # Chart.js
      lucide-sprite.svg         # vendored icon sprite
    dist/                       # Vite build output; what GitHub Pages serves
  hs_valme_formulario_clinico.html        # legacy parity source (untouched)
  hs_valme_cuadro_mando_clinico.html      # legacy parity source (untouched)
  HS_consulta_enfermeria_HVR_2.html       # REFERENCE-ONLY (untouched, no nav link)
  Base_Datos_HS_Valme.xlsx                # real DB (user-supplied, never committed)
docs/
  CONTRATO_DATOS_HS.md          # schema contract for clinicians/developers
  ESTADO_IMPLEMENTACION_HS.md   # parity, limitations, next steps
```

OpenSpec `openspec/changes/hce-unified-clinical-tool/` already holds `proposal.md`, `exploration.md`, `specs/`. `design.md` lives at `openspec/changes/hce-unified-clinical-tool/design.md`.

## Data Flow

```
[ User picks Base_Datos_HS_Valme.xlsx ]
                |
                v
        excel/loader.js (SheetJS, vendored)
                |
                v
        store.setBase({ monografica:[], multidisciplinar:[], counts, version })
                |
                +--> patient/longitudinal.js  -->  chart_adapter.js --> canvas
                +--> service/kpis.js, list.js  -->  chart_adapter.js --> canvas
                +--> form/shared_fields.js     <--  pre-fill references
                +--> ui/shell (status indicator + counts)

[ User completes form, picks circuit ]
                |
                v
        form/*.js build payload --> schema validators
                |
                v
        tsv/exporter.js (one-row TSV aligned to COLUMNS[circuit])
                |
                v
        tsv/clipboard.js  -->  system clipboard
                |
        [ User pastes into Base_Datos_HS_Valme.xlsx > Monografica | Multidisciplinar ]
                |
                v
        [ User clicks "Cargar/actualizar base" again ] --> loader.js re-reads
                |
                v
        store replaces dataset; all subscribers re-render
```

All transitions are in-memory; no `localStorage`, no `sessionStorage`, no `IndexedDB`, no network.

## Shared HS Schema Ownership

`src/schema/hs_schema.js` is the single source of truth. It exports `SHEET_KEYS` (`monografica`, `multidisciplinar`), `COLUMNS[c]` (the column header order that the form's TSV must match and the dashboard must read), `REQUIRED[c]`, `VALIDATORS` (e.g. NUSHA pattern, date ISO, IHS-4 range 0–∞), `DERIVED` (IHS-4 total, severity buckets `leve|moderado|grave` from canonical thresholds), and `DASHBOARD_MAP` (which columns feed `Evolución IHS-4`, `Tratamientos`, `Peso`, `PROMs`, `Cirugía`, `Comorbilidades`). The form's `HEADERS_HS_VERSION` constant and the dashboard's read paths both import from this module. A version bump is a one-file change plus a parity check.

## Privacy / Security Model

- Repo and built assets contain zero patient data. `Base_Datos_HS_Valme.xlsx` is user-supplied at runtime and never copied into `dist/`. Synthetic demo fixtures (max 3 rows) are allowed only under `docs/demo/` and never built into `dist/`.
- No `localStorage`, `sessionStorage`, `IndexedDB`, or cookies. A reload or close clears all in-memory data and prompts to re-load the base.
- Clipboard is the primary write path. The export module shows the destination sheet name and a paste-into-Excel hint, and warns if the OS denies clipboard access. A secondary TSV/CSV download is allowed but must be clearly labelled "secundario" in the UI.
- No telemetry, no analytics, no external network calls from the hub. Critical dependencies (SheetJS, Chart.js, Lucide) are vendored under `vendor/`.
- `AGENTS.md` and `openspec/config.yaml` will explicitly classify `HCE/HS_consulta_enfermeria_HVR_2.html`, `Plantillas Historia Clinica HUV Rocio/`, and the two external repos as reference-only.

## Legacy Migration Plan

1. Treat `hs_valme_formulario_clinico.html` and `hs_valme_cuadro_mando_clinico.html` as parity references. Do not edit their clinical content.
2. Build the hub's form and dashboard modules to reproduce the same TSV row, the same KPIs, and the same per-patient sections. Run a side-by-side: identical base file, identical inputs, identical outputs.
3. Once parity is verified for a representative base (cover both sheets, edge cases: empty sheet, missing column, IHS-4 boundary), keep the legacy files as `*.legacy.html` with a banner redirecting to the hub entry point.
4. After a full release cycle, move the legacy files to `HCE/_legacy/` (still in repo, still reachable from `docs/ESTADO_IMPLEMENTACION_HS.md` for rollback).
5. Update `Guia_Operativa_HS_Valme.docx`, `AGENTS.md`, and `openspec/config.yaml` to point users at the hub.

## Dependency Strategy

| Library | Version pin | License | Source | Bundled as |
|---|---|---|---|---|
| SheetJS Community (xlsx) | 0.20.x | Apache-2.0 | npm, then `vendor/xlsx.full.min.js` | Static script tag in `index.html` |
| Chart.js | 4.x | MIT | npm, then `vendor/chart.umd.min.js` | Static script tag, used by `chart_adapter.js` |
| Lucide icons | latest | ISC | npm pack, then `vendor/lucide-sprite.svg` + curated SVGs in `src/ui/icons/` | Inline `<svg><use href="vendor/lucide-sprite.svg#name"/></svg>` |
| Vite (dev only) | 5.x | MIT | devDependency in `package.json` (new) | Not shipped to `dist/` |

No runtime CDN. All vendor files are part of the repo and the build output. Licensing is permissive (Apache-2.0 / MIT / ISC); full attribution in `vendor/THIRD_PARTY.md`.

## Manual Verification Strategy

No automated tests. Validation is artifact-based:

1. `npm run dev` (Vite) opens the hub at a local URL; visually confirm nav, base status, all four routes.
2. `npm run build` produces `HCE/hs_valme_hub/dist/`; serve with `python start_server.py` (port 8003); open `HCE/hs_valme_hub/dist/index.html`.
3. Load a representative `Base_Datos_HS_Valme.xlsx`; check that both `Monografica` and `Multidisciplinar` sheet counts are shown.
4. First-visit form: complete with valid data, pick `Monografica`, copy to clipboard, paste into the workbook's `Monografica` sheet, reload base, verify the row appears. Repeat for `Multidisciplinar`.
5. Patient dashboard: search an existing patient, confirm `Evolución IHS-4`, `Tratamientos`, `Peso`, `PROMs`, `Cirugía`, `Comorbilidades` match the legacy dashboard for the same input.
6. Service dashboard: confirm aggregate KPIs match the legacy dashboard for the same base.
7. Privacy checks: open DevTools → confirm `localStorage`, `sessionStorage`, `IndexedDB` are empty after a session. Reload page, confirm in-memory data is gone and the hub prompts to load the base.
8. Offline check: disable network in DevTools, reload, confirm parse, charts, and icons still work.
9. Parity diff: side-by-side comparison of hub TSV vs legacy TSV for at least three visits (first monográfica, first multidisciplinar, follow-up); cells must be byte-identical.
10. Scope guard: visually confirm there is no `Enfermería`, `Cura Post-Qx`, or `PsO` nav item or route.

## Risks, Mitigations, Open Questions

| Risk | Mitigation |
|---|---|
| Schema drift between form and dashboard | `hs_schema.js` is the single source; parity test in verification step 9. |
| Clipboard regression | Parity check on the TSV output; explicit "destination sheet" label on copy. |
| Scope creep into nursing/PsO | No nav items for them; CI-style grep check `grep -E "enfermer|cura|psO|pso" src/` returns zero route matches; documented in `AGENTS.md`. |
| Vendor licensing drift | Pin versions; record hashes in `vendor/THIRD_PARTY.md`. |
| Hospital network blocking the GitHub Pages host | Document manual "save dist locally and open `index.html`" fallback in `docs/ESTADO_IMPLEMENTACION_HS.md`. |
| Per-patient view needs a stable patient key across sheets | Schema reserves a `NUSHA` column aligned across both sheets; documented in `CONTRATO_DATOS_HS.md`. |
| Open Design mention drift into runtime dep | If Open Design is used, it stays in a separate `prototypes/` folder, never imported by `src/main.js`; documented in `AGENTS.md`. |
| 400-line review budget | Chain PRs: (1) schema + loader + shell; (2) form modules; (3) patient + service dashboards; (4) parity + docs. `ask-always` per session rule. |
| Performance with large bases | SheetJS read is the only parse path; keep derived metrics O(n) one pass; lazy render chart series. |
| Browser clipboard denial | Detect `navigator.clipboard.writeText` rejection; fall back to a textarea + select + `document.execCommand('copy')`, then show a manual-select hint. |

Open questions surfaced to the orchestrator:

- [ ] Confirm `NUSHA` is the canonical patient identifier across both sheets (open exploration Q1, Q4).
- [ ] Confirm `HEADERS_HS_VERSION` stays at `v1` for this change (open exploration Q2 — clipboard write path is settled as primary; the in-browser XLSX write path is deferred).
- [ ] Confirm professional/session gate stays out (open exploration Q8 — decision recorded as "no session gate for this change").
- [ ] Confirm legacy files become `*.legacy.html` (visible) vs move to `HCE/_legacy/` (hidden) as the post-parity step (open exploration Q5).
- [ ] Confirm Lucide vs another permissive icon set is acceptable (open exploration — adopting Lucide as default; orchestrator may swap if user prefers another permissive sprite).

## Non-Goals (binding)

- Nursing: no module, no nav item, no migration target, no rebrand of `HCE/HS_consulta_enfermeria_HVR_2.html`.
- PsO implementation: no PsO modules, no PsO sheets, no `pathology` switch. Architecture reserves the option for a future change.
- Backend, real local/cloud database, hosted patient data, automated syncing.
- Browser draft persistence (`localStorage`/`sessionStorage`/`IndexedDB`) of clinical forms.
- Mobile-first or tablet-first layout; desktop-first only.
- Runtime CDN dependency for any core function (icons, fonts, Excel parsing, charting).
- Vendoring, copying, or rebranding of the HS-Canarias or Badajoz repositories; reference-only.
