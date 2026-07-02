# Delta for Toxic Habits

## Purpose

Refine tobacco capture to support `Fumador`, `Exfumador`, and `Nunca ha fumado` states with time-since-quitting, and add the alcohol/UBE weekly-consumption block.

## ADDED Requirements

### Requirement: Tobacco state field

The system MUST capture `fumador_estado` with the options `Fumador`, `Exfumador`, and `Nunca ha fumado`.

#### Scenario: Smoker state selected

- GIVEN the user selects `Fumador`
- WHEN the form is collected
- THEN `fumador_estado` exports `Fumador`.

#### Scenario: Ex-smoker state selected

- GIVEN the user selects `Exfumador`
- WHEN the form is collected
- THEN `fumador_estado` exports `Exfumador`.

### Requirement: Ex-smoker time-since-quitting

The system MUST show `exfumador_anios` only when `fumador_estado` is `Exfumador` and MUST hide it otherwise.

#### Scenario: Ex-smoker shows years

- GIVEN `fumador_estado` is `Exfumador`
- THEN the `exfumador_anios` input is visible and its value is exported.

#### Scenario: Non-ex-smoker hides years

- GIVEN `fumador_estado` is `Fumador` or `Nunca ha fumado`
- THEN `exfumador_anios` is hidden and exports an empty value.

### Requirement: Legacy tobacco compatibility

The system SHOULD keep the existing binary `fumador` column in the v2 header list for backward compatibility and SHOULD derive it from `fumador_estado` until the data contract explicitly deprecates it.

#### Scenario: Binary tobacco column preserved

- GIVEN a v2 TSV row
- THEN the `fumador` cell is present and is `Si` when `fumador_estado` is `Fumador`, otherwise `No`.

### Requirement: Alcohol consumption state

The system MUST capture `alcohol_consume` with the options `si`, `no`, and `nunca`.

#### Scenario: Alcohol state exported

- GIVEN the user selects an alcohol option
- WHEN the form is collected
- THEN `alcohol_consume` exports the selected value.

### Requirement: Alcohol weekly quantities

The system MUST show `alcohol_cervezas_vino_semana` and `alcohol_copas_destilados_semana` only when `alcohol_consume` is `si`, and MUST hide them otherwise.

#### Scenario: Drinker shows weekly counts

- GIVEN `alcohol_consume` is `si`
- THEN the beer/wine and spirits weekly inputs are visible and export their numeric values.

#### Scenario: Non-drinker hides weekly counts

- GIVEN `alcohol_consume` is `no` or `nunca`
- THEN the weekly quantity inputs are hidden and export empty values.

### Requirement: Derived UBE per week

The system MUST derive `alcohol_ube_semana` as `alcohol_cervezas_vino_semana + 2 * alcohol_copas_destilados_semana` and MUST export the derived value.

#### Scenario: UBE calculation

- GIVEN `alcohol_cervezas_vino_semana` is `3` and `alcohol_copas_destilados_semana` is `2`
- WHEN the form is collected
- THEN `alcohol_ube_semana` exports `7`.

## Cross-spec dependencies

- `schema-v2` adds the corresponding `fumador_estado`, `exfumador_anios`, `alcohol_*`, and `alcohol_ube_semana` columns.
- `flares-demographics-ultrasound` governs the anamnesis section layout where these fields appear.
