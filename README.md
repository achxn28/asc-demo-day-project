# Bridge LA

Bridge LA is a static, multi-page student project about homelessness and
resource visibility in Los Angeles.

## Tech Stack

- HTML5
- Vanilla JavaScript
- Tailwind CSS through CDN
- Custom CSS
- Chart.js through CDN
- Mapbox GL JS through CDN

## Pages

- `index.html`: project overview
- `story.html`: LAHSA 2026 homelessness data visualizations
- `resources.html`: resource map and filterable service list
- `visibility.html`: calculated visibility dashboard
- `sources.html`: source manifest, methodology, and audit checks
- `donate.html`: clearly labeled prototype donation flow

## Data

The site uses local JSON/GeoJSON files under `data/` with provenance tracked in
`data/sources.json`. Current bed availability and occupancy are not fabricated;
the interface directs users to providers or 211 LA when real-time availability
is not public.

Run a local static server before viewing so ES modules and JSON fetches work:

```sh
python3 -m http.server 8123
```
