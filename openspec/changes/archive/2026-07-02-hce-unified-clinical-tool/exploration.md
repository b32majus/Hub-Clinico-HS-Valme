# Exploration: HCE Unified Clinical Tool (HS + PsO)

> **Scope discipline note (read first).** Files under `HCE/` and elsewhere in this workspace that originate from another hospital or pathology circuit are **reference-only** and are **NOT** part of the Valme HS project. They must not be embedded, rebranded, database-coupled, schema-extracted, or otherwise treated as source-of-truth functional artifacts. `HCE/HS_consulta_enfermeria_HVR_2.html` was used as a design reference at the start of the work and then explicitly excluded.
>
> **Nursing is fully out of scope (binding clarification).** The Valme HS unified app covers the actual HS medical form and the actual HS dashboard only. **Nursing — including any multidisciplinary nursing consultation, cure post-Qx, or any nursing-led screen — is NOT in scope for this change, NOT in scope for the Valme HS app's product scope, and NOT to be added in a follow-up under this change.** If a real, in-scope Valme HS nursing or multidisciplinary form is ever required, it MUST be opened as a separate, explicitly named SDD change with its own requirements gathering, schema, and base coupling. This exploration does not assume or propose such a change. Future contributors must not re-introduce a nursing screen or a "Multidisciplinar" nursing circuit under this change's umbrella.
>
> **External repositories are reference-only, not source-of-truth.** The following public repos are listed as architectural and product inspiration only. They are not dependencies, not vendored libraries, and not clinical-content sources. Their clinical wording, schema, and base files must NOT be copied, rebranded, or schema-extracted into the Valme HS app. The only artifacts that may be reused from them are the *abstract* product/architecture patterns explicitly called out in the "Reusable product/architecture inspiration" section below, and only after they are validated against Valme clinical and operational requirements:
> - `https://github.com/b32majus/Hub-Clinico-HS-Canarias` — HS-only hub (HUC), local-first, session-gated, single pathology.
> - `https://github.com/b32majus/Hub-Clinico-Badajoz` — multi-pathology reuma hub (Badajoz), local-first, multi-pathology (`ESPA`, `APS`, `AR`), shared `Hub_Clinico_Maestro.xlsx`.

## Current State

The `HCE/` directory hosts an artifact-oriented clinical toolset for the Valme care-improvement workspace. Each tool is a standalone HTML file (or DOCX) that operates against a local Excel "base" file via clipboard or in-browser parsing. There is no backend, no shared module, and no single entry point.

### In-scope HS circuit (`HCE/`)

| File | Role | Database coupling | Lines |
|---|---|---|---|
| `hs_valme_formulario_clinico.html` | Medical/derma HS form (primera + seguimiento; Monografica + Multidisciplinar circuits) | Reads `Base_Datos_HS_Valme.xlsx` via a hand-rolled XLSX/CSV parser; exports TSV to clipboard, user pastes into the right sheet | 4,109 |
| `hs_valme_cuadro_mando_clinico.html` | HS dashboard: Gestion (population) + Seguimiento (per-patient) views | Reads `Base_Datos_HS_Valme.xlsx` via SheetJS, requires sheets `Monografica` and `Multidisciplinar`; writes filtered CSV; localStorage cache `hs_valme_dashboard_cache`; URL hash routing | 2,632 |
| `Base_Datos_HS_Valme.xlsx` | Shared base; sheets `Monografica`, `Multidisciplinar` | Schema labelled `HEADERS_HS_VERSION = 'v1'` in the form | binary |
| `Guia_Operativa_HS_Valme.docx` | Operational guide | n/a | binary |

### Out of scope (reference-only — must NOT be pulled into the unified app)

