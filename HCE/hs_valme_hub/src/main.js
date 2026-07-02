import './ui/tokens.css';
import './ui/shell.css';
import './ui/components.css';

import * as schema from './schema/hs_schema.js';
import { store } from './store.js';
import { router } from './router.js';
import { loadBase } from './excel/loader.js';

window.ValmeHS = window.ValmeHS || {};
window.ValmeHS.schema = schema;

const ICON = (id) => `
  <svg class="icon" aria-hidden="true" width="20" height="20">
    <use href="vendor/lucide-sprite.svg#${id}"></use>
  </svg>
`;

function renderShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="app-header">
      <div class="app-header__title">
        ${ICON('clipboard-plus')}
        Hub Clinico HS Valme
      </div>
      <div class="app-header__meta">
        <span class="pill">Hospital Universitario de Valme</span>
        <span class="pill">AGS Sur de Sevilla</span>
        <span class="pill pill--accent">Uso asistencial interno</span>
      </div>
    </header>

    <nav class="app-sidebar" aria-label="Navegacion principal">
      <div class="nav-group">
        <div class="nav-group__label">Modulos</div>
        <a class="nav-link" data-route="home" href="#home">
          ${ICON('house')}
          Inicio
        </a>
        <a class="nav-link" data-route="register" href="#register">
          ${ICON('clipboard-plus')}
          Registrar visita
        </a>
        <a class="nav-link" data-route="patient" href="#patient">
          ${ICON('user')}
          Ver paciente
        </a>
        <a class="nav-link" data-route="service" href="#service">
          ${ICON('layout-dashboard')}
          Cuadro de mando
        </a>
      </div>
      <div class="nav-group">
        <div class="nav-group__label">Datos</div>
        <a class="nav-link" data-route="load-base" href="#load-base">
          ${ICON('database')}
          Cargar/actualizar base
        </a>
      </div>
    </nav>

    <main class="app-main">
      <div id="base-status" class="base-status" aria-live="polite">
        <div class="base-status__label">
          <span class="status-dot" id="base-status-dot"></span>
          <span id="base-status-text">Sin base cargada</span>
        </div>
        <div class="base-status__counts">
          <span class="base-status__count">
            ${ICON('file-spreadsheet')}
            Monografica: <strong id="count-monografica">0</strong> registros
          </span>
          <span class="base-status__count">
            ${ICON('file-spreadsheet')}
            Multidisciplinar: <strong id="count-multidisciplinar">0</strong> registros
          </span>
        </div>
        <div class="base-status__action">
          <input type="file" id="base-file-input" class="visually-hidden" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv">
          <button class="btn btn--secondary" id="base-load-btn" type="button">
            ${ICON('upload')}
            Cargar base
          </button>
        </div>
      </div>
      <div class="app-content" id="app-content"></div>
    </main>
  `;
}

function updateBaseStatus() {
  const base = store.getBase();
  const dot = document.getElementById('base-status-dot');
  const text = document.getElementById('base-status-text');
  const countMono = document.getElementById('count-monografica');
  const countMulti = document.getElementById('count-multidisciplinar');

  if (!dot || !text) return;

  if (base) {
    dot.className = 'status-dot status-dot--ok';
    text.textContent = `Base cargada: ${base.fileName}`;
  } else {
    dot.className = 'status-dot';
    text.textContent = 'Sin base cargada';
  }

  if (countMono) countMono.textContent = base ? base.counts.monografica : 0;
  if (countMulti) countMulti.textContent = base ? base.counts.multidisciplinar : 0;
}

function showAlert(container, message, type = 'info') {
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();

  const iconMap = {
    info: 'circle-alert',
    success: 'circle-check',
    warning: 'circle-alert',
    error: 'circle-x'
  };

  const alert = document.createElement('div');
  alert.className = `alert alert--${type}`;
  alert.innerHTML = `
    ${ICON(iconMap[type] || 'circle-alert')}
    <div>${message}</div>
  `;
  container.prepend(alert);
}

async function handleBaseFile(file) {
  const statusContainer = document.getElementById('base-status');
  try {
    const result = await loadBase(file);
    store.setBase(result);
    const warnings = result.warnings.length ? ` Advertencias: ${result.warnings.join('; ')}.` : '';
    showAlert(statusContainer, `Base cargada: ${result.monografica.length} registros Monografica, ${result.multidisciplinar.length} registros Multidisciplinar.${warnings}`, result.warnings.length ? 'warning' : 'success');
    updateBaseStatus();
  } catch (err) {
    // Any invalid/missing-sheet/corrupt workbook must clear prior base state
    // before surfacing the error so downstream modules never read stale data.
    store.clearBase();
    store.setError(err.message);
    showAlert(statusContainer, err.message, 'error');
    updateBaseStatus();
  }
}

function bindBaseLoader() {
  const input = document.getElementById('base-file-input');
  const btn = document.getElementById('base-load-btn');
  if (!input || !btn) return;

  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (file) handleBaseFile(file);
    input.value = '';
  });
}

/* Placeholder modules for Phase 1 */
function emptyStateModule(title, message) {
  return {
    title,
    render(container) {
      container.innerHTML = `
        <div class="card">
          <h2 class="card__title">${title}</h2>
          <p class="card__subtitle">${message}</p>
          <div class="empty-state">
            <svg class="empty-state__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <div class="empty-state__title">Modulo en construccion</div>
            <p>Este modulo se implementa en la siguiente fase del hub.</p>
          </div>
        </div>
      `;
    }
  };
}

function homeModule() {
  return {
    title: 'Inicio',
    render(container) {
      container.innerHTML = `
        <div class="hero">
          <div class="hero__eyebrow">${ICON('activity')} Hub Clinico HS Valme</div>
          <h1 class="hero__title">Hidradenitis supurativa: una sola entrada para todos los circuitos</h1>
          <p class="hero__subtitle">Carga la base de datos del hospital una vez por sesion y navega entre el registro de visitas, el paciente individual y el cuadro de mando de servicio.</p>
        </div>

        <div class="privacy-notice">
          ${ICON('lock')}
          <div>
            <div class="privacy-notice__title">Aviso de privacidad y carga local</div>
            <p class="privacy-notice__body">
              Esta herramienta funciona completamente en tu navegador. Los datos de la base se cargan
              <strong>unicamente en memoria</strong> y no se guardan en localStorage, sessionStorage, IndexedDB ni en el servidor.
              Al recargar la pagina o cerrar la pestana, los datos desaparecen. No copies datos reales de pacientes fuera del entorno hospitalario autorizado.
            </p>
          </div>
        </div>
      `;
    }
  };
}

function loadBaseModule() {
  return {
    title: 'Cargar/actualizar base',
    render(container) {
      container.innerHTML = `
        <div class="card">
          <h2 class="card__title">Cargar o actualizar la base de datos</h2>
          <p class="card__subtitle">Selecciona el archivo <code>Base_Datos_HS_Valme.xlsx</code> desde el ordenador del hospital. El sistema leera las hojas Monografica y Multidisciplinar.</p>

          <div class="alert alert--info">
            ${ICON('circle-alert')}
            <div>
              <strong>Requisitos del archivo</strong>
              <ul style="margin:0.5rem 0 0 1.2rem; padding:0;">
                <li>Formatos admitidos: .xlsx, .xls, .csv.</li>
                <li>Debe contener las hojas <strong>Monografica</strong> y <strong>Multidisciplinar</strong>.</li>
                <li>La primera fila de cada hoja debe contener los nombres de columna.</li>
              </ul>
            </div>
          </div>

          <input type="file" id="load-base-file-input" class="visually-hidden" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv">
          <button class="btn btn--primary" id="load-base-btn" type="button">
            ${ICON('upload')}
            Seleccionar archivo Excel
          </button>
        </div>
      `;

      const input = container.querySelector('#load-base-file-input');
      const btn = container.querySelector('#load-base-btn');
      btn.addEventListener('click', () => input.click());
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (file) handleBaseFile(file);
        input.value = '';
      });
    }
  };
}

function bootstrap() {
  renderShell();
  bindBaseLoader();

  const appContent = document.getElementById('app-content');

  router
    .register('home', homeModule())
    .register('register', emptyStateModule('Registrar visita', 'Aqui se registraran las primeras visitas y seguimientos de hidradenitis supurativa.'))
    .register('patient', emptyStateModule('Ver paciente', 'Aqui se podra buscar un paciente por NUSHA y revisar su evolucion longitudinal.'))
    .register('service', emptyStateModule('Cuadro de mando', 'Aqui se mostraran los indicadores agregados del servicio y la poblacion activa.'))
    .register('load-base', loadBaseModule())
    .mount(appContent);

  store.subscribe((eventType) => {
    if (eventType === 'base-loaded' || eventType === 'base-cleared' || eventType === 'base-error') {
      updateBaseStatus();
    }
  });

  updateBaseStatus();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
