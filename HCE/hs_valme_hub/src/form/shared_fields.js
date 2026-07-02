import {
  IHS_REGIONS,
  IHS_LESION_TYPES,
  COMORBIDITY_FIELDS,
  SURGERY_FIELDS,
  DLQI_ITEMS,
  DLQI_OPTION_SETS,
  HSQOL_ITEMS,
  HSQOL_OPTIONS,
  THERAPY_GROUPS,
  THERAPY_SLOT_LIMIT,
  buildTherapyFieldNames,
  DERIVED,
  VALIDATORS,
  REQUIRED,
  TIPO_VISITA_OPTIONS,
  ORIGEN_PACIENTE_OPTIONS,
  SHEET_KEYS
} from '../schema/hs_schema.js';
import { validatePayload } from '../tsv/exporter.js';

export const ICON = (id) => `
  <svg class="icon" aria-hidden="true" width="20" height="20">
    <use href="vendor/lucide-sprite.svg#${id}"></use>
  </svg>
`;

const SI_NO_OPTIONS = [
  { value: '', label: 'Seleccione una opcion' },
  { value: 'si', label: 'Si' },
  { value: 'no', label: 'No' }
];

const FUMADOR_ESTADO_OPTIONS = [
  { value: '', label: 'Seleccione una opcion' },
  { value: 'Fumador', label: 'Fumador' },
  { value: 'Exfumador', label: 'Exfumador' },
  { value: 'Nunca ha fumado', label: 'Nunca ha fumado' }
];

const ALCOHOL_CONSUME_OPTIONS = [
  { value: '', label: 'Seleccione una opcion' },
  { value: 'si', label: 'Si' },
  { value: 'no', label: 'No' },
  { value: 'nunca', label: 'Nunca' }
];

const EDUCATION_OPTIONS = [
  { value: '', label: 'Seleccione una opcion' },
  { value: 'Sin estudios', label: 'Sin estudios' },
  { value: 'Primarios', label: 'Primarios' },
  { value: 'Secundarios', label: 'Secundarios' },
  { value: 'Universitarios', label: 'Universitarios' }
];

