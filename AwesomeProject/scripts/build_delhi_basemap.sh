#!/usr/bin/env bash
#
# Builds the bundled, fully-offline Delhi street base for the Android metro map
# (components/OfflineMetroMap.js). Output is a set of per-tile vector .pbf files
# at android/app/src/main/assets/delhi/{z}/{x}/{y}.pbf, which MapLibre reads via
# the asset:// scheme — so the map fetches nothing from the network.
#
# Data: OpenStreetMap (© OpenStreetMap contributors, ODbL), fetched from the
# public Overpass API for the Delhi-metro bounding box. Only major roads, water,
# waterways and green areas are kept, with properties stripped to a single
# `class` field, to keep the bundle small (~3.5 MB raw, deflated further in the
# APK). No street/place names are included (we only bundle Latin glyph ranges).
#
# Requirements: bash, curl, node, sqlite3, and tippecanoe (brew install tippecanoe).
# Re-run this whenever you want to refresh the base map from current OSM data.
set -euo pipefail

# Bounding box (south,west,north,east) — padded around the metro stop extent.
BBOX="28.30,76.85,28.80,77.62"
OVERPASS="https://overpass-api.de/api/interpreter"
UA="StationAlert-basemap-build/1.0"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/android/app/src/main/assets/delhi"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"

echo "==> Fetching roads from Overpass…"
curl -fsS -A "$UA" --max-time 280 -o roads.json "$OVERPASS" --data-urlencode "data=
[out:json][timeout:240];
(way[\"highway\"~\"^(motorway|trunk|primary|secondary|tertiary)(_link)?\$\"]($BBOX););
out geom;"

echo "==> Fetching water + green areas from Overpass…"
curl -fsS -A "$UA" --max-time 280 -o other.json "$OVERPASS" --data-urlencode "data=
[out:json][timeout:240];
(
  way[\"waterway\"~\"^(river|canal)\$\"]($BBOX);
  way[\"natural\"=\"water\"]($BBOX);
  relation[\"natural\"=\"water\"]($BBOX);
  way[\"leisure\"=\"park\"]($BBOX);
  way[\"landuse\"~\"^(forest|grass|recreation_ground)\$\"]($BBOX);
  way[\"natural\"=\"wood\"]($BBOX);
);
out geom;"

echo "==> Converting OSM -> layered GeoJSON…"
npm install --no-save osmtogeojson@3.0.0-beta.5 >/dev/null 2>&1
cat > convert.js <<'JS'
const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const load = f => osmtogeojson(JSON.parse(fs.readFileSync(f, 'utf8')));
const roads = load('roads.json');
const other = load('other.json');
const out = {road: [], water: [], waterway: [], landuse: []};
const isLine = g => g && (g.type === 'LineString' || g.type === 'MultiLineString');
const isPoly = g => g && (g.type === 'Polygon' || g.type === 'MultiPolygon');
for (const f of roads.features) {
  const t = f.properties || {};
  if (!t.highway || !isLine(f.geometry)) continue;
  out.road.push({type: 'Feature', geometry: f.geometry, properties: {class: t.highway.replace('_link', '')}});
}
for (const f of other.features) {
  const t = f.properties || {}, g = f.geometry;
  if (t.waterway && isLine(g)) { out.waterway.push({type: 'Feature', geometry: g, properties: {class: 'river'}}); continue; }
  if (t.natural === 'water' && isPoly(g)) { out.water.push({type: 'Feature', geometry: g, properties: {class: 'water'}}); continue; }
  if (isPoly(g) && (t.leisure === 'park' || t.natural === 'wood' || ['forest', 'grass', 'recreation_ground'].includes(t.landuse))) {
    const cls = t.leisure === 'park' ? 'park' : (t.natural === 'wood' || t.landuse === 'forest') ? 'wood' : 'grass';
    out.landuse.push({type: 'Feature', geometry: g, properties: {class: cls}});
  }
}
for (const k of Object.keys(out)) {
  fs.writeFileSync(k + '.geojson', JSON.stringify({type: 'FeatureCollection', features: out[k]}));
  console.log('   ', k, out[k].length, 'features');
}
JS
node convert.js

echo "==> Building vector tiles (z8-14)…"
tippecanoe -o delhi.mbtiles -f -Z8 -z14 \
  --drop-densest-as-needed --extend-zooms-if-still-dropping \
  --simplification=6 --detect-shared-borders --coalesce \
  --maximum-tile-bytes=300000 \
  -L road:road.geojson -L water:water.geojson \
  -L waterway:waterway.geojson -L landuse:landuse.geojson >/dev/null 2>&1

echo "==> Extracting tiles -> $DEST (raw pbf, XYZ scheme)…"
rm -rf "$DEST"; mkdir -p "$DEST"
DEST="$DEST" node <<'JS'
const fs = require('fs'), zlib = require('zlib'), cp = require('child_process');
const dest = process.env.DEST;
const rows = cp.execSync(
  'sqlite3 delhi.mbtiles "select zoom_level||\\"/\\"||tile_column||\\"/\\"||tile_row||\\"|\\"||quote(tile_data) from tiles;"',
  {maxBuffer: 1 << 30},
).toString().split('\n');
let n = 0, bytes = 0;
for (const line of rows) {
  if (!line.trim()) continue;
  const i = line.lastIndexOf('|');
  const [z, x, tmsy] = line.slice(0, i).split('/').map(Number);
  const hex = line.slice(i + 1);
  if (!hex.startsWith("X'")) continue;
  let buf = Buffer.from(hex.slice(2, -1), 'hex');
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf); // MBTiles stores gzipped MVT
  const y = Math.pow(2, z) - 1 - tmsy; // TMS -> XYZ
  const dir = `${dest}/${z}/${x}`;
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(`${dir}/${y}.pbf`, buf);
  n++; bytes += buf.length;
}
console.log('   wrote', n, 'tiles,', (bytes / 1048576).toFixed(2), 'MB raw');
JS

echo "==> Done. Tiles in $DEST"
