import { createVisitForm } from './visit_form.js';

export function createPrimeraVisitaModule() {
  return createVisitForm({
    mode: 'primera',
    title: 'Primera visita',
    therapyPrefix: 'tx_primera'
  });
}
