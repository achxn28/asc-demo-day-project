import { mountShell } from './components.js';
import { MAPBOX_ACCESS_TOKEN, categoryLabel, getJson, serviceAddress } from './data.js';

mountShell('resources');

const serviceData = await getJson('./data/la-service-locations.geojson');
const list = document.querySelector('#resource-list');
const search = document.querySelector('#resource-search');
const type = document.querySelector('#resource-type');
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
  list.innerHTML = features.map((feature, index) => {
    const props = feature.properties;
    return `
      <button class="card resource-card" type="button" data-index="${index}">
        <span class="badge">${categoryLabel(props.category)}</span>
        <h3>${props.name}</h3>
        <p>${serviceAddress(props)}</p>
        <p>${props.description || ''}</p>
        <span class="source">Source field: ${props.source}. Current availability: contact provider / 211 LA.</span>
      </button>
    `;
  }).join('');

  list.querySelectorAll('[data-index]').forEach((card) => {
    card.addEventListener('click', () => {
      const feature = features[Number(card.dataset.index)];
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
