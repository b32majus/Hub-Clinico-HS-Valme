# Repository Guidelines

## Project Structure & Module Organization
This repository is a working directory for the HS Valme care-improvement project. Content is organized by purpose rather than by application code:

- `HCE/`: operational clinical tools, including the unified HS hub, the patient form, clinical dashboard, nursing consultation page, and the working guide.
- `HCE/hs_valme_hub/`: unified HS hub (static Vite app). Entry point: `HCE/hs_valme_hub/index.html`; build output: `HCE/hs_valme_hub/dist/`.
- `outputs/`: generated presentation outputs and slide previews.
- Root documents: meeting minutes, reports, protocols, training materials, and patient-facing assets.
- `Plantillas Historia Clinica HUV Rocio/`: reference templates and related HTML examples (reference-only).

Keep new files close to the workflow they support. For example, place a new clinical form in `HCE/` and a new presentation export in `outputs/`.

## Build, Test, and Development Commands
There is no formal build system or package manifest. Use the existing scripts directly:

- `python start_server.py`: serves the repository locally on `http://127.0.0.1:8003/` for reviewing HTML artifacts.
- `python try_build_ap.py`: regenerates the AP infographic HTML from the embedded template.
- `node build_gt_valme_redesign.mjs`: rebuilds the redesigned GT slide deck and preview assets.
- `node build_gt_valme_redesign_v2.mjs`: alternative deck generation pass, kept for iteration and comparison.
- `cd HCE/hs_valme_hub && npm install`: installs the hub dev dependencies.
- `cd HCE/hs_valme_hub && npm run build`: builds the hub static assets into `HCE/hs_valme_hub/dist/`.
- `cd HCE/hs_valme_hub && node tests/parity-check-node.mjs`: checks hub TSV parity against the legacy form.
- `cd HCE/hs_valme_hub && node tests/scope-guard-check-node.mjs`: ensures no nursing/PsO routes or browser persistence APIs are present.

Validate HTML changes in a browser and verify generated documents or slides visually after running the relevant script. For the hub, also run the Node checks after any schema or form change.

## Coding Style & Naming Conventions
Use UTF-8 text files and keep implementation scripts readable, explicit, and self-contained. Prefer:

- Descriptive Spanish file names matching the existing pattern, e.g. `Protocolo_AP_HS_Valme_v2.docx`.
- Version suffixes such as `_v1`, `_v2`, or `_REDESIGN`.
- Lowercase, hyphen-free HTML/CSS asset names when creating new files.

For Python and Node scripts, follow the local style already in use: simple modules, clear constants, minimal indirection, and no unnecessary abstractions.

## Testing Guidelines
There is no automated test suite in this repository. Treat validation as artifact-based:

- Open local HTML outputs in a browser and check layout, interaction, and content.
- Review generated PPTX, DOCX, PDF, and PNG files manually after regeneration.
- When a script writes previews or exports, compare the new output against the previous version before sharing it.

If you add executable logic, include a lightweight verification step in the same script or document how to run it.

## Commit & Pull Request Guidelines
This folder does not include `.git`, so no commit history is available here. Use short, descriptive commit messages if you work in a connected repository, for example: `Update HS clinical form v2`.

For pull requests, include:

- A brief description of the change and affected files.
- Screenshots or exported previews for visual artifacts.
- Notes on any clinical or workflow assumptions.
- Links to the source document, meeting note, or request that motivated the change.

## Agent Notes
Preserve existing clinical wording unless the task explicitly asks for a rewrite. When changing generated assets, keep the source script and the exported artifact aligned so future edits remain reproducible.

## Reference-Only Assets (do not integrate)

The following files and folders are kept for historical or inspirational reference only. Do not move, rebrand, or integrate them into the HS hub:

- `HCE/HS_consulta_enfermeria_HVR_2.html` — nursing consultation form, out of scope.
- `HCE/PsO/` — Psoriasis tools, out of scope.
- `Plantillas Historia Clinica HUV Rocio/` — HUV Rocio reference templates.
- External repositories HS-Canarias and Badajoz — inspiration only, not source-of-truth.

Do not add navigation items, routes, modules, or migrations targeting these assets.