const SEX_OPTIONS = [
  { value: '', label: 'Seleccione una opcion' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' }
];

function selectOptions(options) {
  return options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
}

function formGroup(label, inputHtml, hint = '') {
  return `
    <div class="form-group">
      <label class="form-label">${label}</label>
      ${inputHtml}
      ${hint ? `<div class="form-hint">${hint}</div>` : ''}
    </div>
  `;
}

export function renderTopFields() {
  return `
    <div class="visit-form__header">
      ${formGroup('NUSHA: <span class="required-mark">*</span>', `<input type="text" class="form-input" data-field="nusha" placeholder="AN + 10 numeros" maxlength="12">`)}
      ${formGroup('Fecha: <span class="required-mark">*</span>', `<input type="date" class="form-input" data-field="fecha_visita">`)}
    </div>
    <div class="visit-form__header">
      ${formGroup('Consulta: <span class="required-mark">*</span>', `
        <select class="form-select" data-field="consulta">
          <option value="">Seleccione una opcion</option>
          <option value="monografica">Monografica</option>
          <option value="multidisciplinar">Multidisciplinar</option>
        </select>
      `)}
      ${formGroup('Origen del Paciente: <span class="required-mark">*</span>', `
        <select class="form-select" data-field="origen_paciente">
          <option value="">Seleccione una opcion</option>
          ${ORIGEN_PACIENTE_OPTIONS.map(o => `<option value="${o}">${o.replace(/_/g, ' ')}</option>`).join('')}
        </select>
      `)}
    </div>
    <div class="visit-form__header">
      ${formGroup('Tipo de visita: <span class="required-mark">*</span>', `
        <select class="form-select" data-field="tipo_visita">
          ${selectOptions([{ value: '', label: 'Seleccione una opcion' }, ...TIPO_VISITA_OPTIONS])}
        </select>
      `)}
      <div class="form-group">
        <label class="form-label">CIE</label>
        <div class="readonly-field form-input" style="display:flex;align-items:center;">
          <strong>L73.2</strong>&nbsp;- Hidradenitis supurativa
        </div>
      </div>
    </div>
    <div class="visit-form__toggle-row">
      <button type="button" class="toggle-btn" data-toggle="solicitud_analitica">
        <span class="toggle-btn__badge">LAB</span>
        <span>Analitica sanguinea</span>
      </button>
      <input type="hidden" data-field="solicitud_analitica" value="No">
      <button type="button" class="toggle-btn" data-toggle="solicitud_medicina_preventiva">
        <span class="toggle-btn__badge">MP</span>
        <span>Medicina Preventiva</span>
      </button>
      <input type="hidden" data-field="solicitud_medicina_preventiva" value="No">
    </div>
  `;
}

export function renderAnamnesisSection() {
  return `
    <div class="form-section">
      <div class="form-section__header">ANAMNESIS</div>
      <div class="form-section__body open">
        <div class="form-grid">
          ${formGroup('Antecedentes familiares HS', `<select class="form-select" data-field="antecedentes_familiares_hs">${selectOptions(SI_NO_OPTIONS)}</select>`)}
          ${formGroup('Año inicio', `<input type="number" class="form-input" data-field="anio_inicio" min="1900" max="2100">`)}
          ${formGroup('Fumador estado', `<select class="form-select" data-field="fumador_estado" data-toggle-show="smoking">${selectOptions(FUMADOR_ESTADO_OPTIONS)}</select>`)}
          ${formGroup('Exfumador años', `<input type="number" class="form-input" data-field="exfumador_anios" min="0" max="100" data-show-when="smoking" data-show-value="Exfumador">`, 'Visible si Exfumador')}
          ${formGroup('Sexo al nacimiento', `<select class="form-select" data-field="sexo_nacimiento">${selectOptions(SEX_OPTIONS)}</select>`)}
          ${formGroup('Cigarros/dia', `<input type="number" class="form-input" data-field="cigarros_dia" min="0" max="50">`)}
          ${formGroup('Años fumador', `<input type="number" class="form-input" data-field="anios_fumador" min="0" max="100">`)}
          ${formGroup('Año diagnostico', `<input type="number" class="form-input" data-field="anio_diagnostico" min="1900" max="2100">`)}
          ${formGroup('Peso (Kg)', `<input type="number" class="form-input" data-field="peso_kg" min="0" step="0.1" data-calc-imc>`)}
          ${formGroup('Talla (m)', `<input type="number" class="form-input" data-field="talla_m" min="0" step="0.01" data-calc-imc>`)}
          ${formGroup('IMC', `<input type="text" class="form-input readonly-field" data-field="imc" readonly>`)}
        </div>
      </div>
    </div>
  `;
}

export function renderToxicHabitsSection() {
  return `
    <div class="form-section">
      <div class="form-section__header">HABITOS TOXICOS</div>
      <div class="form-section__body open">
        <div class="form-grid">
          ${formGroup('Alcohol consume', `<select class="form-select" data-field="alcohol_consume" data-toggle-show="alcohol">${selectOptions(ALCOHOL_CONSUME_OPTIONS)}</select>`)}
          ${formGroup('Cervezas/vino por semana', `<input type="number" class="form-input" data-field="alcohol_cervezas_vino_semana" min="0" data-show-when="alcohol" data-show-value="si" data-calc-ube>`, 'Visible si consume alcohol')}
          ${formGroup('Copas destilados por semana', `<input type="number" class="form-input" data-field="alcohol_copas_destilados_semana" min="0" data-show-when="alcohol" data-show-value="si" data-calc-ube>`, 'Visible si consume alcohol')}
          ${formGroup('UBE semana', `<input type="number" class="form-input readonly-field" data-field="alcohol_ube_semana" readonly>`, 'Unidades de bebida estandar: cervezas/vino + 2 x copas')}
        </div>
      </div>
    </div>
  `;
}

export function renderDemographicsExtras() {
  return `
    <div class="form-section">
      <div class="form-section__header">DATOS DEMOGRAFICOS ADICIONALES</div>
      <div class="form-section__body open">
        <div class="form-grid">
          ${formGroup('Edad inicio (años)', `<input type="number" class="form-input" data-field="edad_inicio" min="0" max="120">`)}
          ${formGroup('Nivel educativo', `<select class="form-select" data-field="nivel_educativo">${selectOptions(EDUCATION_OPTIONS)}</select>`)}
        </div>
      </div>
    </div>
  `;
}

export function renderFlaresSection(mode) {
  const flareCountField = mode === 'first'
    ? formGroup('Brotes en el ultimo año', `<input type="number" class="form-input" data-field="flares_total_ultimo_anio" min="0">`)
    : formGroup('Brotes desde la ultima visita', `<input type="number" class="form-input" data-field="flares_desde_ultima_visita" min="0">`);
  return `
    <div class="form-section">
      <div class="form-section__header">BROTES</div>
      <div class="form-section__body open">
        <div class="form-grid">
          ${flareCountField}
          ${formGroup('Requirio urgencias', `<select class="form-select" data-field="flares_requirio_urgencias">${selectOptions(SI_NO_OPTIONS)}</select>`)}
          ${formGroup('Requirio cirugia', `<select class="form-select" data-field="flares_requirio_cirugia">${selectOptions(SI_NO_OPTIONS)}</select>`)}
          ${formGroup('Requirio antibioticos', `<select class="form-select" data-field="flares_requirio_antibioticos">${selectOptions(SI_NO_OPTIONS)}</select>`)}
        </div>
      </div>
    </div>
  `;
}

export function renderComorbiditySection() {
  const items = COMORBIDITY_FIELDS.map(f => `
    <div class="comorb-item" data-comorb-key="${f.key}">${f.label}</div>
  `).join('');
  return `
    <div class="form-section">
      <div class="form-section__header">COMORBILIDADES</div>
      <div class="form-section__body open">
        <div class="comorb-grid">${items}</div>
        ${formGroup('Otras comorbilidades', `<textarea class="form-textarea" data-field="otras_comorbilidades" rows="2"></textarea>`)}
      </div>
    </div>
  `;
}

export function renderIhsSection() {
  const regions = IHS_REGIONS.map(region => {
    const counters = IHS_LESION_TYPES.map(type => `
      <div class="ihs-counter">
        <span class="ihs-counter__label ihs-counter__label--${type.key}">${type.shortLabel}</span>
        <input type="number" class="form-input" data-field="ihs_${region.key}_${type.key}" min="0" value="0">
      </div>
    `).join('');
    return `
      <div class="ihs-region">
        <div class="ihs-region__title">${region.label}</div>
        ${counters}
      </div>
    `;
  }).join('');

  return `
    <div class="form-section">
      <div class="form-section__header">REGIONES AFECTAS E IHS4</div>
      <div class="form-section__body open">
        <div class="form-hint" style="margin-bottom:var(--space-4);">
          IHS4 = Nodulos x 1 + Abscesos x 2 + Fistulas drenantes x 4 | Leve &lt; 4 | Moderado 4-10 | Grave &gt; 10
        </div>
        <div class="ihs-grid">${regions}</div>
        <div class="form-grid form-grid--3" style="margin-bottom:var(--space-5);">
          ${formGroup('Otras regiones / detalle anatomico', `<textarea class="form-textarea" data-field="otras_regiones" rows="2" placeholder="Especificar localizaciones fuera del mapa base"></textarea>`)}
          ${formGroup('Cicatrices', `<input type="number" class="form-input" data-field="cicatrices" min="0">`)}
          ${formGroup('Otras lesiones relevantes', `<textarea class="form-textarea" data-field="otras_lesiones" rows="2" placeholder="Quistes epidermoides, lesiones residuales o comentarios clinicos"></textarea>`)}
        </div>
        <div class="ihs-totals">
          <div class="ihs-totals__chips">
            <span class="ihs-chip">Nodulos: <strong data-ihs-total="n">0</strong></span>
            <span class="ihs-chip">Abscesos: <strong data-ihs-total="a">0</strong></span>
            <span class="ihs-chip">Fistulas: <strong data-ihs-total="f">0</strong></span>
            <span class="ihs-chip">FD: <strong data-ihs-total="fd">0</strong></span>
          </div>
          <div class="ihs-score">
            <div class="ihs-score__label">IHS4 SCORE</div>
            <div class="ihs-score__value" data-ihs-score="0">0</div>
            <div data-ihs-grade>Leve</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderEcoSection() {
  return `
    <div class="form-section">
      <div class="form-section__header">PRUEBA ECOGRAFICA</div>
      <div class="form-section__body open">
        <div class="form-grid">
          ${formGroup('Nodulos (calculo IHS4 Ecografico)', `<input type="number" class="form-input" data-field="eco_nodulos" min="0" data-calc-eco>`)}
          ${formGroup('Abscesos (calculo IHS4 Ecografico)', `<input type="number" class="form-input" data-field="eco_abscesos" min="0" data-calc-eco>`)}
          ${formGroup('Fistulas (calculo IHS4 Ecografico)', `<input type="number" class="form-input" data-field="eco_fistulas" min="0" data-calc-eco>`)}
          ${formGroup('Hallazgos ecograficos', `<textarea class="form-textarea" data-field="eco_hallazgos" rows="3" placeholder="Describa los hallazgos ecograficos relevantes"></textarea>`)}
        </div>
        <div class="prom-summary" style="margin-top:var(--space-4);">
          <div class="prom-summary__card">
            <div class="prom-summary__title">IHS-4 Ecografico</div>
            <div class="prom-summary__value" data-eco-score="0">0</div>
            <div class="prom-summary__hint" data-eco-grade>Leve</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderPromsSection() {
  const dlqiRows = DLQI_ITEMS.map((item, idx) => {
    const options = DLQI_OPTION_SETS[item.optionSet] || DLQI_OPTION_SETS.standard;
    return `
      <tr>
        <td>${item.text}</td>
        <td>
          <select class="form-select" data-field="dlqi_q${idx + 1}">
            ${selectOptions([{ value: '', label: 'Seleccione...' }, ...options])}
          </select>
        </td>
      </tr>
    `;
  }).join('');

  const hsqolRows = HSQOL_ITEMS.map((item, idx) => `
    <tr>
      <td>${item.text}</td>
      <td>
        <select class="form-select" data-field="hsqol_q${idx + 1}">
          ${selectOptions([{ value: '', label: 'Seleccione...' }, ...HSQOL_OPTIONS])}
        </select>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-section">
      <div class="form-section__header">PROMs</div>
      <div class="form-section__body open">
        <div class="prom-summary">
          <div class="prom-summary__card">
            <div class="prom-summary__title">DLQI total</div>
            <div class="prom-summary__value" data-dlqi-total>0</div>
            <div class="prom-summary__hint" data-dlqi-interpretation>No evaluado</div>
          </div>
          <div class="prom-summary__card">
            <div class="prom-summary__title">HSQoL-24</div>
            <div class="prom-summary__value" data-hsqol-total>0</div>
            <div class="prom-summary__hint" data-hsqol-interpretation>No evaluado</div>
          </div>
          <div class="prom-summary__card">
            <div class="prom-summary__title">EVA dolor</div>
            <div class="prom-summary__value" data-eva-total>0</div>
            <div class="prom-summary__hint">Escala 0-10</div>
          </div>
          <div class="prom-summary__card">
            <div class="prom-summary__title">EVA prurito</div>
            <div class="prom-summary__value" data-eva-prurito-total>0</div>
            <div class="prom-summary__hint">Escala 0-10</div>
          </div>
          <div class="prom-summary__card">
            <div class="prom-summary__title">EVA olor</div>
            <div class="prom-summary__value" data-eva-olor-total>0</div>
            <div class="prom-summary__hint">Escala 0-10</div>
          </div>
          <div class="prom-summary__card">
            <div class="prom-summary__title">EVA supuracion</div>
            <div class="prom-summary__value" data-eva-supuracion-total>0</div>
            <div class="prom-summary__hint">Escala 0-10</div>
          </div>
        </div>
        <div class="form-grid form-grid--2" style="margin-bottom:var(--space-4);">
          ${formGroup('EVA Dolor', `<input type="number" class="form-input" data-field="eva_dolor" min="0" max="10" data-calc-eva>`, 'Escala 0-10')}
          ${formGroup('EVA Prurito', `<input type="number" class="form-input" data-field="eva_prurito" min="0" max="10" data-calc-eva>`, 'Escala 0-10')}
          ${formGroup('EVA Olor', `<input type="number" class="form-input" data-field="eva_olor" min="0" max="10" data-calc-eva>`, 'Escala 0-10')}
          ${formGroup('EVA Supuracion', `<input type="number" class="form-input" data-field="eva_supuracion" min="0" max="10" data-calc-eva>`, 'Escala 0-10')}
        </div>
        <details class="form-section" style="margin-top:var(--space-5);">
          <summary style="cursor:pointer;font-weight:var(--font-bold);color:var(--color-primary-800);">DLQI (10 items)</summary>
          <table class="prom-table">
            <thead><tr><th>Pregunta</th><th>Respuesta</th></tr></thead>
            <tbody>${dlqiRows}</tbody>
          </table>
        </details>
        <details class="form-section" style="margin-top:var(--space-4);">
          <summary style="cursor:pointer;font-weight:var(--font-bold);color:var(--color-primary-800);">HSQoL-24</summary>
          <table class="prom-table">
            <thead><tr><th>Pregunta</th><th>Respuesta</th></tr></thead>
            <tbody>${hsqolRows}</tbody>
          </table>
        </details>
      </div>
    </div>
  `;
}

export function renderSurgerySection() {
  const rows = SURGERY_FIELDS.map(f => `
    <div class="surgery-row">
      <label>
        <input type="checkbox" data-field="${f.checkbox}">
        ${f.label}
      </label>
      <input type="text" class="form-input" data-field="${f.note}" placeholder="Consideraciones...">
    </div>
  `).join('');

  return `
    <div class="form-section">
      <div class="form-section__header">CIRUGIA</div>
      <div class="form-section__body open">
        <div class="form-hint" style="margin-bottom:var(--space-4);">Este bloque solo aplica a la primera visita de la consulta monografica.</div>
        ${rows}
      </div>
    </div>
  `;
}

function therapyGroupHtml(prefix, group) {
  return `
    <div class="therapy-group" data-therapy-group="${group.key}" data-therapy-prefix="${prefix}">
      <div class="therapy-group__title">${group.label}</div>
      <div class="therapy-group__hint">${group.options.join(', ')}</div>
      <div class="therapy-rows" data-therapy-rows="${group.key}">
        ${therapyRowHtml(group, 0)}
      </div>
    </div>
  `;
}

function therapyRowHtml(group, index) {
  const options = group.options.map(o => `<option value="${o}">${o}</option>`).join('');
  return `
    <div class="therapy-row" data-therapy-row>
      <select class="form-select therapy-drug">
        <option value="">Seleccione tratamiento</option>
        ${options}
      </select>
      <input type="text" class="form-input therapy-posology" placeholder="Posologia / dosis / frecuencia">
      <div class="therapy-row__actions">
        <button type="button" class="therapy-action therapy-action--add" data-therapy-add aria-label="Anadir linea">+</button>
        ${index > 0 ? `<button type="button" class="therapy-action therapy-action--remove" data-therapy-remove aria-label="Eliminar linea">-</button>` : '<span style="width:38px;"></span>'}
      </div>
    </div>
  `;
}

export function renderTherapyBlock(prefix, title, hint) {
  const groups = THERAPY_GROUPS.map(g => therapyGroupHtml(prefix, g)).join('');
  return `
    <div class="therapy-block" data-therapy-block-prefix="${prefix}">
      <div class="therapy-block__title" style="font-weight:var(--font-extrabold);color:var(--color-secondary-800);margin-bottom:var(--space-2);">${title}</div>
      <div class="form-hint" style="margin-bottom:var(--space-4);">${hint}</div>
      ${groups}
    </div>
  `;
}

export function renderTherapySection(prefix, title, hint) {
  return `
    <div class="form-section">
      <div class="form-section__header">${title}</div>
      <div class="form-section__body open">
        ${renderTherapyBlock(prefix, title, hint)}
      </div>
    </div>
  `;
}

export function renderSeguimientoSection() {
  return `
    <div class="form-section">
      <div class="form-section__header">SEGUIMIENTO TERAPEUTICO</div>
      <div class="form-section__body open">
        ${formGroup('Tratamiento previo (precargado)', `<input type="text" class="form-input readonly-field" data-field="seguimiento_tratamiento_previo" readonly placeholder="Sin tratamiento precargado">`)}
        <input type="hidden" data-field="seguimiento_decision" value="">
        <div class="decision-grid">
          <button type="button" class="decision-btn" data-decision="continuar">Continuar Tratamiento</button>
          <button type="button" class="decision-btn" data-decision="cambiar">Cambiar Tratamiento</button>
        </div>
        <div class="seguimiento-panel hidden" data-panel="continuar">
          ${formGroup('Tratamiento actual (precargado)', `<input type="text" class="form-input readonly-field" data-field="seguimiento_tratamiento_actual" readonly placeholder="Sin tratamiento precargado">`)}
          ${formGroup('Ajuste de pauta / posologia', `<textarea class="form-textarea" data-field="seguimiento_ajuste_pauta" rows="2"></textarea>`)}
          ${formGroup('Adherencia', `
            <select class="form-select" data-field="seguimiento_adherencia">
              <option value="">Seleccione una opcion</option>
              <option value="buena">Buena</option>
              <option value="regular">Regular</option>
              <option value="mala">Mala</option>
            </select>
          `)}
          <div style="margin:var(--space-4) 0;">
            <strong>Morisky-Green (4 preguntas)</strong>
            <div style="display:grid;gap:var(--space-3);margin-top:var(--space-3);">
              ${[1, 2, 3, 4].map((q, i) => formGroup(
                `${q}. ${moriskyQuestion(i)}`,
                `<select class="form-select" data-field="seguimiento_morisky_q${q}">${selectOptions(SI_NO_OPTIONS)}</select>`
              )).join('')}
            </div>
            <div class="prom-summary__hint" data-morisky-result style="margin-top:var(--space-3);">Cuestionario no evaluado</div>
          </div>
          ${renderTherapyBlock('tx_seguimiento_continuar', 'Tratamiento concomitante (opcional)', 'Registrar por familia, farmaco y posologia para mantener trazabilidad estructurada.')}
        </div>
        <div class="seguimiento-panel hidden" data-panel="cambiar">
          ${formGroup('Motivo del cambio', `<textarea class="form-textarea" data-field="seguimiento_motivo_cambio" rows="2"></textarea>`)}
          <div class="form-group">
            <label class="form-label">
              <input type="checkbox" data-field="seguimiento_efectos_adversos">
              Efectos adversos
            </label>
          </div>
          ${renderTherapyBlock('tx_seguimiento_cambiar', 'Nuevo esquema terapeutico', 'Registre el nuevo tratamiento por familia, farmaco y posologia.')}
        </div>
      </div>
    </div>
  `;
}

function moriskyQuestion(index) {
  const questions = [
    'Olvida alguna vez tomar los medicamentos?',
    'Toma los medicamentos a la hora indicada?',
    'Cuando se encuentra bien, deja de tomar la medicacion?',
    'Si alguna vez le sienta mal, deja de tomarla?'
  ];
  return questions[index];
}

export function renderHallazgosSection() {
  return `
    <div class="form-section">
      <div class="form-section__header">HALLAZGOS DE INTERES</div>
      <div class="form-section__body open">
        ${formGroup('Hallazgos relevantes', `<textarea class="form-textarea" data-field="hallazgos_interes" rows="4" placeholder="Describa cualquier hallazgo de interes clinico..."></textarea>`)}
      </div>
    </div>
  `;
}

export function renderPatientSelector(base) {
  const options = getNushaOptions(base);
  if (!options.length) return '';
  return `
    <div class="form-group" style="max-width:360px;">
      <label class="form-label">Paciente existente (precarga desde base cargada)</label>
      <select class="form-select" data-patient-selector>
        <option value="">Nuevo paciente / sin precarga</option>
        ${options.map(n => `<option value="${n}">${n}</option>`).join('')}
      </select>
    </div>
  `;
}

export function bindFormInteractions(container) {
  // Section collapse
  container.querySelectorAll('.form-section__header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      if (!body || !body.classList.contains('form-section__body')) return;
      const isOpen = body.classList.toggle('open');
      header.classList.toggle('collapsed', !isOpen);
    });
  });

  // Toggle buttons (analitica / medicina)
  container.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.getAttribute('data-toggle');
      const input = container.querySelector(`[data-field="${field}"]`);
      const active = btn.classList.toggle('active');
      if (input) input.value = active ? 'Si' : 'No';
    });
  });

  // Conditional fields
  const updateConditional = () => {
    container.querySelectorAll('[data-show-when]').forEach(el => {
      const group = el.getAttribute('data-show-when');
      const expected = el.getAttribute('data-show-value');
      const control = container.querySelector(`[data-toggle-show="${group}"]`);
      const visible = control && control.value === expected;
      el.closest('.form-group').style.display = visible ? '' : 'none';
    });
  };
  container.querySelectorAll('[data-toggle-show]').forEach(el => {
    el.addEventListener('change', updateConditional);
  });
  updateConditional();

  // IMC
  const updateImc = () => {
    const peso = parseFloat(container.querySelector('[data-field="peso_kg"]')?.value);
    const talla = parseFloat(container.querySelector('[data-field="talla_m"]')?.value);
    const imcInput = container.querySelector('[data-field="imc"]');
    if (imcInput) imcInput.value = DERIVED.imc({ pesoKg: peso, tallaM: talla });
  };
  container.querySelectorAll('[data-calc-imc]').forEach(el => el.addEventListener('input', updateImc));

  // IHS totals
  const updateIhs = () => {
    const totals = { n: 0, a: 0, f: 0, fd: 0 };
    for (const region of IHS_REGIONS) {
      const regionTotals = { n: 0, a: 0, f: 0, fd: 0 };
      for (const type of IHS_LESION_TYPES) {
        const val = parseInt(container.querySelector(`[data-field="ihs_${region.key}_${type.key}"]`)?.value || 0, 10);
        totals[type.key] += val;
        regionTotals[type.key] += val;
      }
      const regionEl = container.querySelector(`[data-field="ihs_${region.key}_n"]`)?.closest('.ihs-region');
      if (regionEl) {
        const hasWarning = regionTotals.f > 0 && regionTotals.fd > 0;
        let warningEl = regionEl.querySelector('.ihs-warning');
        if (hasWarning && !warningEl) {
          warningEl = document.createElement('div');
          warningEl.className = 'ihs-warning';
          warningEl.textContent = 'Confirma si fistulas y fistulas drenantes son lesiones distintas.';
          regionEl.appendChild(warningEl);
        } else if (!hasWarning && warningEl) {
          warningEl.remove();
        }
      }
    }
    for (const key of Object.keys(totals)) {
      const el = container.querySelector(`[data-ihs-total="${key}"]`);
      if (el) el.textContent = totals[key];
    }
    const score = DERIVED.ihs4Score(totals);
    const grade = DERIVED.ihs4Grade(score);
    const scoreEl = container.querySelector('[data-ihs-score]');
    if (scoreEl) scoreEl.textContent = score;
    const gradeEl = container.querySelector('[data-ihs-grade]');
    if (gradeEl) gradeEl.textContent = grade;
  };
  container.querySelectorAll('[data-field]').forEach(el => {
    if (/^ihs_/.test(el.getAttribute('data-field'))) {
      el.addEventListener('input', updateIhs);
    }
  });
  updateIhs();

  // Eco score
  const updateEco = () => {
    const n = parseInt(container.querySelector('[data-field="eco_nodulos"]')?.value || 0, 10);
    const a = parseInt(container.querySelector('[data-field="eco_abscesos"]')?.value || 0, 10);
    const f = parseInt(container.querySelector('[data-field="eco_fistulas"]')?.value || 0, 10);
    const score = DERIVED.ihs4Score({ n, a, f });
    const grade = DERIVED.ihs4Grade(score);
    const scoreEl = container.querySelector('[data-eco-score]');
    if (scoreEl) scoreEl.textContent = score;
    const gradeEl = container.querySelector('[data-eco-grade]');
    if (gradeEl) gradeEl.textContent = grade;
  };
  container.querySelectorAll('[data-calc-eco]').forEach(el => el.addEventListener('input', updateEco));

  // UBE calculation
  const updateUbe = () => {
    const cervezas = parseFloat(container.querySelector('[data-field="alcohol_cervezas_vino_semana"]')?.value || 0);
    const copas = parseFloat(container.querySelector('[data-field="alcohol_copas_destilados_semana"]')?.value || 0);
    const ubeInput = container.querySelector('[data-field="alcohol_ube_semana"]');
    if (ubeInput) ubeInput.value = cervezas + 2 * copas;
  };
  container.querySelectorAll('[data-calc-ube]').forEach(el => el.addEventListener('input', updateUbe));

  // PROMs totals
  const updateProms = () => {
    let dlqiTotal = 0;
    let dlqiAnswered = 0;
    for (let i = 1; i <= DLQI_ITEMS.length; i += 1) {
      const v = container.querySelector(`[data-field="dlqi_q${i}"]`)?.value;
      if (v !== '') { dlqiTotal += parseInt(v, 10) || 0; dlqiAnswered += 1; }
    }
    const dlqiInterp = interpretDlqi(dlqiTotal, dlqiAnswered);
    const dlqiTotalEl = container.querySelector('[data-dlqi-total]');
    if (dlqiTotalEl) dlqiTotalEl.textContent = dlqiTotal;
    const dlqiInterpEl = container.querySelector('[data-dlqi-interpretation]');
    if (dlqiInterpEl) dlqiInterpEl.textContent = dlqiInterp;

    let hsqolTotal = 0;
    let hsqolAnswered = 0;
    for (let i = 1; i <= HSQOL_ITEMS.length; i += 1) {
      const v = container.querySelector(`[data-field="hsqol_q${i}"]`)?.value;
      if (v !== '') {
        const raw = parseInt(v, 10) || 0;
        hsqolTotal += HSQOL_ITEMS[i - 1].reverse ? (4 - raw) : raw;
        hsqolAnswered += 1;
      }
    }
    const hsqolInterp = interpretHsqol(hsqolTotal, hsqolAnswered);
    const hsqolTotalEl = container.querySelector('[data-hsqol-total]');
    if (hsqolTotalEl) hsqolTotalEl.textContent = hsqolTotal;
    const hsqolInterpEl = container.querySelector('[data-hsqol-interpretation]');
    if (hsqolInterpEl) hsqolInterpEl.textContent = hsqolInterp;

    const updateEvaCard = (field, selector) => {
      const value = container.querySelector(`[data-field="${field}"]`)?.value || '0';
      const el = container.querySelector(selector);
      if (el) el.textContent = value;
    };
    updateEvaCard('eva_dolor', '[data-eva-total]');
    updateEvaCard('eva_prurito', '[data-eva-prurito-total]');
    updateEvaCard('eva_olor', '[data-eva-olor-total]');
    updateEvaCard('eva_supuracion', '[data-eva-supuracion-total]');

    // Morisky
    const expected = ['no', 'si', 'no', 'no'];
    const answers = [1, 2, 3, 4].map(q => container.querySelector(`[data-field="seguimiento_morisky_q${q}"]`)?.value);
    const complete = answers.every(a => a);
    const adherente = complete && answers.every((a, i) => a === expected[i]);
    const moriskyEl = container.querySelector('[data-morisky-result]');
    if (moriskyEl) {
      if (!complete) moriskyEl.textContent = 'Cuestionario incompleto';
      else moriskyEl.textContent = adherente ? 'Morisky-Green: adherente' : 'Morisky-Green: no adherente';
    }
  };
  container.querySelectorAll('[data-field]').forEach(el => {
    const field = el.getAttribute('data-field');
    if (/^dlqi_q|^hsqol_q|^seguimiento_morisky_q/.test(field) || /^eva_/.test(field)) {
      el.addEventListener('change', updateProms);
      el.addEventListener('input', updateProms);
    }
  });
  container.querySelectorAll('[data-calc-eva]').forEach(el => el.addEventListener('input', updateProms));
  updateProms();

  // Therapy rows
  bindTherapyRows(container);

  // Comorbidity toggles
  container.querySelectorAll('[data-comorb-key]').forEach(item => {
    item.addEventListener('click', () => item.classList.toggle('active'));
  });

  // Seguimiento decision
  container.querySelectorAll('[data-decision]').forEach(btn => {
    btn.addEventListener('click', () => {
      const decision = btn.getAttribute('data-decision');
      const hidden = container.querySelector('[data-field="seguimiento_decision"]');
      if (hidden) hidden.value = decision;
      container.querySelectorAll('[data-decision]').forEach(b => b.classList.toggle('active', b === btn));
      container.querySelectorAll('[data-panel]').forEach(p => {
        p.classList.toggle('hidden', p.getAttribute('data-panel') !== decision);
      });
    });
  });
}

