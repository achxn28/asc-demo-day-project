import { mountShell } from './components.js';
import { MAPBOX_ACCESS_TOKEN, categoryLabel, getJson, serviceAddress } from './data.js';

mountShell('resources');

const serviceData = await getJson('./data/la-service-locations.geojson');
const list = document.querySelector('#resource-list');
const search = document.querySelector('#resource-search');
const type = document.querySelector('#resource-type');
const count = document.querySelector('#resource-count');
const mapNode = document.querySelector('#map');
let map;
let markers = [];

function filteredFeatures() {
  const query = search.value.trim().toLowerCase();
  const selectedType = type.value;
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
        </div>
        <span class="source">Source field: ${props.source}. Current availability: contact provider / 211 LA.</span>
      </article>
    `;
  }).join('');

  list.querySelectorAll('.resource-main').forEach((card) => {
    card.addEventListener('click', () => {
      const feature = features[Number(card.closest('[data-index]').dataset.index)];
      map?.flyTo({ center: feature.geometry.coordinates, zoom: 13 });
      markers.find((item) => item.feature.id === feature.id)?.marker.togglePopup();
    });
  });
}

function renderMarkers(features) {
  markers.forEach(({ marker }) => marker.remove());
  markers = [];
  if (!map) return;
  features.forEach((feature) => {
    const props = feature.properties;
    const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(`
      <strong>${props.name}</strong>
      <p>${serviceAddress(props)}</p>
      <p>Current availability: contact provider / 211 LA.</p>
    `);
    const marker = new mapboxgl.Marker({ color: markerColor(props.category) })
      .setLngLat(feature.geometry.coordinates)
      .setPopup(popup)
      .addTo(map);
    markers.push({ marker, feature });
  });
}

function update() {
  const features = filteredFeatures();
  renderList(features);
  renderMarkers(features);
}

if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
  mapNode.outerHTML = `
    <div class="map-message">
      <div>
        <h2>Mapbox token required</h2>
        <p>Add a token in <strong>js/data.js</strong> to render the interactive map. Resource records still load in the list.</p>
      </div>
    </div>
  `;
} else {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-118.255, 34.05],
    zoom: 10
  });
  map.addControl(new mapboxgl.NavigationControl());
  map.on('load', update);
}

search.addEventListener('input', update);
type.addEventListener('change', update);
update();
