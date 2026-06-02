#!/usr/bin/env node
/*
 * Regenerates components/graph.js (graphWithIds, colorLinesWithIds,
 * interchangeStationsWithColors) from the authoritative DMRC GTFS feed.
 *
 * Connections and per-edge distances come straight from GTFS stop sequences
 * (stop_times.shape_dist_traveled, in metres). A station's line colour is the
 * single line that serves it, or "interchange" when more than one line does.
 *
 * Two real out-of-network interchange transfers that GTFS does not encode as
 * stop sequences are added explicitly (see TRANSFERS below) - notably the only
 * link from the Aqua line into the rest of the network.
 *
 *   GTFS_DIR=/path/to/DMRC_GTFS node scripts/buildGraphFromGtfs.js
 */
const fs = require('fs');
const path = require('path');

const GTFS_DIR =
  process.env.GTFS_DIR || '/Users/rahulbulchandani/Downloads/DMRC_GTFS';
const OUT = path.join(__dirname, '..', 'components', 'graph.js');

function parseCSV(file) {
  const txt = fs.readFileSync(path.join(GTFS_DIR, file), 'utf8').replace(/\r/g, '');
  const lines = txt.split('\n').filter(Boolean);
  const header = lines[0].split(',');
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const o = {};
    header.forEach((h, i) => (o[h] = cols[i]));
    return o;
  });
}

// route_long_name prefix (RED_, YELLOW_, ...) -> hex + label. Hexes match
// utilities/routeMetrics.js LINE_INFO so line names/colours stay in sync.
const LINE_HEX = {
  RED: '#CC0000', YELLOW: '#F7D117', BLUE: '#0000FF', PINK: '#FF69B4',
  VIOLET: '#8F00FF', MAGENTA: '#800080', GREEN: '#008000', AQUA: '#00FFFF',
  GRAY: '#808080', 'ORANGE/AIRPORT': '#FFA500', RAPID: '#00AEEF',
};
const HEX_LABEL = {
  '#CC0000': 'Red', '#F7D117': 'Yellow', '#0000FF': 'Blue', '#FF69B4': 'Pink',
  '#8F00FF': 'Violet', '#800080': 'Magenta', '#008000': 'Green',
  '#00FFFF': 'Aqua', '#808080': 'Grey', '#FFA500': 'Airport Express',
  '#00AEEF': 'Rapid Metro',
};

const stops = parseCSV('stops.txt');
const routes = parseCSV('routes.txt');
const trips = parseCSV('trips.txt');
const stopTimes = parseCSV('stop_times.txt');

const stopName = {}, coord = {};
for (const s of stops) {
  stopName[s.stop_id] = s.stop_name;
  coord[s.stop_id] = [parseFloat(s.stop_lat), parseFloat(s.stop_lon)];
}
// Prefer the app's canonical display names (stationsWithIDs.js) for the inline
// comments, so graph.js stays in sync with the rest of the app's naming.
try {
  const src = fs.readFileSync(path.join(__dirname, '..', 'components', 'stationsWithIDs.js'), 'utf8')
    .replace(/^import .*$/gm, '').replace(/^export\s+(default\s+)?/gm, '');
  const appStations = new Function(src + '\nreturn stations;')();
  for (const id of Object.keys(appStations)) {
    if (appStations[id] && appStations[id].name) stopName[id] = appStations[id].name;
  }
} catch (e) { /* fall back to GTFS names */ }
const routeHex = {};
for (const r of routes) routeHex[r.route_id] = LINE_HEX[(r.route_long_name || '').split('_')[0]];
const tripRoute = {};
for (const t of trips) tripRoute[t.trip_id] = t.route_id;

const tripStops = {};
for (const st of stopTimes) (tripStops[st.trip_id] ||= []).push(st);