function bindTherapyRows(container) {
  container.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-therapy-add]');
    const removeBtn = e.target.closest('[data-therapy-remove]');
    if (!addBtn && !removeBtn) return;

    const group = e.target.closest('[data-therapy-group]');
    const rowsContainer = group?.querySelector('[data-therapy-rows]');
    if (!rowsContainer) return;

    const groupKey = group.getAttribute('data-therapy-group');
    const groupDef = THERAPY_GROUPS.find(g => g.key === groupKey);

    if (addBtn) {
      rowsContainer.insertAdjacentHTML('beforeend', therapyRowHtml(groupDef, rowsContainer.children.length));
    } else if (removeBtn) {
      const row = removeBtn.closest('[data-therapy-row]');
      if (row && rowsContainer.children.length > 1) row.remove();
    }
  });
}

function interpretDlqi(total, answered) {
  if (!answered) return 'No evaluado';
  if (answered < DLQI_ITEMS.length) return 'Cuestionario incompleto';
  if (total <= 1) return 'Sin impacto';
  if (total <= 5) return 'Impacto leve';
  if (total <= 10) return 'Impacto moderado';
  if (total <= 20) return 'Impacto alto';
  return 'Impacto muy alto';
}

function interpretHsqol(total, answered) {
  if (!answered) return 'No evaluado';
  if (answered < HSQOL_ITEMS.length) return 'Cuestionario incompleto';
  if (total <= 24) return 'Impacto bajo';
  if (total <= 31) return 'Impacto leve';
  if (total <= 43) return 'Impacto moderado';
  return 'Impacto alto';
}

