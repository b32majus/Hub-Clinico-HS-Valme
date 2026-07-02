import { store } from '../store.js';
import { DASHBOARD_MAP, COMORBIDITY_FIELDS, SURGERY_FIELDS } from '../schema/hs_schema.js';
import { getUniquePatients, getPatientRows } from './search.js';
import { escapeHtml, formatDate, parseNumber, normalizeText } from '../common/utils.js';
import { formatTreatmentSummary, getAllTreatmentEntries, hasAnySurgery } from '../common/therapy.js';
import { ChartManager } from '../chart/chart_adapter.js';
import { lineOptions, promsLineOptions, CHART_COLORS } from '../chart/themes.js';

const ICON = (id) => `
  <svg class="icon" aria-hidden="true" width="20" height="20">
    <use href="vendor/lucide-sprite.svg#${id}"></use>
  </svg>
`;

function sectionCard(title, iconId, bodyHtml) {
  return `
    <div class="card" style="margin-bottom:var(--space-5);">
      <h2 class="card__title">${ICON(iconId)} ${escapeHtml(title)}</h2>
      ${bodyHtml}
    </div>
  `;
}

function emptySection(message) {
  return `<div class="empty-state" style="padding:var(--space-8);">
    <svg class="empty-state__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
    <p>${escapeHtml(message)}</p>
  </div>`;
}

function renderValue(value) {
  if (value == null || value === '') return '<span style="color:var(--color-text-muted);">—</span>';
  return escapeHtml(String(value));
}

function renderTable(rows, columns) {
  if (!rows.length) return emptySection('No hay registros para este paciente.');
  const headers = columns.map(c => `<th>${escapeHtml(c.label || c.key)}</th>`).join('');
  const body = rows.map(row => {
    const cells = columns.map(col => {
      const raw = row[col.key];
      let text = raw;
      if (col.format) text = col.format(raw);
      else if (col.compute) text = col.compute(row);
      return `<td>${renderValue(text)}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `
    <div class="table-wrap" style="overflow-x:auto;">
      <table class="data-table">
        <thead><tr>${headers}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

const EVOLUTION_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'ihs4_total', label: 'IHS-4' },
  { key: 'ihs4_gravedad', label: 'Gravedad' },
  { key: 'eco_ihs4', label: 'Eco IHS-4' },
  { key: 'eco_gravedad', label: 'Eco gravedad' }
];

const WEIGHT_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'peso_kg', label: 'Peso (kg)' },
  { key: 'talla_m', label: 'Talla (m)' },
  { key: 'imc', label: 'IMC' }
];

const PROMS_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'dlqi_total', label: 'DLQI' },
  { key: 'dlqi_interpretacion', label: 'DLQI interp.' },
  { key: 'hsqol_total', label: 'HSQoL' },
  { key: 'hsqol_interpretacion', label: 'HSQoL interp.' },
  { key: 'eva_dolor', label: 'EVA dolor' },
  { key: 'eva_prurito', label: 'EVA prurito' },
  { key: 'eva_olor', label: 'EVA olor' },
  { key: 'eva_supuracion', label: 'EVA supuracion' }
];

const FLARES_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'flares_total_ultimo_anio', label: 'Brotes ultimo año' },
  { key: 'flares_desde_ultima_visita', label: 'Brotes desde ultima visita' },
  { key: 'flares_requirio_urgencias', label: 'Requirio urgencias' },
  { key: 'flares_requirio_cirugia', label: 'Requirio cirugia' },
  { key: 'flares_requirio_antibioticos', label: 'Requirio antibioticos' }
];

const ULTRASOUND_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'eco_nodulos', label: 'Nodulos' },
  { key: 'eco_abscesos', label: 'Abscesos' },
  { key: 'eco_fistulas', label: 'Fistulas' },
  { key: 'eco_ihs4', label: 'Eco IHS-4' },
  { key: 'eco_gravedad', label: 'Eco gravedad' },
  { key: 'eco_hallazgos', label: 'Hallazgos' }
];

const TOXIC_HABITS_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'fumador_estado', label: 'Tabaco' },
  { key: 'exfumador_anios', label: 'Años sin fumar' },
  { key: 'alcohol_consume', label: 'Alcohol' },
  { key: 'alcohol_cervezas_vino_semana', label: 'Cervezas/vino semana' },
  { key: 'alcohol_copas_destilados_semana', label: 'Copas destilados semana' },
  { key: 'alcohol_ube_semana', label: 'UBE semana' }
];

const SURGERY_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  { key: 'cirugia_aplica', label: 'Cirugia aplica' },
  ...SURGERY_FIELDS.map(f => ({ key: f.checkbox, label: f.label }))
];

