import { store } from '../store.js';
import { getAllRows } from '../patient/search.js';
import {
  computeKpis,
  severityCounts,
  visitTypeCounts,
  therapyCounts,
  surgeryCounts,
  topComorbidities
} from './kpis.js';
import { buildFilterOptions, applyFilters } from './filters.js';
import { buildSummaryRows, getSummaryColumns } from './list.js';
import { downloadFilteredCsv } from './export.js';
import { ChartManager } from '../chart/chart_adapter.js';
import { barOptions, doughnutOptions, CHART_COLORS } from '../chart/themes.js';
import { escapeHtml, normalizeText } from '../common/utils.js';

const ICON = (id) => `
  <svg class="icon" aria-hidden="true" width="20" height="20">
    <use href="vendor/lucide-sprite.svg#${id}"></use>
  </svg>
`;

function kpiCard(label, value, iconId, colorClass = 'primary') {
  const colorMap = {
    primary: 'var(--color-primary-800)',
    secondary: 'var(--color-secondary-800)',
    accent: 'var(--color-accent-600)',
    danger: 'var(--color-danger-600)',
    warning: 'var(--color-warning-600)'
  };
  return `
    <div class="kpi-card" style="border-left-color:${colorMap[colorClass] || colorMap.primary};">
      <div class="kpi-card__icon">${ICON(iconId)}</div>
      <div class="kpi-card__value">${escapeHtml(String(value))}</div>
      <div class="kpi-card__label">${escapeHtml(label)}</div>
    </div>
  `;
}

function sectionCard(title, iconId, bodyHtml) {
  return `
    <div class="card" style="margin-bottom:var(--space-5);">
      <h2 class="card__title">${ICON(iconId)} ${escapeHtml(title)}</h2>
      ${bodyHtml}
    </div>
  `;
}

function emptyState(message) {
  return `<div class="empty-state" style="padding:var(--space-12);">
    <svg class="empty-state__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
    <div class="empty-state__title">Sin base cargada</div>
    <p>${escapeHtml(message)}</p>
  </div>`;
}