export function collectFormData(container, opts = {}) {
  const payload = {};

  // Simple fields
  const siNoSelectFields = new Set([
    'antecedentes_familiares_hs',
    'fumador',
    'flares_requirio_urgencias',
    'flares_requirio_cirugia',
    'flares_requirio_antibioticos'
  ]);
  container.querySelectorAll('[data-field]').forEach(el => {
    const key = el.getAttribute('data-field');
    if (key === 'cirugia_aplica') return;
    if (el.type === 'checkbox') {
      payload[key] = el.checked ? 'Si' : 'No';
    } else {
      payload[key] = (el.value || '').trim();
    }
    if (siNoSelectFields.has(key)) {
      const lower = String(payload[key] || '').toLowerCase();
      payload[key] = lower === 'si' ? 'Si' : lower === 'no' ? 'No' : payload[key];
    }
  });

  // Comorbidities
  COMORBIDITY_FIELDS.forEach(f => {
    const item = container.querySelector(`[data-comorb-key="${f.key}"]`);
    payload[f.key] = item?.classList.contains('active') ? 'Si' : 'No';
  });

  // Derived totals
  const ihsTotals = { n: 0, a: 0, f: 0, fd: 0 };
  for (const region of IHS_REGIONS) {
    for (const type of IHS_LESION_TYPES) {
      ihsTotals[type.key] += parseInt(payload[`ihs_${region.key}_${type.key}`] || 0, 10);
    }
  }
  payload.ihs_total_n = ihsTotals.n;
  payload.ihs_total_a = ihsTotals.a;
  payload.ihs_total_f = ihsTotals.f;
  payload.ihs_total_fd = ihsTotals.fd;
  payload.ihs4_total = DERIVED.ihs4Score(ihsTotals);
  payload.ihs4_gravedad = DERIVED.ihs4Grade(payload.ihs4_total);

  const ecoTotals = {
    n: parseInt(payload.eco_nodulos || 0, 10),
    a: parseInt(payload.eco_abscesos || 0, 10),
    f: parseInt(payload.eco_fistulas || 0, 10)
  };
  payload.eco_ihs4 = DERIVED.ihs4Score(ecoTotals);
  payload.eco_gravedad = DERIVED.ihs4Grade(payload.eco_ihs4);

  payload.imc = DERIVED.imc({ pesoKg: payload.peso_kg, tallaM: payload.talla_m });

  // Backward-compatible tobacco column
  payload.fumador = payload.fumador_estado === 'Fumador' ? 'Si' : 'No';

  // Derived alcohol UBE
  const cervezas = parseFloat(payload.alcohol_cervezas_vino_semana || 0);
  const copas = parseFloat(payload.alcohol_copas_destilados_semana || 0);
  payload.alcohol_ube_semana = cervezas + 2 * copas;

  let dlqiTotal = 0;
  let dlqiAnswered = 0;
  for (let i = 1; i <= DLQI_ITEMS.length; i += 1) {
    const v = payload[`dlqi_q${i}`];
    if (v !== '') { dlqiTotal += parseInt(v, 10) || 0; dlqiAnswered += 1; }
  }
  payload.dlqi_total = dlqiTotal;
  payload.dlqi_interpretacion = interpretDlqi(dlqiTotal, dlqiAnswered);

  let hsqolTotal = 0;
  let hsqolAnswered = 0;
  for (let i = 1; i <= HSQOL_ITEMS.length; i += 1) {
    const v = payload[`hsqol_q${i}`];
    if (v !== '') {
      const raw = parseInt(v, 10) || 0;
      hsqolTotal += HSQOL_ITEMS[i - 1].reverse ? (4 - raw) : raw;
      hsqolAnswered += 1;
    }
  }
  payload.hsqol_total = hsqolTotal;
  payload.hsqol_interpretacion = interpretHsqol(hsqolTotal, hsqolAnswered);

  // Therapy mapping
  const therapyPrefix = opts.therapyPrefix || 'tx_primera';
  mapTherapyToPayload(container, therapyPrefix, payload);

  // Surgery applicability
  const anySurgery = SURGERY_FIELDS.some(f => payload[f.checkbox] === 'Si');
  payload.cirugia_aplica = anySurgery ? 'Si' : 'No';

  // CIE default
  payload.cie = 'L73.2';
  payload.hoja_destino = SHEET_KEYS[payload.consulta] || payload.consulta;

  return payload;
}

