import { mountShell } from './components.js';
import { categoryLabel, getJson, unshelteredPercent } from './data.js';

mountShell('visibility');

const [summary, services, context] = await Promise.all([
  getJson('./data/lahsa-2026-summary.json'),
  getJson('./data/la-service-locations.geojson'),
  getJson('./data/la-context-indicators.json')
]);

const city = summary.cityOfLosAngeles;
const counts = services.features.reduce((acc, feature) => {
  acc[feature.properties.category] = (acc[feature.properties.category] || 0) + 1;
  return acc;
}, {});
const cityCounts = services.features.reduce((acc, feature) => {
  const city = feature.properties.city || 'Unknown';
  acc[city] = (acc[city] || 0) + 1;
  return acc;
}, {});
const topCities = Object.entries(cityCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);

Chart.defaults.font.family = 'Source Sans 3, Arial, sans-serif';
Chart.defaults.color = '#333333';
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.14)';

document.querySelector('#visibility-stats').innerHTML = [
  [city.totalHomelessPopulation.toLocaleString(), '2026 City of LA homeless population', 'LAHSA 2026'],
  [city.unshelteredPopulation.toLocaleString(), '2026 City of LA unsheltered population', 'LAHSA 2026'],
  [`${unshelteredPercent(summary).toFixed(1)}%`, 'unsheltered share of people counted', 'Calculated from LAHSA values'],
  [services.features.length.toLocaleString(), 'mapped public service records in prototype', 'LA County / 211 records']
].map(([value, label, source], index) => `
  <article class="stat-card ${index === 2 ? 'orange' : ''}">
    <span class="stat-value">${value}</span>
    <p>${label}</p>
    <span class="source">${source}</span>
  </article>
`).join('');

new Chart(document.querySelector('#categoryChart'), {
  type: 'doughnut',
  data: {
    labels: Object.keys(counts).map(categoryLabel),
    datasets: [{
      label: 'Mapped records',
      data: Object.values(counts),
      backgroundColor: ['#f46524', '#777777', '#000000', '#b84a16', '#a0a0a0'],
      borderColor: '#ffffff',
      borderWidth: 4,
      hoverOffset: 14
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
            return `${context.label}: ${context.raw} records`;
          }
        }
      }
    }
  }
});

new Chart(document.querySelector('#cityRecordsChart'), {
  type: 'bar',
  data: {
    labels: topCities.map(([city]) => city),
    datasets: [{
      label: 'Resource records',
      data: topCities.map(([, total]) => total),
      backgroundColor: topCities.map((_, index) => index === 0 ? '#f46524' : '#000000'),
      borderColor: '#000000',
      borderWidth: 2
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { precision: 0 } }
    }
  }
});

new Chart(document.querySelector('#cadenceChart'), {
  type: 'bar',
  data: {
    labels: context.dashboardCadence.map((item) => item.label),
    datasets: [{
      label: 'Days between updates',
      data: context.dashboardCadence.map((item) => item.days),
      backgroundColor: ['#000000', '#777777', '#f46524', '#b84a16'],
      borderColor: '#000000',
      borderWidth: 2
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
            return `${context.raw} days`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'logarithmic',
        ticks: {
          callback(value) {
            return `${value}d`;
          }
        }
      }
    }
  }
});
