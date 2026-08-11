import { mountShell } from './components.js';
import { categoryLabel, getJson, unshelteredPercent } from './data.js';

mountShell('visibility');

const [summary, services] = await Promise.all([
  getJson('./data/lahsa-2026-summary.json'),
  getJson('./data/la-service-locations.geojson')
]);

const city = summary.cityOfLosAngeles;
const counts = services.features.reduce((acc, feature) => {
  acc[feature.properties.category] = (acc[feature.properties.category] || 0) + 1;
  return acc;
}, {});

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
  type: 'bar',
  data: {
    labels: Object.keys(counts).map(categoryLabel),
    datasets: [{
      label: 'Mapped records',
      data: Object.values(counts),
      backgroundColor: '#f46524',
      borderColor: '#000000',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { precision: 0 } } }
  }
});
