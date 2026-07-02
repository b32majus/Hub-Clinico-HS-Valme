# Tasks: Hub Clínico HS Valme

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1500–2000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Scaffold, schema, store, router, shell, Excel loader, vendor | PR 1 | Foundation; ~350 lines |
| 2 | Visit forms (first + follow-up), TSV export, clipboard | PR 2 | Depends on PR 1; ~400 lines |
| 3 | Patient dashboard, service dashboard, chart adapter | PR 3 | Depends on PR 1; ~500 lines |
| 4 | Parity verification, docs, legacy transition | PR 4 | Depends on PR 2+3; ~250 lines |

## Phase 1: Foundation (PR 1)

- [x] 1.1 Create `HCE/hs_valme_hub/` with `package.json` (Vite 5.x devDep), `vite.config.js`, `index.html` entry with vendor `<script>` tags for SheetJS and Chart.js.
- [x] 1.2 Vendor dependencies: copy `xlsx.full.min.js`, `chart.umd.min.js`, `lucide-sprite.svg` into `vendor/`; create `vendor/THIRD_PARTY.md` with versions, licenses, hashes.
- [x] 1.3 Create `src/store.js` (`ValmeHS.store` pub/sub, no persistence) and `src/router.js` (hash router + module registry, HS-only routes).
- [x] 1.4 Create `src/schema/hs_schema.js` exporting `SHEET_KEYS`, `COLUMNS`, `REQUIRED`, `VALIDATORS`, `DERIVED`, `DASHBOARD_MAP`; set `HEADERS_HS_VERSION = 'v1'`; NUSHA as canonical patient key.
- [x] 1.5 Create `src/excel/loader.js` (SheetJS read of Monografica + Multidisciplinar) and `src/excel/validators.js` (sheet-presence + column-presence checks).
- [x] 1.6 Create `src/ui/tokens.css`, `shell.css`, `components.css` — premium/modern clinical design tokens, desktop-first layout.
- [x] 1.7 Create `src/main.js` bootstrap: wire schema, store, router, mount shell with nav (Registrar visita, Ver paciente, Cuadro de mando, Cargar/actualizar base) and base-status indicator. Add privacy/local-loading notice on home screen.
- [x] 1.8 **Verify PR 1**: `npm run dev` shows shell + nav + base-status; `npm run build` produces `dist/`; load test `.xlsx` and confirm sheet counts; offline check with DevTools network disabled.

## Phase 2: Visit Registration (PR 2)

- [x] 2.1 Create `src/tsv/exporter.js` (`buildTSV(circuit, payload)` aligned to `COLUMNS[circuit]`) and `src/tsv/clipboard.js` (clipboard API + textarea fallback).
- [x] 2.2 Create `src/form/shared_fields.js` with pre-fill helpers and validation glue consuming `hs_schema.js`.
- [x] 2.3 Create `src/form/primera_visita.js` — first-visit form preserving clinical wording from `hs_valme_formulario_clinico.html`; circuit selector; export button.
- [x] 2.4 Create `src/form/seguimiento.js` — follow-up form preserving clinical wording; same circuit/export pattern.
- [x] 2.5 **Verify PR 2**: `npm run build` passes; TSV export runtime check validates monografica/multidisciplinar row shape and required-field blocking. Manual paste/reload path documented in verification notes.

## Phase 3: Dashboards (PR 3)

- [ ] 3.1 Create `src/chart/chart_adapter.js` (vendored Chart.js wrapper) and `src/chart/themes.js` (design-token-aligned chart themes).
- [ ] 3.2 Create `src/patient/search.js` (search by NUSHA/name) and `src/patient/longitudinal.js` (sections: Evolución IHS-4, Tratamientos, Peso, PROMs, Cirugía, Comorbilidades).
- [ ] 3.3 Create `src/service/kpis.js` (aggregate indicators), `src/service/filters.js`, `src/service/list.js` (filtered patient list), `src/service/export.js` (secondary CSV/TSV labelled "secundario").
- [ ] 3.4 **Verify PR 3**: search patient → sections render and match legacy dashboard for same input. Cuadro de mando → KPIs match legacy. Reload base → dashboards recalculate. Empty state when no base/no patient.

## Phase 4: Parity, Docs, Legacy (PR 4)

- [ ] 4.1 Run parity diff: side-by-side hub TSV vs legacy TSV for ≥3 visits (first monográfica, first multidisciplinar, follow-up); cells byte-identical.
- [ ] 4.2 Create `docs/CONTRATO_DATOS_HS.md` (schema contract) and `docs/ESTADO_IMPLEMENTACION_HS.md` (parity status, limitations, offline fallback).
- [ ] 4.3 Update `AGENTS.md` and `openspec/config.yaml` — reference-only classification for nursing file, HUV Rocio templates, external repos.
- [ ] 4.4 Rename legacy files to `*.legacy.html` with banner redirecting to hub; document future move to `HCE/_legacy/`.
- [ ] 4.5 Scope guard: `grep -E "enfermer|cura|psO|pso" src/` returns zero route matches. Privacy guard: DevTools confirms no localStorage/sessionStorage/IndexedDB after session.
- [ ] 4.6 **Verify PR 4**: `npm run build` → serve `dist/` via `python start_server.py` → all four routes work offline; no nursing/PsO nav items visible.

## Non-Tasks / Exclusions

- No nursing module, nav item, or migration of `HS_consulta_enfermeria_HVR_2.html`.
- No PsO modules, sheets, or pathology switch.
- No backend, real DB, hosted patient data, or automated sync.
- No browser draft persistence (localStorage/sessionStorage/IndexedDB).
- No runtime CDN dependency for core functions.
- No mobile-first or tablet-first layout.