| File / folder | Origin | Why excluded |
|---|---|---|
| `HCE/HS_consulta_enfermeria_HVR_2.html` | Hospital Universitario Virgen del Rocio (HUVR), nursing consultation form (Primera Visita, Seguimiento, Cura Post-Qx) | Used at the start of the work as a design reference only. The user has explicitly confirmed it is **not** part of the Valme HS project. It still ships HUVR branding, references a HUVR base, and is a HUVR adaptation, not a Valme deliverable. The unified HS app must not embed, rebrand, schema-extract, or database-couple it. |
| `Plantillas Historia Clinica HUV Rocio/` | HUVR clinical-history reference templates | Reference templates for the HUVR lineage. They are not Valme deliverables. Do not edit, do not extend, do not import into the unified app. |
| Any HS nursing, cure post-Qx, or multidisciplinary-nursing screen | Not present in `HCE/` as a Valme deliverable | Nursing is fully out of scope (see binding clarification above). If a real Valme HS nursing form is ever needed, it is a separate change. |

### PsO circuit (`HCE/PsO/`) — analysis only, out of this change's scope

| File | Role | Database coupling | Lines |
|---|---|---|---|
| `formulario_psoriasis_valme.html` | Psoriasis form (primera / seguimiento; circuito `multidisciplinar_derma_reuma`) | Reads `Base Datos_PsO_Valme.xlsx` for NUSHA existence and pre-fill; custom XLSX/CSV parser; CSV download | ~2,637 |
| `Cuadro_Mando_Psoriasis_Valme_v1.html` | Psoriasis dashboard v1 (Gestion + Paciente modules) | Reads base via JSZip+custom XLSX parser; localStorage cache `pso_valme_dashboard_cache`; JSZip-based XLSX export | ~2,500 |
| `Cuadro_Mando_Psoriasis_Valme_v2.html` | Psoriasis dashboard v2 (Gestion + Paciente modules) | Same architecture as v1, kept side-by-side | ~2,751 |
| `Base Datos_PsO_Valme.xlsx` | Active PsO base | n/a | binary |
| `Base Datos_PsO_Valme_demo.csv` | Demo dataset | n/a | text |
| `psoriasis_valme_base_longitudinal.xlsx` | Separate longitudinal base (parallel to the main PsO base) | n/a | binary |
| `Guia_Operativa_Psoriasis_Valme.docx` | Operational guide | n/a | binary |

### How the in-scope pieces interoperate today

```
hs_valme_formulario_clinico.html
   |  (clipboard TSV)
   v
[ User pastes into Base_Datos_HS_Valme.xlsx > Monografica | Multidisciplinar ]
   ^
   |  (SheetJS / xlsx.full.min.js)
hs_valme_cuadro_mando_clinico.html
   - circuit screen -> dashboard Gestion | Seguimiento
   - per-patient: Evolucion IHS-4 | Tratamientos | Peso | PROMs | Cirugia | Comorbilidades
```

The same pattern exists for PsO (form -> manual paste into `Psoriasis_Filtrado` -> dashboard). The PsO dashboards use JSZip-based XLSX write instead of clipboard.

### Pain points and observable gaps (re-assessed after excluding the nursing form)

