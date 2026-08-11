import { mountShell } from './components.js';
import { getJson, unshelteredPercent } from './data.js';

mountShell('story');

const summary = await getJson('./data/lahsa-2026-summary.json');
const city = summary.cityOfLosAngeles;
const sheltered = city.totalHomelessPopulation - city.unshelteredPopulation;
const pct = unshelteredPercent(summary);

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

new Chart(document.querySelector('#shelterChart'), {
  type: 'bar',
  data: {
    labels: ['Sheltered estimate', 'Unsheltered estimate'],
    datasets: [{
      label: 'People',
      data: [sheltered, city.unshelteredPopulation],
      backgroundColor: ['#000000', '#f46524']
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  }
});

new Chart(document.querySelector('#shareChart'), {
  type: 'doughnut',
  data: {
    labels: ['Unsheltered', 'Sheltered estimate'],
    datasets: [{
      data: [city.unshelteredPopulation, sheltered],
      backgroundColor: ['#f46524', '#000000']
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