// adjacency: id -> { nid -> [distance samples] }; stopColors: id -> Set(hex)
const adj = {}, stopColors = {};
const addEdge = (a, b, d) => {
  (adj[a] ||= {}); (adj[b] ||= {});
  (adj[a][b] ||= []).push(d); (adj[b][a] ||= []).push(d);
};
for (const [tid, arr] of Object.entries(tripStops)) {
  arr.sort((a, b) => +a.stop_sequence - +b.stop_sequence);
  const hex = routeHex[tripRoute[tid]];
  for (const st of arr) (stopColors[st.stop_id] ||= new Set()).add(hex);
  for (let i = 0; i < arr.length - 1; i++) {
    const da = parseFloat(arr[i].shape_dist_traveled);
    const db = parseFloat(arr[i + 1].shape_dist_traveled);
    if (!isNaN(da) && !isNaN(db)) addEdge(arr[i].stop_id, arr[i + 1].stop_id, Math.abs(db - da));
  }
}

// Real interchanges GTFS omits (walk between two distinct stops).
const hav = (a, b, c, d) => {
  const R = 6371e3, t = x => (x * Math.PI) / 180;
  const dla = t(c - a), dlo = t(d - b);
  const A = Math.sin(dla / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dlo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
};
const TRANSFERS = [
  ['234', '500'], // Noida Sec-52 (Blue) <-> Noida Sector 51 (Aqua): sole Aqua link
  ['156', '181'], // Dhaula Kuan (Airport) <-> Durgabai Deshmukh (Pink)
];
for (const [a, b] of TRANSFERS) addEdge(a, b, hav(...coord[a], ...coord[b]));

const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const ids = Object.keys(adj).map(Number).sort((a, b) => a - b);

const graph = {}, colorLines = {}, interchange = {};
for (const id of ids) {
  graph[id] = {};
  for (const n of Object.keys(adj[id]).map(Number).sort((a, b) => a - b)) {
    graph[id][n] = +median(adj[id][n]).toFixed(2);
  }
  const set = [...(stopColors[id] || [])];
  if (set.length === 1) colorLines[id] = set[0];
  else { colorLines[id] = 'interchange'; interchange[id] = set; }
}

// --- emit ---
const emitGraph = () => ids.map(k => {
  const inner = Object.keys(graph[k]).map(Number).sort((a, b) => a - b)
    .map(n => `    ${n}: ${graph[k][n]},`).join('\n');
  return `  ${k}: {\n${inner}\n  },`;
}).join('\n');

let out = `// AUTO-GENERATED from the DMRC GTFS feed by scripts/buildGraphFromGtfs.js.
// Do not edit by hand - re-run the generator instead.
//
// graphWithIds                 : station id -> { neighbour id: distance in metres }
// colorLinesWithIds            : station id -> line hex, or 'interchange' (>1 line)
// interchangeStationsWithColors: interchange id -> [line hexes]
//
// Connections + distances are taken directly from GTFS stop sequences. Two real
// out-of-network interchange transfers GTFS does not encode are added:
//   234<->500  Noida Sec-52 (Blue)  <-> Noida Sector 51 (Aqua)  [only Aqua link]
//   156<->181  Dhaula Kuan (Airport) <-> Durgabai Deshmukh (Pink)

let graphWithIds = {
${emitGraph()}
};

`;

// colorLinesWithIds grouped by line
const byLine = {};
for (const id of ids) {
  if (colorLines[id] === 'interchange') continue;
  (byLine[colorLines[id]] ||= []).push(id);
}
out += 'let colorLinesWithIds = {\n';
for (const hex of Object.keys(byLine)) {
  out += `  // ${HEX_LABEL[hex]} Line\n`;
  for (const id of byLine[hex]) out += `  ${id}: '${hex}', // ${stopName[id]}\n`;
  out += '\n';
}
out += '  // Interchanges\n';
for (const id of Object.keys(interchange).map(Number).sort((a, b) => a - b)) {
  out += `  ${id}: 'interchange', // ${stopName[id]}\n`;
}
out += '};\n\n';

out += 'let interchangeStationsWithColors = {\n';
for (const id of Object.keys(interchange).map(Number).sort((a, b) => a - b)) {
  out += `  ${id}: [${interchange[id].map(h => `'${h}'`).join(', ')}], // ${stopName[id]}\n`;
}
out += '};\n\n';
out += 'export {graphWithIds, colorLinesWithIds, interchangeStationsWithColors};\n';

fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT}`);
console.log(`  ${ids.length} stations, ${Object.keys(interchange).length} interchanges`);