1. **Two HS data models, zero shared schema module.** The medical form's TSV columns and the dashboard's expected columns (read by SheetJS) are not aligned. The unification target is now a two-screen shell, not a three-screen shell.
2. **Two parallel PsO dashboards** (`v1` and `v2`) are live in the same folder. Same for two parallel PsO bases (`Base Datos_PsO_Valme.xlsx` vs `psoriasis_valme_base_longitudinal.xlsx`).
3. **Clipboard as the only write path.** The HS form relies on a user manually pasting TSV into the right Excel sheet. There is no in-browser round-trip to the base.
4. **Two different XLSX parsers in production** (down from three). Hand-rolled zip parser in `hs_valme_formulario_clinico.html`, SheetJS in `hs_valme_cuadro_mando_clinico.html`. Neither shares code with the PsO path.
5. **No unified navigation.** A user moves between form and dashboard by opening two different HTML files and reloading the base each time. URL routing is only present in the HS dashboard.
6. **Schema versioning is implicit.** Only the HS form declares `HEADERS_HS_VERSION = 'v1'`. The dashboard does not version its column expectations.
7. **Mixed libraries and CDNs.** HS form: no SheetJS, just DOMParser + zip. HS dashboard: SheetJS + Chart.js. PsO dashboards: JSZip + custom parser. PsO form: DOMParser + zip.
8. **Scope discipline risk** (new). Reference files (HUVR-originated nursing form, HUVR clinical-history templates) live inside or next to the in-scope `HCE/` folder. Future contributors may mistake them for in-scope artifacts. The unified app must keep an explicit allow-list.
9. **No single entry point.** A user opening `HCE/` has no obvious "start here" file. The Valme workspace has a `start_server.py` (serves at `http://127.0.0.1:8003/`) but no hub / index page in `HCE/`.

## Affected Areas

In scope:

