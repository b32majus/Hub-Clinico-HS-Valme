import { ICON } from './shared_fields.js';
import { createPrimeraVisitaModule } from './primera_visita.js';
import { createSeguimientoModule } from './seguimiento.js';

export function createRegisterModule() {
  let root = null;
  let activeTab = 'primera';
  const modules = {
    primera: createPrimeraVisitaModule(),
    seguimiento: createSeguimientoModule()
  };

  function renderTabContent() {
    const content = root.querySelector('[data-register-content]');
    if (!content) return;
    content.innerHTML = '';
    modules[activeTab].render(content);

    root.querySelectorAll('[data-register-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-register-tab') === activeTab);
    });
  }

  return {
    title: 'Registrar visita',
    render(container) {
      root = container;
      container.innerHTML = `
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="display:flex;border-bottom:1px solid var(--color-border);">
            <button type="button" class="nav-link" data-register-tab="primera" style="flex:1;justify-content:center;border-radius:0;">
              ${ICON('clipboard-plus')}
              Primera visita
            </button>
            <button type="button" class="nav-link" data-register-tab="seguimiento" style="flex:1;justify-content:center;border-radius:0;">
              ${ICON('activity')}
              Seguimiento
            </button>
          </div>
          <div data-register-content style="padding:var(--space-6);"></div>
        </div>
      `;

      container.querySelectorAll('[data-register-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeTab = btn.getAttribute('data-register-tab');
          renderTabContent();
        });
      });

      renderTabContent();
    },
    teardown() {
      Object.values(modules).forEach(m => {
        if (typeof m.teardown === 'function') m.teardown();
      });
      root = null;
    }
  };
}
