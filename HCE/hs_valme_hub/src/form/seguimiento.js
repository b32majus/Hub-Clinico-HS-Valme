import { createVisitForm } from './visit_form.js';

export function createSeguimientoModule() {
  return createVisitForm({
    mode: 'seguimiento',
    title: 'Visita de seguimiento',
    therapyPrefix: 'tx_seguimiento'
  });
}
