import('./components.js').then(({ mountShell }) => mountShell('resources'));

const list = document.querySelector('#resource-list');
const search = document.querySelector('#resource-search');
const type = document.querySelector('#resource-type');
const count = document.querySelector('#resource-count');
const needTabs = document.querySelector('#need-tabs');
count.textContent = 'Loading resources';
list.innerHTML = '<div class="empty-state"><h3>Loading official records</h3><p>Bridge LA is loading the local copy of LA County / 211 service data.</p></div>';

let serviceData;
let activeNeed = 'all';
let map;
let markerLayer;
const LA_RESOURCE_BOUNDS = {
  minLat: 33.3,
  maxLat: 34.85,
  minLng: -119,
  maxLng: -117.55
};

try {
  init().catch((error) => {
    count.textContent = 'Data unavailable';
    list.innerHTML = `<div class="empty-state"><h3>Resource data could not load</h3><p>${error.message}</p></div>`;
    throw error;
  });
} catch (error) {
  count.textContent = 'Data unavailable';
  list.innerHTML = `<div class="empty-state"><h3>Resource data could not load</h3><p>${error.message}</p></div>`;
  throw error;
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

function categoryLabel(category) {
  return category
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function serviceAddress(properties) {
  return [properties.address, properties.city, properties.state || 'CA', properties.zip]
    .filter(Boolean)
    .join(', ');
}

function filteredFeatures() {
  const query = search.value.trim().toLowerCase();
  const selectedType = activeNeed !== 'all' ? activeNeed : type.value;
  return serviceData.features.filter((feature) => {
    const props = feature.properties;
    const haystack = [
      props.name,
      props.city,
      props.description,
      props.category,
      props.sourceCategory1,
      props.sourceCategory2,
      props.sourceCategory3
    ].join(' ').toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesType =
      selectedType === 'all' ||
      props.category === selectedType ||
      (selectedType === 'food' && haystack.includes('food')) ||
      (selectedType === 'outreach' && (haystack.includes('outreach') || haystack.includes('support')));
    return matchesQuery && matchesType;
  });
}

function markerColor(category) {
  if (category === 'shelter') return '#f46524';
  if (category === 'healthcare') return '#000000';
  if (category === 'food') return '#b84a16';
  if (category === 'outreach') return '#a0a0a0';
  return '#777777';
}

function hasValidLaCoordinates(feature) {
  const [lng, lat] = feature.geometry.coordinates;
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= LA_RESOURCE_BOUNDS.minLat &&
    lat <= LA_RESOURCE_BOUNDS.maxLat &&
    lng >= LA_RESOURCE_BOUNDS.minLng &&
    lng <= LA_RESOURCE_BOUNDS.maxLng
  );
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
      focusFeature(feature);
    });
  });
}

function createIcon(category, active = false) {
  return L.divIcon({
    className: `resource-map-marker${active ? ' active' : ''}`,
    html: `<span style="background:${markerColor(category)}"></span>`,
    iconSize: active ? [24, 24] : [18, 18],
    iconAnchor: active ? [12, 12] : [9, 9]
  });
}

function renderMap(features) {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();
  const mappableFeatures = features.filter(hasValidLaCoordinates);
  mappableFeatures.forEach((feature) => {
    const props = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;
    const marker = L.marker([lat, lng], {
      icon: createIcon(props.category)
    }).bindPopup(`
      <strong>${props.name}</strong><br />
      ${serviceAddress(props)}<br />
      <small>Current availability: contact provider / 211 LA.</small>
    `);
    marker.on('click', () => {
      const card = [...list.querySelectorAll('[data-index]')].find((item) => {
        const cardFeature = features[Number(item.dataset.index)];
        return cardFeature?.id === feature.id;
      });
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    marker.featureId = feature.id;
    markerLayer.addLayer(marker);
  });

  const coordinates = mappableFeatures.map((feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    return [lat, lng];
  });
  if (coordinates.length) {
    map.fitBounds(coordinates, { padding: [36, 36], maxZoom: 12 });
  }
}

function focusFeature(feature) {
  if (!map || !markerLayer || !hasValidLaCoordinates(feature)) return;
  const [lng, lat] = feature.geometry.coordinates;
  map.setView([lat, lng], 14);
  markerLayer.eachLayer((marker) => {
    const isActive = marker.featureId === feature.id;
    marker.setIcon(createIcon(feature.properties.category, isActive));
    if (isActive) marker.openPopup();
  });
}

function update() {
  const features = filteredFeatures();
  renderList(features);
  renderMap(features);
}

async function init() {
  serviceData = await getJson('./data/la-service-locations.geojson');
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

  await waitForLeaflet();
  map = L.map('map', {
    scrollWheelZoom: false,
    maxBounds: [
      [33.25, -119.1],
      [34.9, -117.45]
    ],
    maxBoundsViscosity: 0.65
  }).setView([34.0522, -118.2437], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  update();
}

function waitForLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((resolve, reject) => {
    window.addEventListener('load', () => {
      if (window.L) resolve();
      else reject(new Error('Leaflet failed to load'));
    }, { once: true });
  });
}