- `HCE/hs_valme_formulario_clinico.html` — flagship HS form, must stay source of truth for medical schema.
- `HCE/hs_valme_cuadro_mando_clinico.html` — flagship HS dashboard, must stay source of truth for KPIs and per-patient visualisation.
- `HCE/Base_Datos_HS_Valme.xlsx` — shared HS base; sheets `Monografica`, `Multidisciplinar`.
- `HCE/Guia_Operativa_HS_Valme.docx` — operational guide; should describe unified flow if it changes.
- `HCE/PsO/formulario_psoriasis_valme.html` — PsO form (analysis only, not in this change's scope unless the user asks).
- `HCE/PsO/Cuadro_Mando_Psoriasis_Valme_v1.html` and `_v2.html` — parallel PsO dashboards; one needs to be retired before any PsO fold-in.
- `HCE/PsO/Base Datos_PsO_Valme.xlsx`, `HCE/PsO/Base Datos_PsO_Valme_demo.csv`, `HCE/PsO/psoriasis_valme_base_longitudinal.xlsx` — three PsO bases; one canonical base should remain.
- `HCE/PsO/Guia_Operativa_Psoriasis_Valme.docx` — operational guide.
- `openspec/config.yaml` — needs updated `conventions.structure` if HCE/ layout changes.
- `AGENTS.md` — needs updated validation guidance if the unified tool changes the build/preview flow.

Out of scope (reference-only — DO NOT modify as part of this change):

- `HCE/HS_consulta_enfermeria_HVR_2.html` — HUVR nursing form, reference-only.
- `Plantillas Historia Clinica HUV Rocio/` — HUVR reference templates, reference-only.
- Any new nursing or multidisciplinary-nursing file under `HCE/` — nursing is fully out of scope.
- The two external GitHub repos (HS-Canarias, Badajoz) — reference-only; not vendored, not a dependency, not copied.

## External Reference Repositories (architectural inspiration only)

The user pointed to two public repos by the same author (`b32majus`) as architectural inspiration. Both are local-first, no-backend, static-HTML clinical hubs with the same Excel-clipboard persistence model the Valme HS app already uses. Neither is a dependency, neither is vendored, and neither is a source of clinical content for Valme.

| Repo | Pathology focus | Stack | Entry pattern | Form/dashboard separation | Module shape |
|---|---|---|---|---|---|
| `b32majus/Hub-Clinico-HS-Canarias` | HS only (CIE-10 L73.2) | Vanilla JS, no build, vendor folder, SheetJS + Chart.js + Font Awesome, `sessionStorage` cache | Session gate at `index.html` (load BD -> pick professional -> enter hub) | `index.html` (hub + search + quick view), `primera_visita.html`, `seguimiento.html`, `dashboard_paciente.html`, `estadisticas.html`, `manage_drugs.html`, `manage_professionals.html` | Global `HubTools` namespace with sub-namespaces: `form`, `scoresHS`, `data`, `export`, `normalizer`, `utils`; per-page scripts in `scripts/`; functional modules in `modules/` |
| `b32majus/Hub-Clinico-Badajoz` | Multi-pathology reuma (`ESPA`, `APS`, `AR`) | Same shape as HS-Canarias but with `localStorage` cache (persistent across tabs in a session) | `index.html` is the main dashboard + quick view; no professional gate | `index.html`, `primera_visita.html`, `seguimiento.html`, `dashboard_paciente.html`, `dashboard_search.html`, `estadisticas.html`, `manage_drugs.html`, `manage_professionals.html` | Same `HubTools` namespace; per-pathology adaptation in `form`; multi-pathology codification rules in the data contract |

### Reusable product/architecture inspiration (validated patterns, not copied code)

These are *abstract* patterns the Valme HS app can evaluate as a design option. None of the code, schema, or wording from either repo is to be copied. Each pattern must be re-validated against Valme clinical, operational, and IT requirements before adoption.

1. **Single entry-point pattern (hub shell with session gate).** HS-Canarias gates the whole app behind `index.html`: pick BD, pick professional, enter. The Valme HS shell could follow the same "one URL, one decision, then everything" pattern. *Adaptation needed:* Valme does not yet have a professional-selection screen, and the user has not asked for one. Treat the session gate as optional and pull it in only if it is asked for.
2. **Pathology hub pattern (Badajoz).** Multi-pathology, single entry point, per-pathology sheets in one master Excel. This is the *only* credible source of a "pathology switch" idea, and the Valme HS app could grow into a "pathology: 'hs' | 'pso'" switch without changing the in-scope HS content. *Adaptation needed:* The Valme HS form/dashboard have different field shapes from PsO; a future fold-in must go through the schema module first.
3. **Dashboard/form separation pattern.** Both repos keep "form" pages (primera, seguimiento) and "dashboard" pages (paciente, estadisticas) as separate HTML files behind a shared sidebar. The Valme HS shell should follow the same separation rather than collapsing the form and dashboard into one screen, because the schemas are different and the verification paths are different.
4. **Sidebar + DB-status indicator pattern.** HS-Canarias uses a left sidebar with nav sections ("Consulta", "Gestión") and a bottom DB-status indicator that doubles as the "load/reload BD" affordance. The Valme HS shell should expose a single "Cargar base" affordance, and the sidebar should host the `Formulario | Dashboard` nav only (no nursing tab, per the binding clarification).
5. **Single per-pathology sheet, multiple visit rows.** HS-Canarias collapses "primera + seguimiento" into a single sheet `HS`, with a `Tipo_Visita` column. Valme currently has two sheets (`Monografica`, `Multidisciplinar`). This is a *contrasting* model, not a copied one: if a future spec wants to consolidate Valme's two sheets, it must come from a Valme clinical decision, not from copying HS-Canarias.
6. **Dual export pattern (TXT for clinical history, TSV/CSV for DB).** Both repos export a human-readable clinical note AND a one-row structured export. The Valme HS form already does the TSV path; a TXT path is a future enhancement and is *not* a copied artifact.
7. **Vendor-folder discipline.** Both repos keep third-party libraries (`SheetJS`, `Chart.js`, `Font Awesome`) inside a `vendor/` folder and ship `?v=` cache-busters. The Valme HS shell should follow the same vendor-folder discipline when it consolidates CDNs, to keep the no-backend, no-CDN production path honest.
8. **Module namespace pattern.** Both repos use a single global namespace (`HubTools`) and per-page scripts that hang modules off it. The Valme HS shell could expose a similar `ValmeHS` (or neutral) namespace for the schema module, base loader, and per-screen controllers, so the in-browser globals stay minimal and explicit.
9. **Contract of data + estado de implementacion docs.** Both repos keep a `docs/CONTRATO_DATOS_*.md` and a `docs/ESTADO_IMPLEMENTACION*.md` alongside the code. The Valme HS shell should grow a `docs/CONTRATO_DATOS_HS.md` and a `docs/ESTADO_IMPLEMENTACION_HS.md` (or extend the existing `Guia_Operativa_HS_Valme.docx`) to keep the schema contract and the implementation status close to the code.
10. **What NOT to copy.** No professional gate, no `Hub_Clinico_*` branding, no `Tipo_Visita` column, no 195-column export, no `localStorage`/Excel-paste coupling, no "homúnculo" widget, no reuma pathology, no "Cura Post-Qx" circuit, no nursing form. These are HS-Canarias / Badajoz specifics, not Valme HS deliverables.

## Approaches

### A. Single HS app shell with form + dashboard (no nursing view)

A new top-level file `HCE/hs_valme_app.html` (or `HCE/hs_valme/index.html`) that embeds the HS medical form and the HS dashboard as routed views with a shared schema, shared base loader, and shared state. PsO remains a parallel pair of files. The HUVR nursing form is explicitly excluded from the shell and from any downstream coupling. Nursing is out of scope for this change and for the Valme HS app product scope (see binding clarification).

- Pros: focused scope (two screens, not three); one entry point for HS; shared schema fixes the form-vs-dashboard drift directly; lower risk; no scope creep onto reference files; preserves clinical wording for PsO verbatim; aligns with the "single entry-point pattern" and "dashboard/form separation pattern" from the reference repos without copying them.
- Cons: leaves the duplication problem unsolved across HS<->PsO; user still opens two apps to switch pathology; a future nursing requirement (if it ever arises) is not pre-served by this architecture — that is a deliberate trade-off per the user's clarification.
- Effort: Low-Medium.

### B. Single pathology-agnostic app with `pathology: 'hs' | 'pso'` switch

One `HCE/clinical_app.html` that loads a `pathology` config (drives sheet names, fields, KPIs, charts, follow-up clinical wording). Today, the field shapes differ enough (HS: IHS-4, Hurley, monografica/multidisciplinar sheets; PsO: PASI/BSA, comorb flags, single sheet) that the switch must cover a configuration object, not just a label.

- Pros: one entry point for both pathologies; shared base loader, shared routing, shared export logic; one place to fix the schema-drift risk; easier to add a third pathology later; aligns with the "pathology hub pattern" from the Badajoz reference repo.
- Cons: forces a shared abstraction; HCE and PsO clinical wording, layouts, and metric definitions will need to live side by side; bigger blast radius if something regresses; must avoid the trap of generic-looking data fields that lose clinical specificity.
- Effort: High.

### C. Keep separate apps, but enforce one schema module per pathology

Refactor each pathology into a two-file pair: (1) a `*_schema.js` that declares sheet names, columns, field types, IHS-4/PASI calculators; (2) an HTML shell that imports it. No cross-pathology app merge. v1/v2 PsO dashboards and the longitudinal PsO base are retired down to one each.

- Pros: minimal disruption; preserves clinical wording and per-pathology ownership; lays groundwork for a future merge.
- Cons: does not give the user the "navigate from form to dashboard to per-patient view in one place" experience the user is asking for; HS still has two HTML files, only the schema is shared.
- Effort: Low-Medium.

### D. Hybrid: HS unified app (form + dashboard) now, PsO fold-in later

Ship Approach A for HS first (single shell, one nav, one base loader, one schema, form + dashboard only), then in a follow-up change fold PsO into the same shell using the abstraction discipline from Approach B without rewriting HS. The HS shell is built pathology-agnostic from day one to make the PsO fold-in cheap. The HUVR nursing form is not part of either step. Nursing is not part of either step (binding clarification).

- Pros: delivers the immediate value for HS while keeping the door open for PsO; the first step is now a tighter, lower-risk deliverable because the third screen is gone; respects the 400-line review budget more easily; borrows the "pathology hub pattern" as a roadmap without locking it into the first deliverable.
- Cons: two-step delivery; the second step must not regress the first; the absence of a nursing screen in the first deliverable is by design and is not a deferred requirement.
- Effort: Low-Medium (first step), then Medium (second step).

## Recommendation

**Approach D**, with the first deliverable being a single HS app shell that owns navigation, base loading, and a shared HS schema module. The shell embeds the HS medical form and the HS dashboard only.

**Scope restated after clarification:**

- The unified HS app covers the HS medical form and the HS dashboard. No nursing screen, no cure-post-Qx, no multidisciplinary-nursing screen, no `HS_consulta_enfermeria_HVR_2.html` embedding.
- Nursing is fully out of scope for this change AND for the Valme HS app's product scope. A future nursing change, if it ever exists, is a separate SDD change.
- The two external GitHub repos (HS-Canarias, Badajoz) are reference-only, not vendored, not a dependency, not a clinical-content source. Reuse is limited to the validated patterns in the "Reusable product/architecture inspiration" section above.

Why (re-assessed after excluding the nursing form):

- HS still has the densest coupling: same `Base_Datos_HS_Valme.xlsx`, same `Monografica`/`Multidisciplinar` circuits, same IHS-4 scale, same PROMs. The unification target is now a two-screen shell, which lowers the implementation risk and the review budget.
- The PsO reconciliation (v1/v2 retirement, two-bases reconciliation) is still a separable change with a clear rollback path, and it should not block the HS shell.
- The HUVR nursing form must not be rebranded, embedded, or database-coupled. Any temptation to "complete the trio" is a scope-creep risk, not a deliverable. The binding clarification is explicit on this and removes the open question entirely.
- Excluding the nursing form does not weaken the case for a shared HS schema module: the form-vs-dashboard column drift is the single biggest functional gap in the in-scope HS circuit, and a `hs_valme_schema.js` (or equivalent) addresses it directly.
- The reference repos give a clear "pathology hub" roadmap for a future PsO fold-in (Approach D second step) without forcing the first step to absorb that risk.

In parallel, the first sub-task inside Approach D should be Approach C applied to the in-scope pair: declare `hs_valme_schema.js` (or equivalent) that captures sheets `Monografica` and `Multidisciplinar`, field definitions, IHS-4 calculator, and PROMs calculators, then have the HS form and the HS dashboard import it. This is the minimum viable refactor before any UI shell is added.

## Likely Migration Steps (once a proposal is approved)

1. **Schema extraction**: create `HCE/hs_valme_schema.js` (or as a section in the unified app) that declares sheet names, columns, IHS-4 calculation, severity buckets, and PROMs calculators. Versioned as `v1` to match the form's existing label.
2. **Base loader extraction**: move the SheetJS load + cache + hash-routing logic out of the dashboard into a shared module. Replace the form's hand-rolled XLSX parser with the same loader, so form and dashboard read the base the same way.
3. **HS app shell**: introduce `HCE/hs_valme_app.html` with a top nav for `Formulario | Dashboard` (no nursing tab, per binding clarification), a single "Cargar base" affordance, and a single in-app state container. Existing HTML files remain in place as redirects/aliases during transition.
4. **Re-embed screens**: re-embed the two in-scope HS screens (form + dashboard) inside the shell, replacing their local `Base_Datos_HS_Valme.xlsx` loads and their local `localStorage` cache keys with the shared module. The HUVR nursing form is **not** embedded. No new nursing screen is added.
5. **Vendor folder + namespace discipline**: introduce a `vendor/` folder for SheetJS / Chart.js / Font Awesome (mirroring the reference repos' vendor discipline) and expose a `ValmeHS` (or neutral) global namespace for the schema module, base loader, and per-screen controllers. This is a packaging refactor, not a code rewrite.
6. **Docs**: write `docs/CONTRATO_DATOS_HS.md` and `docs/ESTADO_IMPLEMENTACION_HS.md` (or extend `Guia_Operativa_HS_Valme.docx`) to keep the schema contract and the implementation status close to the code.
7. **PsO reconciliation** (separate change): pick one PsO dashboard, retire the other, retire one of the two PsO bases, declare a PsO schema module. Then fold PsO into the same shell via a `pathology` switch.
8. **Update guides**: `Guia_Operativa_HS_Valme.docx` and `Guia_Operativa_Psoriasis_Valme.docx` reflect the new flow. `AGENTS.md` and `openspec/config.yaml` reflect the new layout and explicitly call out `HCE/HS_consulta_enfermeria_HVR_2.html`, `Plantillas Historia Clinica HUV Rocio/`, and the two external repos as reference-only.

## Risks

- **Clinical wording drift**: the AGENTS.md rule "Preserve existing clinical wording unless explicitly asked to rewrite it" applies to the in-scope form, dashboard, and report. Any unification must move text verbatim, not paraphrase. The excluded HUVR nursing form is not in scope, so its wording is not at risk in this change.
- **Scope creep onto reference files**: `HCE/HS_consulta_enfermeria_HVR_2.html` and `Plantillas Historia Clinica HUV Rocio/` are reference-only. The two external GitHub repos (HS-Canarias, Badajoz) are reference-only and must not be vendored, copied, or rebranded. A future contributor may try to "complete" the HS shell by pulling in a nursing form, copying code from the reference repos, or branding the app as a "Hub" variant. The proposal must include an explicit allow-list and the `AGENTS.md` rules must call out the reference-only status.
- **Nursing re-introduction risk** (new, after clarification). Without a binding clarification, every future contributor and every future SDD change will be tempted to re-introduce a nursing screen "while we are at it". The proposal must include a `scope.disallowed` list with nursing explicitly named, and the unified HS shell must not have a `Nursing` or `Enfermeria` nav entry.
- **Clipboard export regression**: the form's TSV paste flow is the only write path that clinical users currently rely on. If the unification moves to in-browser XLSX write (JSZip-style), users may distrust the output until they verify the schema is identical. Pilot with both flows during transition.
- **Schema drift across the two in-scope HS files** (down from three): the dashboard's SheetJS-based reading assumes specific column names that the form's TSV writer must produce. Versioning the schema (`HEADERS_HS_VERSION`) helps, but only if the dashboard and the form both check the version.
- **Parallel PsO dashboards**: keeping `v1` and `v2` side-by-side while unifying HS increases the chance that the next contributor edits the wrong file. Retiring one is a prerequisite for any PsO fold-in.
- **localStorage leakage**: each tool has its own cache key (`hs_valme_dashboard_cache`, `pso_valme_dashboard_cache`, form draft key). A unified shell should namespace them under one root.
- **CDN drift**: the form uses none, the HS dashboard uses SheetJS 0.18.5 and Chart.js 3.9.1, the PsO dashboard uses a local JSZip. Choosing one stack for the unified shell is a security and reproducibility decision that must be made early. Adopting a `vendor/` folder is the safest way to make that choice auditable.
- **Reference-repo over-fitting** (new, after external-repos clarification). The HS-Canarias and Badajoz repos are tempting templates. The risk is copying their session gate, their per-pathology codification, their 195-column export shape, or their "Homúnculo" widget into Valme without re-validating against Valme clinical and IT requirements. Every pattern from those repos must be re-justified, not lifted.
- **400-line review budget**: the HS shell plus the schema module is more manageable now that the nursing screen is excluded, but the rebranding and the schema extraction together can still approach the 400-line review budget. Delivery strategy `ask-always` and chained PRs are still required (see `sdd-phase-common.md` Section E).
- **No automated tests**: validation is manual/artifact-based. Unification will require explicit `verify` steps that open the new HTML, load the base, and confirm KPIs and per-patient view match the current behaviour.
- **Missing in-scope HS nursing form** (resolved): by excluding `HS_consulta_enfermeria_HVR_2.html`, the unified HS app does not cover a nursing consultation view. This is now a deliberate scope decision, not an open question. If a real Valme HS nursing form is ever needed, it is a separate change with its own requirements gathering, schema, and base coupling.

## Open Questions to Answer Before a Proposal

1. **Schema ownership**: is the unified schema module a generated file from a JSON/YAML spec, or a hand-written JS module? This affects whether changes require a code review, a spec review, or both.
2. **Write path**: do clinical users accept in-browser XLSX write (via JSZip) as a replacement for the clipboard paste, or must the clipboard path remain as a fallback? This is the single biggest UX decision in the change.
3. **Form data persistency**: does the unified shell need to persist a draft form (NUSHA, partial fields) between page reloads via `localStorage` (current behaviour in the medical form) or is a session-only state acceptable? This affects the `localStorage` namespace question.
4. **Per-patient cross-pathology view**: in the future, will a user need a single patient page that shows both HS and PsO history? If yes, the schema must reserve a common patient identifier. If no, the pathology switch is purely a UI switch.
5. **Retire vs. preserve**: when the unified shell lands, do we keep the legacy `HCE/*.html` files as redirects/aliases, or delete them? This is a reversibility decision.
6. **PsO timing**: is the PsO fold-in a "now" deliverable, or explicitly deferred? The answer determines whether Approach A or Approach D is the right plan.
7. **Reference-repo pattern adoption**: which of the validated patterns in the "Reusable product/architecture inspiration" section does the user actually want adopted in the HS shell? This is the only question about the reference repos; their content (code, schema, wording) is NOT up for adoption, only their abstract patterns are. A short "adopt / defer / drop" answer per pattern is enough.
8. **Session gate**: should the HS shell include a "pick professional" gate (HS-Canarias pattern) or stay gate-less? This affects the entry-point UX and the localStorage strategy.

> **Removed open question (per clarification).** The previous version of this exploration included an open question about "a real in-scope Valme HS nursing or multidisciplinary form" being added to the unified app. That question is **removed**. Nursing is fully out of scope for this change and for the Valme HS app product scope. If a future SDD change needs to revisit nursing, it must be opened as a separate, explicitly named change with its own exploration, requirements, and base coupling. The orchestrator MUST NOT ask the user about adding a nursing or multidisciplinary nursing form under this change.

## Ready for Proposal

Yes, with conditions. The orchestrator should:

1. Surface the remaining **Open Questions** above to the user before triggering `sdd-propose`. The answers materially change the proposal scope and the delivery strategy.
2. Do **not** surface a "should we add a nursing form?" question — nursing is out of scope (see removed open question above).
3. Recommend Approach D as the default path, but allow Approach A if the user wants the smallest possible first step and is willing to accept the duplication of work later.
4. Treat the PsO reconciliation (v1/v2 retirement, two-bases reconciliation) as a separable change with its own proposal, not as part of the HS unification.
5. Treat any rebranding, embedding, or database-coupling of `HCE/HS_consulta_enfermeria_HVR_2.html` as out of scope. Treat any vendoring, copy-paste, or rebranding of the HS-Canarias / Badajoz repos as out of scope. Only the *abstract* patterns in the "Reusable product/architecture inspiration" section are up for discussion, and only after Valme-specific validation.
6. Add a guard to `AGENTS.md` and `openspec/config.yaml` that explicitly classifies `HCE/HS_consulta_enfermeria_HVR_2.html`, `Plantillas Historia Clinica HUV Rocio/`, and the two external GitHub repos as reference-only.
7. After the user picks a path and answers the questions, launch `sdd-propose` with the chosen change name and the topic_key `sdd/hce-unified-clinical-tool/explore` already pointing at this exploration.