function mapTherapyToPayload(container, prefix, payload) {
  for (const group of THERAPY_GROUPS) {
    const groupEl = container.querySelector(`[data-therapy-prefix="${prefix}"][data-therapy-group="${group.key}"]`);
    const entries = [];
    if (groupEl) {
      groupEl.querySelectorAll('[data-therapy-row]').forEach(row => {
        const drug = row.querySelector('.therapy-drug')?.value.trim() || '';
        const posology = row.querySelector('.therapy-posology')?.value.trim() || '';
        if (drug || posology) entries.push({ drug, posology });
      });
    }
    const top = entries.slice(0, THERAPY_SLOT_LIMIT);
    const rest = entries.slice(THERAPY_SLOT_LIMIT);
    for (let i = 1; i <= THERAPY_SLOT_LIMIT; i += 1) {
      const entry = top[i - 1] || { drug: '', posology: '' };
      payload[`${prefix}_${group.key}_farmaco_${i}`] = entry.drug;
      payload[`${prefix}_${group.key}_posologia_${i}`] = entry.posology;
    }
    payload[`${prefix}_${group.key}_otros`] = rest.map(e => `${e.drug}|${e.posology}`).join(' || ');
  }
}

export { validatePayload as validateFormData };

export function getNushaOptions(base) {
  if (!base) return [];
  const all = [...(base.monografica || []), ...(base.multidisciplinar || [])];
  const set = new Set(all.map(r => (r.nusha || '').toUpperCase()).filter(Boolean));
  return Array.from(set).sort();
}

