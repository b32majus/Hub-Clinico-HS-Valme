import { store } from '../store.js';
import {
  ICON,
  renderTopFields,
  renderAnamnesisSection,
  renderComorbiditySection,
  renderIhsSection,
  renderEcoSection,
  renderPromsSection,
  renderSurgerySection,
  renderTherapySection,
  renderSeguimientoSection,
  renderHallazgosSection,
  renderPatientSelector,
  bindFormInteractions,
  collectFormData,
  validateFormData,
  prefillFromBase,
  resetForm
} from './shared_fields.js';
import { buildTSV, getDestinationSheet } from '../tsv/exporter.js';
import { copyToClipboard } from '../tsv/clipboard.js';
import { buildTherapyFieldNames } from '../schema/hs_schema.js';

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
  alert.innerHTML = `${ICON(iconMap[type] || 'circle-alert')}<div>${message}</div>`;
  container.prepend(alert);
}

export function createVisitForm({ mode, title, therapyPrefix }) {
  let root = null;

  function render(container) {
    root = container;
    container.innerHTML = `
      <div class="card">
        <h2 class="card__title">${title}</h2>
        <p class="card__subtitle">Complete los campos y copie la fila TSV para pegarla en la hoja correspondiente de Excel.</p>
        <div class="visit-form" data-visit-form data-mode="${mode}">
          ${renderPatientSelector(store.getBase())}
          ${renderTopFields()}
          ${renderAnamnesisSection()}
          ${renderComorbiditySection()}
          ${renderIhsSection()}
          ${renderEcoSection()}
          ${renderPromsSection()}
          ${mode === 'primera' ? renderSurgerySection() : ''}
          ${mode === 'primera'
            ? renderTherapySection('tx_primera', 'FARMACOTERAPIA', 'Tratamiento activo organizado por familias. Cada fila combina farmaco y posologia.')
            : renderSeguimientoSection()
          }
          ${renderHallazgosSection()}
          <div class="form-actions">
            <button type="button" class="btn btn--secondary" data-action="reset">
              ${ICON('rotate-ccw')}
              Limpiar formulario
            </button>
            <button type="button" class="btn btn--primary" data-action="export">
              ${ICON('copy')}
              Copiar fila para Excel
            </button>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('[data-visit-form]');

    // Default fecha to today
    const fechaInput = form.querySelector('[data-field="fecha_visita"]');
    if (fechaInput && !fechaInput.value) {
      fechaInput.value = new Date().toISOString().split('T')[0];
    }

    bindFormInteractions(form);

    // Patient selector prefill
    const selector = form.querySelector('[data-patient-selector]');
    if (selector) {
      selector.addEventListener('change', () => {
        if (selector.value) {
          prefillFromBase(selector.value, form, store.getBase(), mode);
        }
      });
    }

    form.querySelector('[data-action="reset"]').addEventListener('click', () => {
      if (!window.confirm('Se limpiaran todos los datos del formulario. Continuar?')) return;
      resetForm(form);
      if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];
      showAlert(container, 'Formulario limpiado', 'info');
    });

    form.querySelector('[data-action="export"]').addEventListener('click', async () => {
      let activeTherapyPrefix = therapyPrefix;
      if (mode === 'seguimiento') {
        const decision = form.querySelector('[data-field="seguimiento_decision"]')?.value;
        activeTherapyPrefix = decision === 'cambiar'
          ? 'tx_seguimiento_cambiar'
          : decision === 'continuar'
            ? 'tx_seguimiento_continuar'
            : 'tx_seguimiento';
      }
      const payload = collectFormData(form, { therapyPrefix: activeTherapyPrefix });

      // For seguimiento, normalize collected therapy fields to canonical tx_seguimiento prefix.
      if (mode === 'seguimiento' && activeTherapyPrefix !== 'tx_seguimiento') {
        for (const field of buildTherapyFieldNames(activeTherapyPrefix)) {
          const canonical = field.replace(activeTherapyPrefix, 'tx_seguimiento');
          payload[canonical] = payload[field];
          delete payload[field];
        }
      }

      const validation = validateFormData(payload, payload.consulta || 'monografica');
      if (!validation.valid) {
        showAlert(container, `Revise los errores:<br>${validation.errors.join('<br>')}`, 'error');
        return;
      }
      const circuit = payload.consulta;
      const tsv = buildTSV(circuit, payload);
      const sheet = getDestinationSheet(circuit);
      try {
        await copyToClipboard(tsv);
        showAlert(container, `Fila copiada al portapapeles. Pegue en Excel &gt; hoja <strong>${sheet}</strong> (esquema v1).`, 'success');
      } catch (err) {
        showAlert(container, `No se pudo copiar: ${err.message}`, 'error');
      }
    });
  }

  return {
    title,
    render,
    teardown() {
      root = null;
    }
  };
}
