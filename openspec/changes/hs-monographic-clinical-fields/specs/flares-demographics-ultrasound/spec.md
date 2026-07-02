# Delta for Flares, Demographics, and Ultrasound

## Purpose

Add mode-specific flare questions, education level, age of onset, and update the ultrasound section to remove Doppler collection and add free-text findings.

## ADDED Requirements

### Requirement: Mode-specific flare count question

The system MUST ask `flares_total_ultimo_anio` on first visits and MUST ask `flares_desde_ultima_visita` on follow-up visits.

#### Scenario: First visit flare count

- GIVEN the user opens `Primera visita`
- THEN the form shows a numeric input labeled for flare count in the last year.

#### Scenario: Follow-up flare count

- GIVEN the user opens `Seguimiento`
- THEN the form shows a numeric input labeled for flares since the last visit.

### Requirement: Flare severity flags

The system MUST capture whether any flare required urgent care, surgery, or antibiotics using `flares_requirio_urgencias`, `flares_requirio_cirugia`, and `flares_requirio_antibioticos` as `Si/No` values.

#### Scenario: Flare flags export

- GIVEN the user answers `Si` to urgent care and `No` to surgery and antibiotics
- WHEN the form is collected
- THEN the TSV row contains `Si`, `No`, `No` for the three flag cells.

### Requirement: Education level

The system MUST capture `nivel_educativo` with the options `Sin estudios`, `Primarios`, `Secundarios`, and `Universitarios`.

#### Scenario: Education level exported

- GIVEN the user selects `Universitarios`
- WHEN the form is collected
- THEN `nivel_educativo` exports `Universitarios`.

### Requirement: Age of onset

The system MUST capture `edad_inicio` as the patient's age in years at disease onset and MUST keep the existing `anio_inicio` column unchanged.

#### Scenario: Age and year coexist

- GIVEN the user enters `edad_inicio` = `18` and `anio_inicio` = `2010`
- WHEN the form is collected
- THEN both values export independently.

### Requirement: Ultrasound findings text

The system MUST add `eco_hallazgos` as an open-text textarea in the ultrasound section and MUST keep `eco_ihs4` and `eco_gravedad`.

#### Scenario: Findings text exports

- GIVEN the user types "multiple fistulous tracts" into `eco_hallazgos`
- WHEN the form is collected
- THEN the TSV row contains that text and the echographic IHS4 columns are present.

## MODIFIED Requirements

### Requirement: Ultrasound Doppler input

The system MUST NOT render an `eco_doppler` input in the ultrasound section.

(Previously: the ultrasound section included an `eco_doppler` field.)

#### Scenario: No Doppler control

- GIVEN the user opens the ultrasound section
- THEN no Doppler field or value is collected.

## REMOVED Requirements

### Requirement: Ultrasound Doppler collection

(Reason: Doppler data is no longer clinically useful in this workflow.)
(Migration: The `eco_doppler` column is dropped from the v2 schema; see `schema-v2` spec. Dashboards and forms MUST NOT reference it for new visits.)

## Cross-spec dependencies

- `schema-v2` defines the v2 columns for flares, demographics, and ultrasound.
- `toxic-habits` shares the anamnesis section layout.
- `visit-registration` (main spec) governs the first/follow-up form entry points.
