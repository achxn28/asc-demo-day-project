import { mountShell } from './components.js';
import { categoryLabel, getJson, unshelteredPercent } from './data.js';

mountShell('story');

const [summary, context, services] = await Promise.all([
  getJson('./data/lahsa-2026-summary.json'),
  getJson('./data/la-context-indicators.json'),
  getJson('./data/la-service-locations.geojson')
]);
const city = summary.cityOfLosAngeles;
const sheltered = city.totalHomelessPopulation - city.unshelteredPopulation;
const pct = unshelteredPercent(summary);
const orange = '#f46524';
const black = '#000000';
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

document.querySelector('#story-stats').innerHTML = [
  [`${city.totalHomelessPopulation.toLocaleString()}`, 'estimated people experiencing homelessness in the City of Los Angeles'],
  [`${city.unshelteredPopulation.toLocaleString()}`, 'estimated people experiencing unsheltered homelessness'],
  [`${pct.toFixed(1)}%`, 'of people experiencing homelessness were unsheltered'],
  [services.features.length.toLocaleString(), 'mapped public service records in this prototype']
].map(([value, label], index) => `
  <article class="stat-card ${index === 2 ? 'orange' : ''}">
    <span class="stat-value">${value}</span>
    <p>${label}</p>
    <span class="source">${index === 3 ? 'LA County / 211 records' : 'LAHSA 2026 Greater Los Angeles Homeless Count'}</span>
  </article>
`).join('');

Chart.defaults.font.family = 'Libre Franklin, Arial, sans-serif';
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
      backgroundColor: topCities.map((_, index) => index === 0 ? orange : black),
      borderColor: black,
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
      backgroundColor: [black, '#777777', orange, '#b84a16'],
      borderColor: black,
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