function parseDate(value) {
  if (!value) return Number.NaN;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? Number.NaN : d.getTime();
}

export function findLatestVisit(nusha, currentDate, base) {
  if (!base || !nusha) return null;
  const all = [...(base.monografica || []), ...(base.multidisciplinar || [])];
  const id = nusha.toUpperCase();
  const candidates = all.filter(r => (r.nusha || '').toUpperCase() === id);
  if (!candidates.length) return null;
  const currentTs = parseDate(currentDate);
  const scoped = Number.isNaN(currentTs)
    ? candidates
    : candidates.filter(r => {
        const ts = parseDate(r.fecha_visita);
        return !Number.isNaN(ts) && ts < currentTs;
      });
  scoped.sort((a, b) => {
    const ta = parseDate(a.fecha_visita);
    const tb = parseDate(b.fecha_visita);
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return tb - ta;
  });
  return scoped[0] || null;
}

export function formatTreatmentSummary(row) {
  if (!row) return '';
  const hasSeguimiento = buildTherapyFieldNames('tx_seguimiento').some(k => String(row[k] || '').trim() !== '');
  const prefix = hasSeguimiento ? 'tx_seguimiento' : 'tx_primera';
  const chunks = [];
  for (const group of THERAPY_GROUPS) {
    const entries = [];
    for (let i = 1; i <= THERAPY_SLOT_LIMIT; i += 1) {
      const drug = String(row[`${prefix}_${group.key}_farmaco_${i}`] || '').trim();
      const posology = String(row[`${prefix}_${group.key}_posologia_${i}`] || '').trim();
      if (drug || posology) entries.push(posology ? `${drug} (${posology})` : drug);
    }
    const others = String(row[`${prefix}_${group.key}_otros`] || '').trim();
    if (others) {
      others.split('||').forEach(chunk => {
        const [drug, posology] = chunk.split('|').map(s => s.trim());
        if (drug || posology) entries.push(posology ? `${drug} (${posology})` : drug);
      });
    }
    if (entries.length) chunks.push(`${group.label}: ${entries.join('; ')}`);
  }
  return chunks.join(' | ');
}

