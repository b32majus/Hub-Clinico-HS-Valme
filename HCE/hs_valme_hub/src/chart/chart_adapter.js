import { applyChartDefaults } from './themes.js';

export function isChartAvailable() {
  return typeof window !== 'undefined' && !!window.Chart;
}

function getChartConstructor() {
  return isChartAvailable() ? window.Chart : null;
}

function renderFallback(container, message) {
  if (!container) return;
  const existing = container.querySelector('.chart-fallback');
  if (existing) existing.remove();
  const fallback = document.createElement('div');
  fallback.className = 'chart-fallback';
  fallback.textContent = message || 'Grafico no disponible';
  container.appendChild(fallback);
}

export class ChartManager {
  constructor() {
    this.instances = new Map();
    const Chart = getChartConstructor();
    if (Chart) applyChartDefaults(Chart);
  }

  create(canvasId, type, data, options, fallbackMessage) {
    const Chart = getChartConstructor();
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const container = canvas.parentElement;
    this.destroy(canvasId);

    if (!Chart) {
      renderFallback(container, fallbackMessage || 'Chart.js no esta cargado');
      return null;
    }

    const context = canvas.getContext('2d');
    const instance = new Chart(context, { type, data, options });
    this.instances.set(canvasId, instance);

    const fallback = container?.querySelector('.chart-fallback');
    if (fallback) fallback.remove();
    return instance;
  }

  destroy(canvasId) {
    const instance = this.instances.get(canvasId);
    if (instance) {
      instance.destroy();
      this.instances.delete(canvasId);
    }
  }

  destroyAll() {
    for (const canvasId of this.instances.keys()) {
      this.destroy(canvasId);
    }
  }
}
