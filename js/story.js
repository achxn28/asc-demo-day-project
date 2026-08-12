import { mountShell } from './components.js';
import { getJson, unshelteredPercent } from './data.js';

mountShell('story');

const [summary, context] = await Promise.all([
  getJson('./data/lahsa-2026-summary.json'),
  getJson('./data/la-context-indicators.json')
]);
const city = summary.cityOfLosAngeles;
const sheltered = city.totalHomelessPopulation - city.unshelteredPopulation;
const pct = unshelteredPercent(summary);
const orange = '#f46524';
const black = '#000000';
const gray = '#dedbd5';

document.querySelector('#story-stats').innerHTML = [
  [`${city.totalHomelessPopulation.toLocaleString()}`, 'estimated people experiencing homelessness in the City of Los Angeles'],
  [`${city.unshelteredPopulation.toLocaleString()}`, 'estimated people experiencing unsheltered homelessness'],
  [`${pct.toFixed(1)}%`, 'of people experiencing homelessness were unsheltered']
].map(([value, label], index) => `
  <article class="stat-card ${index === 2 ? 'orange' : ''}">
    <span class="stat-value">${value}</span>
    <p>${label}</p>
    <span class="source">LAHSA 2026 Greater Los Angeles Homeless Count</span>
  </article>
`).join('');

Chart.defaults.font.family = 'Inter, Arial, sans-serif';
Chart.defaults.color = '#333333';
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.14)';

new Chart(document.querySelector('#shelterChart'), {
  type: 'bar',
  data: {
    labels: context.shelteredComparison.map((item) => item.year),
    datasets: [
      {
        label: 'Sheltered',
        data: context.shelteredComparison.map((item) => item.sheltered),
        backgroundColor: black,
        borderColor: black,
        borderWidth: 2
      },
      {
        label: 'Unsheltered',
        data: context.shelteredComparison.map((item) => item.unsheltered),
        backgroundColor: orange,
        borderColor: black,
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${context.raw.toLocaleString()} people`;
          }
        }
      }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, ticks: { callback: (value) => Number(value).toLocaleString() } }
    }
  }
});

const trendCanvas = document.querySelector('#trendChart');
const trendGradient = trendCanvas.getContext('2d').createLinearGradient(0, 0, 0, 320);
trendGradient.addColorStop(0, 'rgba(244, 101, 36, 0.38)');
trendGradient.addColorStop(1, 'rgba(244, 101, 36, 0.02)');

new Chart(trendCanvas, {
  type: 'line',
  data: {
    labels: context.cityHomelessTrend.map((item) => item.year),
    datasets: [{
      label: 'City of LA count',
      data: context.cityHomelessTrend.map((item) => item.total),
      fill: true,
      tension: 0.35,
      pointRadius: 6,
      pointHoverRadius: 8,
      borderColor: orange,
      backgroundColor: trendGradient,
      pointBackgroundColor: black,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            return `${context.raw.toLocaleString()} people`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 42000,
        ticks: { callback: (value) => Number(value).toLocaleString() }
      }
    }
  }
});

new Chart(document.querySelector('#shareChart'), {
  type: 'doughnut',
  data: {
    labels: ['Unsheltered', 'Sheltered estimate'],
    datasets: [{
      data: [city.unshelteredPopulation, sheltered],
      backgroundColor: [orange, black],
      borderColor: '#ffffff',
      borderWidth: 4,
      hoverOffset: 14
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.raw;
            return `${context.label}: ${value.toLocaleString()} people`;
          }
        }
      }
    }
  }
});

new Chart(document.querySelector('#pressureChart'), {
  type: 'polarArea',
  data: {
    labels: context.housingPressure.map((item) => item.label),
    datasets: [{
      data: context.housingPressure.map((item) => item.value),
      backgroundColor: [
        'rgba(244, 101, 36, 0.88)',
        'rgba(0, 0, 0, 0.86)',
        'rgba(120, 120, 120, 0.78)',
        'rgba(184, 74, 22, 0.84)'
      ],
      borderColor: '#ffffff',
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label(context) {
            const item = context.chart.data.labels[context.dataIndex];
            return `${item}: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      r: {
        ticks: { backdropColor: 'transparent', callback: (value) => `${value}%` }
      }
    }
  }
});