export function prefillFromBase(nusha, container, base, mode) {
  const row = findLatestVisit(nusha, container.querySelector('[data-field="fecha_visita"]')?.value, base);
  if (!row) return;

  const set = (field, value) => {
    const el = container.querySelector(`[data-field="${field}"]`);
    if (!el) return;
    if (el.type === 'checkbox') {
      el.checked = String(value).toLowerCase() === 'si' || String(value) === '1' || String(value).toLowerCase() === 'yes';
    } else {
      el.value = value ?? '';
    }
  };

  set('antecedentes_familiares_hs', row.antecedentes_familiares_hs);
  set('anio_inicio', row.anio_inicio);
  set('edad_inicio', row.edad_inicio);
  set('nivel_educativo', row.nivel_educativo);
  set('fumador_estado', row.fumador_estado);
  set('exfumador_anios', row.exfumador_anios);
  set('cigarros_dia', row.cigarros_dia);
  set('anios_fumador', row.anios_fumador);
  set('sexo_nacimiento', row.sexo_nacimiento);
  set('anio_diagnostico', row.anio_diagnostico);
  set('peso_kg', row.peso_kg);
  set('talla_m', row.talla_m);
  set('imc', row.imc);
  set('alcohol_consume', row.alcohol_consume);
  set('alcohol_cervezas_vino_semana', row.alcohol_cervezas_vino_semana);
  set('alcohol_copas_destilados_semana', row.alcohol_copas_destilados_semana);
  set('alcohol_ube_semana', row.alcohol_ube_semana);
  set('flares_total_ultimo_anio', row.flares_total_ultimo_anio);
  set('flares_desde_ultima_visita', row.flares_desde_ultima_visita);
  set('flares_requirio_urgencias', row.flares_requirio_urgencias);
  set('flares_requirio_cirugia', row.flares_requirio_cirugia);
  set('flares_requirio_antibioticos', row.flares_requirio_antibioticos);
  set('eva_prurito', row.eva_prurito);
  set('eva_olor', row.eva_olor);
  set('eva_supuracion', row.eva_supuracion);
  set('eco_hallazgos', row.eco_hallazgos);

  for (const f of COMORBIDITY_FIELDS) {
    const item = container.querySelector(`[data-comorb-key="${f.key}"]`);
    const active = String(row[f.key] || '').toLowerCase() === 'si' || String(row[f.key]) === '1' || String(row[f.key]).toLowerCase() === 'yes';
    item?.classList.toggle('active', active);
  }
  set('otras_comorbilidades', row.otras_comorbilidades);

  if (mode === 'seguimiento') {
    const summary = formatTreatmentSummary(row);
    set('seguimiento_tratamiento_previo', summary);
    set('seguimiento_tratamiento_actual', summary);
  }

  // Re-run derived updates
  container.dispatchEvent(new Event('input'));
}

export function resetForm(container) {
  container.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  container.querySelectorAll('[data-comorb-key]').forEach(el => el.classList.remove('active'));
  container.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  container.querySelectorAll('.decision-btn').forEach(btn => btn.classList.remove('active'));
  container.querySelectorAll('[data-panel]').forEach(p => p.classList.add('hidden'));
  container.querySelectorAll('[data-therapy-rows]').forEach(rows => {
    rows.innerHTML = therapyRowHtml(THERAPY_GROUPS.find(g => g.key === rows.getAttribute('data-therapy-rows')), 0);
  });
  // Trigger updates
  container.querySelectorAll('[data-field]').forEach(el => el.dispatchEvent(new Event('input')));
}
