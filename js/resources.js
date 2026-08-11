import { mountShell } from './components.js';
import { categoryLabel, getJson, serviceAddress } from './data.js';

mountShell('resources');

const serviceData = await getJson('./data/la-service-locations.geojson');
const list = document.querySelector('#resource-list');
const search = document.querySelector('#resource-search');
const type = document.querySelector('#resource-type');
const count = document.querySelector('#resource-count');
const pins = document.querySelector('#map-pin-layer');
const needTabs = document.querySelector('#need-tabs');
let activeNeed = 'all';

function filteredFeatures() {
  const query = search.value.trim().toLowerCase();
  const selectedType = activeNeed !== 'all' ? activeNeed : type.value;
  return serviceData.features.filter((feature) => {
    const props = feature.properties;
    const haystack = [props.name, props.city, props.description, props.category].join(' ').toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesType = selectedType === 'all' || props.category === selectedType;
    return matchesQuery && matchesType;
  });
}

function markerColor(category) {
  if (category === 'shelter') return '#f46524';
  if (category === 'healthcare') return '#000000';
  return '#777777';
}

function pinPosition(feature) {
  const [lng, lat] = feature.geometry.coordinates;
  const bounds = {
    west: -118.52,
    east: -118.18,
    south: 34.02,
    north: 34.18
  };
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;
  const y = (1 - ((lat - bounds.south) / (bounds.north - bounds.south))) * 100;
  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(88, Math.max(10, y))
  };
}

function renderList(features) {
  count.textContent = `${features.length} ${features.length === 1 ? 'resource' : 'resources'}`;
  if (!features.length) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>No matching resources</h3>
        <p>Try a broader search or choose all resource types.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = features.map((feature, index) => {
    const props = feature.properties;
    const address = serviceAddress(props);
    const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const phone = props.phones ? props.phones.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] : '';
    const website = props.url || props.link;
    return `
      <article class="resource-card" data-index="${index}">
        <button class="resource-main" type="button">
          <span class="badge">${categoryLabel(props.category)}</span>
          <h3>${props.name}</h3>
          <p class="resource-address">${address}</p>
          <p>${props.description || ''}</p>
        </button>
        <div class="resource-actions">
          ${phone ? `<a href="tel:${phone.replace(/[^0-9]/g, '')}">Call</a>` : ''}
          ${website ? `<a href="${website.startsWith('http') ? website : `https://${website}`}">Website</a>` : ''}
          <a href="${directions}">Directions</a>
          <button type="button" data-source-open data-source-title="${props.name}" data-source-body="This resource record comes from the Los Angeles County Homeless Shelters and Services public feature service. Bridge LA keeps source fields visible and does not add missing availability data.">Source</button>
        </div>
        <span class="source">Source field: ${props.source}. Current availability: contact provider / 211 LA.</span>
      </article>
    `;
  }).join('');

  list.querySelectorAll('.resource-main').forEach((card) => {
    card.addEventListener('click', () => {
      const feature = features[Number(card.closest('[data-index]').dataset.index)];
      highlightPin(feature.id);
    });
  });
}

function renderPins(features) {
  pins.innerHTML = features.map((feature, index) => {
    const props = feature.properties;
    const pos = pinPosition(feature);
    return `
      <button class="map-pin" type="button" data-feature-id="${feature.id}" data-resource-index="${index}" style="left:${pos.x}%; top:${pos.y}%; --pin-color:${markerColor(props.category)}">
        <span>${categoryLabel(props.category)}</span>
      </button>
    `;
  }).join('');

  pins.querySelectorAll('.map-pin').forEach((pin) => {
    pin.addEventListener('click', () => {
      const index = Number(pin.dataset.resourceIndex);
      list.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightPin(pin.dataset.featureId);
    });
  });
}

function update() {
  const features = filteredFeatures();
  renderList(features);
  renderPins(features);
}

function highlightPin(id) {
  document.querySelectorAll('.map-pin').forEach((pin) => {
    pin.classList.toggle('active', pin.dataset.featureId === String(id));
  });
}

search.addEventListener('input', update);
type.addEventListener('change', update);
needTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-need]');
  if (!button) return;
  activeNeed = button.dataset.need;
  needTabs.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  type.value = activeNeed === 'all' ? 'all' : activeNeed;
  update();
});
update();