const COMORBIDITY_COLUMNS = [
  { key: 'fecha_visita', label: 'Fecha', format: formatDate },
  ...COMORBIDITY_FIELDS.map(f => ({ key: f.key, label: f.label })),
  { key: 'otras_comorbilidades', label: 'Otras' }
];

function renderTreatmentList(rows) {
  if (!rows.length) return emptySection('No hay registros para este paciente.');
  const items = rows.map(row => {
    const summary = formatTreatmentSummary(row);
    const date = formatDate(row.fecha_visita);
    return `<div class="timeline-item">
      <div class="timeline-item__date">${escapeHtml(date || 'Sin fecha')}</div>
      <div class="timeline-item__body">${summary ? escapeHtml(summary) : '<span style="color:var(--color-text-muted);">Sin tratamiento registrado</span>'}</div>
    </div>`;
  }).join('');
  return `<div class="timeline">${items}</div>`;
}

export function createLongitudinalView() {
  let root = null;
  let selectedNusha = null;
  let chartManager = null;

  function getRows() {
    return selectedNusha ? getPatientRows(store.getBase(), selectedNusha) : [];
  }

  function renderSearch() {
    const base = store.getBase();
    const patients = base ? getUniquePatients(base) : [];
    const options = patients.map(p =>
      `<option value="${escapeHtml(p.nusha)}" ${p.nusha === selectedNusha ? 'selected' : ''}>${escapeHtml(p.nusha)}${p.name ? ` — ${escapeHtml(p.name)}` : ''}</option>`
    ).join('');
    return `
      <div class="card" style="margin-bottom:var(--space-5);">
        <h2 class="card__title">${ICON('search')} Buscar paciente</h2>
        <p class="card__subtitle">Selecciona un paciente por NUSHA para ver su evolucion longitudinal.</p>
        <div style="display:flex;gap:var(--space-3);align-items:flex-end;max-width:480px;">
          <div class="form-group" style="flex:1;margin-bottom:0;">
            <label class="form-label">Paciente</label>
            <select class="form-select" data-patient-select>
              <option value="">${base ? 'Seleccione un paciente' : 'Cargue una base primero'}</option>
              ${options}
            </select>
          </div>
        </div>
      </div>
    `;
  }

  function renderEvolution(rows) {
    const chartId = 'patient-evolution-chart';
    const body = `
      <div class="chart-wrapper" style="height:280px;">
        <canvas id="${chartId}"></canvas>
      </div>
      ${renderTable(rows, EVOLUTION_COLUMNS)}
    `;
    setTimeout(() => renderEvolutionChart(chartId, rows), 0);
    return sectionCard(DASHBOARD_MAP.evolution.label, 'activity', body);
  }

  function renderEvolutionChart(canvasId, rows) {
    if (!chartManager || !rows.length) return;
    const labels = rows.map(r => formatDate(r.fecha_visita) || '');
    const ihs4 = rows.map(r => parseNumber(r.ihs4_total));
    const eco = rows.map(r => parseNumber(r.eco_ihs4));
    chartManager.create(canvasId, 'line', {
      labels,
      datasets: [
        { label: 'IHS-4', data: ihs4, borderColor: CHART_COLORS.primary, backgroundColor: CHART_COLORS.primary, tension: 0.2 },
        { label: 'Eco IHS-4', data: eco, borderColor: CHART_COLORS.info, backgroundColor: CHART_COLORS.info, borderDash: [5, 5], tension: 0.2 }
      ]
    }, lineOptions());
  }

  function renderTreatments(rows) {
    return sectionCard(DASHBOARD_MAP.treatments.label, 'pill', renderTreatmentList(rows));
  }

  function renderWeight(rows) {
    const chartId = 'patient-weight-chart';
    const body = `
      <div class="chart-wrapper" style="height:260px;">
        <canvas id="${chartId}"></canvas>
      </div>
      ${renderTable(rows, WEIGHT_COLUMNS)}
    `;
    setTimeout(() => renderWeightChart(chartId, rows), 0);
    return sectionCard(DASHBOARD_MAP.weight.label, 'scale', body);
  }

  function renderWeightChart(canvasId, rows) {
    if (!chartManager || !rows.length) return;
    const labels = rows.map(r => formatDate(r.fecha_visita) || '');
    const weights = rows.map(r => parseNumber(r.peso_kg));
    chartManager.create(canvasId, 'line', {
      labels,
      datasets: [
        { label: 'Peso (kg)', data: weights, borderColor: CHART_COLORS.secondary, backgroundColor: CHART_COLORS.secondary, tension: 0.2 }
      ]
    }, lineOptions());
  }

  function renderProms(rows) {
    const chartId = 'patient-proms-chart';
    const body = `
      <div class="chart-wrapper" style="height:280px;">
        <canvas id="${chartId}"></canvas>
      </div>
      ${renderTable(rows, PROMS_COLUMNS)}
    `;
    setTimeout(() => renderPromsChart(chartId, rows), 0);
    return sectionCard(DASHBOARD_MAP.proms.label, 'heart-pulse', body);
  }

  function renderPromsChart(canvasId, rows) {
    if (!chartManager || !rows.length) return;
    const labels = rows.map(r => formatDate(r.fecha_visita) || '');
    chartManager.create(canvasId, 'line', {
      labels,
      datasets: [
        { label: 'DLQI', data: rows.map(r => parseNumber(r.dlqi_total)), borderColor: CHART_COLORS.warning, backgroundColor: CHART_COLORS.warning, yAxisID: 'y', tension: 0.2 },
        { label: 'HSQoL', data: rows.map(r => parseNumber(r.hsqol_total)), borderColor: CHART_COLORS.accent, backgroundColor: CHART_COLORS.accent, yAxisID: 'y', tension: 0.2 },
        { label: 'EVA dolor', data: rows.map(r => parseNumber(r.eva_dolor)), borderColor: CHART_COLORS.danger, backgroundColor: CHART_COLORS.danger, yAxisID: 'y1', tension: 0.2 }
      ]
    }, promsLineOptions());
  }

  function renderFlares(rows) {
    const any = rows.some(r =>
      r.flares_total_ultimo_anio !== '' ||
      r.flares_desde_ultima_visita !== '' ||
      r.flares_requirio_urgencias !== '' ||
      r.flares_requirio_cirugia !== '' ||
      r.flares_requirio_antibioticos !== ''
    );
    const body = any ? renderTable(rows, FLARES_COLUMNS) : emptySection('No hay datos de brotes registrados.');
    return sectionCard(DASHBOARD_MAP.flares.label, 'zap', body);
  }

  function renderUltrasound(rows) {
    const any = rows.some(r =>
      r.eco_nodulos !== '' ||
      r.eco_abscesos !== '' ||
      r.eco_fistulas !== '' ||
      r.eco_ihs4 !== '' ||
      r.eco_hallazgos !== ''
    );
    const body = any ? renderTable(rows, ULTRASOUND_COLUMNS) : emptySection('No hay datos de ecografia registrados.');
    return sectionCard(DASHBOARD_MAP.ultrasound.label, 'scan', body);
  }

  function renderToxicHabits(rows) {
    const any = rows.some(r => r.fumador_estado !== '' || r.alcohol_consume !== '');
    const body = any ? renderTable(rows, TOXIC_HABITS_COLUMNS) : emptySection('No hay habitos toxicos registrados.');
    return sectionCard(DASHBOARD_MAP.toxicHabits.label, 'cigarette', body);
  }

  function renderSurgery(rows) {
    const any = rows.some(r => hasAnySurgery(r));
    const body = any ? renderTable(rows, SURGERY_COLUMNS) : emptySection('Este paciente no tiene cirugia registrada.');
    return sectionCard(DASHBOARD_MAP.surgery.label, 'scissors', body);
  }

  function renderComorbidities(rows) {
    const any = rows.some(r => COMORBIDITY_FIELDS.some(f => normalizeText(r[f.key]).toLowerCase() === 'si'));
    const body = any ? renderTable(rows, COMORBIDITY_COLUMNS) : emptySection('Este paciente no tiene comorbilidades registradas.');
    return sectionCard(DASHBOARD_MAP.comorbidities.label, 'stethoscope', body);
  }

  function renderDashboard() {
    if (!root) return;
    const rows = getRows();
    const html = [
      renderSearch(),
      selectedNusha ? renderEvolution(rows) : '',
      selectedNusha ? renderTreatments(rows) : '',
      selectedNusha ? renderWeight(rows) : '',
      selectedNusha ? renderProms(rows) : '',
      selectedNusha ? renderFlares(rows) : '',
      selectedNusha ? renderUltrasound(rows) : '',
      selectedNusha ? renderToxicHabits(rows) : '',
      selectedNusha ? renderSurgery(rows) : '',
      selectedNusha ? renderComorbidities(rows) : ''
    ].join('');

    root.innerHTML = html;

    const select = root.querySelector('[data-patient-select]');
    if (select) {
      select.addEventListener('change', () => {
        selectedNusha = select.value || null;
        renderDashboard();
      });
    }
  }

  return {
    title: 'Ver paciente',
    render(container) {
      root = container;
      chartManager = new ChartManager();
      renderDashboard();
      this._unsubscribe = store.subscribe((eventType) => {
        if (eventType === 'base-loaded' || eventType === 'base-cleared') {
          selectedNusha = null;
          renderDashboard();
        }
      });
    },
    teardown() {
      if (chartManager) chartManager.destroyAll();
      chartManager = null;
      if (this._unsubscribe) this._unsubscribe();
      root = null;
    }
  };
}