export function createServiceDashboardModule() {
  let root = null;
  let chartManager = null;
  let currentFilters = {};

  function getRows() {
    const base = store.getBase();
    return base ? getAllRows(base) : [];
  }

  function renderFilters(rows) {
    const options = buildFilterOptions(rows);
    const biologicos = options.biologicos.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    const antibioticos = options.antibioticos.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    return `
      <div class="filter-bar" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-4);margin-bottom:var(--space-5);">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Tipo visita</label>
          <select class="form-select" data-filter="tipoVisita">
            <option value="">Todas</option>
            <option value="primera">Primera</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Gravedad</label>
          <select class="form-select" data-filter="gravedad">
            <option value="">Todas</option>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="grave">Grave</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Biologico</label>
          <select class="form-select" data-filter="biologico">
            <option value="">Todos</option>
            ${biologicos}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Antibiotico oral</label>
          <select class="form-select" data-filter="antibiotico">
            <option value="">Todos</option>
            ${antibioticos}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Cirugia</label>
          <select class="form-select" data-filter="cirugia">
            <option value="">Todas</option>
            <option value="si">Si</option>
            <option value="no">No</option>
            <option value="dermatologia">Dermatologia</option>
            <option value="general">General</option>
            <option value="plastica">Plastica</option>
            <option value="ginecologia">Ginecologia</option>
            <option value="urologia">Urologia</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Desde</label>
          <input type="date" class="form-input" data-filter="dateFrom">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Hasta</label>
          <input type="date" class="form-input" data-filter="dateTo">
        </div>
      </div>
    `;
  }

  function renderKpis(rows) {
    const kpis = computeKpis(rows);
    const severity = severityCounts(rows);
    return `
      <div class="kpi-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-4);margin-bottom:var(--space-5);">
        ${kpiCard('Pacientes unicos', kpis.uniquePatients, 'users', 'primary')}
        ${kpiCard('Visitas totales', kpis.totalVisits, 'clipboard-list', 'secondary')}
        ${kpiCard('Primeras visitas', kpis.primeras, 'user-plus', 'accent')}
        ${kpiCard('Seguimientos', kpis.seguimientos, 'activity', 'accent')}
        ${kpiCard('IHS-4 medio', kpis.ihs4Mean, 'bar-chart-2', 'primary')}
        ${kpiCard('Graves', kpis.graves, 'alert-triangle', 'danger')}
        ${kpiCard('Con cirugia', kpis.conCirugia, 'scissors', 'warning')}
        ${kpiCard('Con biologico', kpis.conBiologico, 'pill', 'primary')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-5);margin-bottom:var(--space-5);">
        <div class="chart-wrapper" style="height:220px;"><canvas id="severity-chart"></canvas></div>
        <div class="chart-wrapper" style="height:220px;"><canvas id="visit-type-chart"></canvas></div>
      </div>
      <div class="severity-legend" style="display:flex;gap:var(--space-4);justify-content:center;font-size:var(--text-sm);color:var(--color-text-muted);">
        <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${CHART_COLORS.leve};margin-right:var(--space-2);"></span>Leve: ${severity.Leve}</span>
        <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${CHART_COLORS.moderado};margin-right:var(--space-2);"></span>Moderado: ${severity.Moderado}</span>
        <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${CHART_COLORS.grave};margin-right:var(--space-2);"></span>Grave: ${severity.Grave}</span>
      </div>
    `;
  }

  function renderCharts(rows) {
    if (!chartManager || !rows.length) return;
    const severity = severityCounts(rows);
    const visits = visitTypeCounts(rows);
    chartManager.create('severity-chart', 'doughnut', {
      labels: ['Leve', 'Moderado', 'Grave'],
      datasets: [{
        data: [severity.Leve, severity.Moderado, severity.Grave],
        backgroundColor: [CHART_COLORS.leve, CHART_COLORS.moderado, CHART_COLORS.grave]
      }]
    }, doughnutOptions());
    chartManager.create('visit-type-chart', 'bar', {
      labels: ['Primera', 'Seguimiento'],
      datasets: [{
        data: [visits.Primera, visits.Seguimiento],
        backgroundColor: [CHART_COLORS.primary, CHART_COLORS.info]
      }]
    }, barOptions());
  }

  function renderList(rows) {
    const summary = buildSummaryRows(rows);
    const columns = getSummaryColumns();
    if (!summary.length) return sectionCard('Listado filtrado', 'list', '<p>No hay registros que coincidan con los filtros.</p>');
    const headers = columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join('');
    const body = summary.map(row => {
      const cells = columns.map(c => `<td>${escapeHtml(String(row[c.key] ?? ''))}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return sectionCard('Listado filtrado', 'list', `
      <div class="table-wrap" style="overflow-x:auto;margin-bottom:var(--space-4);">
        <table class="data-table">
          <thead><tr>${headers}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <button type="button" class="btn btn--secondary" data-export-csv>
        ${ICON('download')}
        Descargar CSV secundario
      </button>
    `);
  }

  function renderTherapyAndComorbidity(rows) {
    const therapy = therapyCounts(rows);
    const surgery = surgeryCounts(rows);
    const comorb = topComorbidities(rows);
    const therapyBody = `
      <div class="chart-wrapper" style="height:220px;"><canvas id="therapy-chart"></canvas></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);text-align:center;">
        ${Object.entries(therapy).map(([k, v]) => `<div class="kpi-card" style="border-left-color:var(--color-primary-800);"><div class="kpi-card__value">${v}</div><div class="kpi-card__label">${escapeHtml(k)}</div></div>`).join('')}
      </div>
    `;
    const surgeryBody = surgery.length
      ? `<ul style="list-style:none;padding:0;margin:0;display:grid;gap:var(--space-2);">${surgery.map(s => `<li style="display:flex;justify-content:space-between;padding:var(--space-3);background:var(--color-surface-raised);border-radius:var(--radius-lg);"><span>${escapeHtml(s.label)}</span><strong>${s.count}</strong></li>`).join('')}</ul>`
      : '<p>No hay cirugias registradas.</p>';
    const comorbBody = comorb.length
      ? `<ul style="list-style:none;padding:0;margin:0;display:grid;gap:var(--space-2);">${comorb.map(c => `<li style="display:flex;justify-content:space-between;padding:var(--space-3);background:var(--color-surface-raised);border-radius:var(--radius-lg);"><span>${escapeHtml(c.label)}</span><strong>${c.count}</strong></li>`).join('')}</ul>`
      : '<p>No hay comorbilidades registradas.</p>';

    setTimeout(() => {
      if (chartManager) {
        chartManager.create('therapy-chart', 'bar', {
          labels: Object.keys(therapy),
          datasets: [{ data: Object.values(therapy), backgroundColor: [CHART_COLORS.primary, CHART_COLORS.info, CHART_COLORS.accent] }]
        }, barOptions());
      }
    }, 0);

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--space-5);margin-bottom:var(--space-5);">
        ${sectionCard('Tratamientos', 'pill', therapyBody)}
        ${sectionCard('Cirugia por especialidad', 'scissors', surgeryBody)}
        ${sectionCard('Comorbilidades principales', 'stethoscope', comorbBody)}
      </div>
    `;
  }

  function readFiltersFromUi() {
    const next = {};
    root.querySelectorAll('[data-filter]').forEach(el => {
      const key = el.getAttribute('data-filter');
      next[key] = normalizeText(el.value);
    });
    return next;
  }

  function applyFiltersToUi() {
    root.querySelectorAll('[data-filter]').forEach(el => {
      const key = el.getAttribute('data-filter');
      el.value = currentFilters[key] || '';
    });
  }

  function render() {
    if (!root) return;
    const allRows = getRows();
    if (!allRows.length) {
      root.innerHTML = emptyState('Carga una base de datos para ver los indicadores agregados del servicio.');
      return;
    }

    const filteredRows = applyFilters(allRows, currentFilters);

    root.innerHTML = `
      <div class="card" style="margin-bottom:var(--space-5);">
        <h2 class="card__title">${ICON('layout-dashboard')} Cuadro de mando</h2>
        <p class="card__subtitle">Indicadores agregados de la poblacion con HS cargada en memoria.</p>
        ${renderFilters(allRows)}
        ${renderKpis(filteredRows)}
      </div>
      ${renderTherapyAndComorbidity(filteredRows)}
      ${renderList(filteredRows)}
    `;

    applyFiltersToUi();
    renderCharts(filteredRows);

    root.querySelectorAll('[data-filter]').forEach(el => {
      el.addEventListener('change', () => {
        currentFilters = readFiltersFromUi();
        render();
      });
    });

    const exportBtn = root.querySelector('[data-export-csv]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        downloadFilteredCsv(filteredRows);
      });
    }
  }

  return {
    title: 'Cuadro de mando',
    render(container) {
      root = container;
      chartManager = new ChartManager();
      render();
      this._unsubscribe = store.subscribe((eventType) => {
        if (eventType === 'base-loaded' || eventType === 'base-cleared') {
          currentFilters = {};
          render();
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
