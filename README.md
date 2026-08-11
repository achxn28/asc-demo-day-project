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
- `story.html`: Data page with LAHSA 2026 visualizations
- `resources.html`: Find Resources tool with filters, map, and actions
- `visibility.html`: Dashboard with calculated public-data indicators
- `sources.html`: Sources, methodology, and audit checks
- `donate.html`: Donate Demo with a prototype receipt flow

## Data

The site uses local JSON/GeoJSON files under `data/` with provenance tracked in
`data/sources.json`. Current bed availability and occupancy are not fabricated;
the interface directs users to providers or 211 LA when real-time availability
is not public.

Run a local static server before viewing so ES modules and JSON fetches work:

```sh
python3 -m http.server 8123
```
