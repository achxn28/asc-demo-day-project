export async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

export function unshelteredPercent(summary) {
  const city = summary.cityOfLosAngeles;
  return (city.unshelteredPopulation / city.totalHomelessPopulation) * 100;
}

export function categoryLabel(category) {
  return category
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function serviceAddress(properties) {
  return [properties.address, properties.city, properties.state || 'CA', properties.zip]
    .filter(Boolean)
    .join(', ');
}

export function sourceFootnote(label) {
  return `Source: ${label}`;
}
