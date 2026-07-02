export const CHART_COLORS = {
  primary: '#0f766e',
  primaryLight: '#15a598',
  secondary: '#1f3f63',
  accent: '#d4a036',
  success: '#0f766e',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#4891df',
  muted: '#7b8ea7',
  leve: '#8ed1b1',
  moderado: '#f0c36b',
  grave: '#de8d8d',
  palette: [
    '#0f766e', '#1f3f63', '#d4a036', '#4891df', '#dc2626',
    '#7b8ea7', '#15a598', '#b48a23', '#ef3c3c', '#f08a25'
  ]
};

export function applyChartDefaults(Chart) {
  if (!Chart) return;
  Chart.defaults.font.family = '"Aptos", "IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
  Chart.defaults.color = '#11313f';
}

export function barOptions(horizontal = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(17, 49, 63, 0.08)' }
      },
      x: {
        grid: { display: !horizontal ? false : true, color: 'rgba(17, 49, 63, 0.08)' }
      }
    }
  };
}

export function doughnutOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };
}

export function lineOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(17, 49, 63, 0.08)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };
}

export function promsLineOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        grid: { color: 'rgba(17, 49, 63, 0.08)' }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };
}
