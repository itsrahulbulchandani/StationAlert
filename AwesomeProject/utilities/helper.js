import { colorLinesWithIds, interchangeStationsWithColors } from '../components/graph';

export const buildGraph = (stations, shapes) => {
  const graph = {};
  // Add each station to the graph
  stations.forEach(station => {
    graph[station.title] = {};
  });

  Object.values(shapes).forEach(shape => {
    // For each pair of consecutive points in the shape
    for (let i = 0; i < shape.length - 1; i++) {
      const start = shape[i];
      const end = shape[i + 1];
      const startStation = getNearestStation(stations, start);
      const endStation = getNearestStation(stations, end);

      if (startStation && endStation && startStation.title !== endStation.title) {
        // Get the closest shape point to each station
        const startShapePoint = getClosestShapePoint(shape, startStation.coordinate);
        const endShapePoint = getClosestShapePoint(shape, endStation.coordinate);

        if (startShapePoint && endShapePoint) {
          const distance = Math.abs(endShapePoint.distance - startShapePoint.distance);
          const from = startStation.title;
          const to = endStation.title;

          // Add edge both ways (undirected graph)
          graph[from][to] = Math.min(graph[from][to] || Infinity, distance);
          graph[to][from] = Math.min(graph[to][from] || Infinity, distance);
        }
      }
    }
  });
  return graph;
};


// Function to lighten a color
export const lightenColor = (color, percent = 0.8) => {
  // Remove the # if it exists
  let hex = color.replace('#', '');

  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Lighten the color
  r = Math.floor(r + (255 - r) * percent);
  g = Math.floor(g + (255 - g) * percent);
  b = Math.floor(b + (255 - b) * percent);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
// Haversine formula if needed elsewhere
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Get the closest station to a shape point
const getNearestStation = (stations, point) => {
  let nearest = null;
  let minDist = Infinity;
  stations.forEach(station => {
    if(point?.shape_color == station?.color){
      const dist = calculateDistance(
        station.coordinate.latitude,
        station.coordinate.longitude,
        point.latitude,
        point.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = station;
      }
    }
  });
  return nearest;
};

// Get the closest shape point to a station
const getClosestShapePoint = (shape, coordinate) => {
  let nearest = null;
  let minDist = Infinity;
  shape.forEach(point => {
    const dist = calculateDistance(
      point.latitude,
      point.longitude,
      coordinate.latitude,
      coordinate.longitude
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = point;
    }
  });
  return nearest;
};

// BFS to find all possible routes
export const findAllRoutes = (graph, start, end, maxDepth = 50) => {

  // Check if start and end exist in graph
  if (!graph[start] || !graph[end]) {
    return [];
  }

  // Array to store all possible routes
  const allRoutes = [];

  // Queue for BFS, each element is [currentStation, path, totalDistance]
  const queue = [[start, [start], 0]];

  // Set to keep track of stations we've already explored
  const visited = new Set([start]);

  while (queue.length > 0) {
    const [currentStation, currentPath, currentDistance] = queue.shift();

    // If we've reached the destination, add the path to our results
    if (currentStation === end) {
      allRoutes.push({
        path: [...currentPath],
        distance: currentDistance,
      });
      continue;
    }

    // If path is too long, skip expanding this path further
    if (currentPath.length > maxDepth) {
      continue;
    }

    // Get neighbors of current station
    const neighbors = graph[currentStation];

    // For each neighbor
    for (const neighbor in neighbors) {
      // Skip if we've already visited this station
      if (visited.has(neighbor)) {
        continue;
      }

      // Mark as visited
      visited.add(neighbor);

      // Calculate new distance
      const newDistance = currentDistance + neighbors[neighbor];

      // Create new path by appending this neighbor
      const newPath = [...currentPath, neighbor];

      // Add to queue
      queue.push([neighbor, newPath, newDistance]);
    }
  }


  // Sort routes by distance
  allRoutes.sort((a, b) => a.distance - b.distance);

  return allRoutes;
};

// ---------------------------------------------------------------------------
// Colour / interchange derivation (shared by all route finders).
//
// These reproduce the original semantics exactly: a route's colourPath assigns
// a line colour to every station, interchange stations adopt the colour of the
// line you are travelling on, and an interchange is counted whenever the colour
// changes between consecutive stations.
// ---------------------------------------------------------------------------
const createColorPath = (path, stationLines) => {
  const colorPath = [];
  for (let i = 0; i < path.length; i++) {
    const currentStation = path[i];
    const currentStationLine = stationLines[currentStation];

    if (currentStationLine === 'interchange') {
      const interchangeColors = interchangeStationsWithColors[currentStation] || [];
      const prevColor = i > 0 ? colorPath[i - 1] : null;

      // Look ahead for the next non-interchange station's colour.
      let nextColor = null;
      let j = i + 1;
      while (j < path.length && stationLines[path[j]] === 'interchange') {j++;}
      if (j < path.length) {nextColor = colorLinesWithIds[path[j]];}

      if (prevColor && interchangeColors.includes(prevColor)) {colorPath.push(prevColor);}
      else if (nextColor && interchangeColors.includes(nextColor)) {colorPath.push(nextColor);}
      else if (interchangeColors.length > 0) {colorPath.push(interchangeColors[0]);}
      else {colorPath.push(colorLinesWithIds[currentStation]);}
    } else {
      colorPath.push(colorLinesWithIds[currentStation]);
    }
  }
  return colorPath;
};

const countInterchanges = (path, stationLines) => {
  const colorPath = createColorPath(path, stationLines);
  let interchanges = 0;
  const interChangeStations = [];
  const lineChangeColors = [];
  let currentLine = null;
  for (let i = 0; i < path.length; i++) {
    if (i === 0) { currentLine = colorPath[0]; continue; }
    if (colorPath[i] !== currentLine) {
      interchanges++;
      interChangeStations.push(path[i - 1]);
      lineChangeColors.push(colorPath[i]);
      currentLine = colorPath[i];
    }
  }
  return { interchanges, interChangeStations, lineChangeColors, colorPath };
};

// Build the full route object the UI/routeMetrics consume from a bare path.
const describeRoute = (graph, path, stationLines) => {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    distance += graph[path[i]]?.[path[i + 1]] || 0;
  }
  const { interchanges, interChangeStations, lineChangeColors, colorPath } =
    countInterchanges(path, stationLines);
  return {
    path: [...path],
    distance,
    interchanges,
    interChangeStations,
    colorPath,
    lineChangeColors,
  };
};

// ---------------------------------------------------------------------------
// Shortest-path routing (Dijkstra) + Yen's k-shortest loopless paths.
//
// Replaces the previous exhaustive DFS, which enumerated every simple path and
// was both exponential and capped at maxDepth - silently returning no route for
// journeys longer than the cap (the network spans 55+ stations end to end).
// Dijkstra always finds the optimal path regardless of length and is bounded.
// ---------------------------------------------------------------------------

// Binary-min-heap keyed on numeric priority.
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].cost <= a[i].cost) {break;}
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let s = i;
        if (l < a.length && a[l].cost < a[s].cost) {s = l;}
        if (r < a.length && a[r].cost < a[s].cost) {s = r;}
        if (s === i) {break;}
        [a[s], a[i]] = [a[i], a[s]];
        i = s;
      }
    }
    return top;
  }
}

// Returns { path:[ids], distance } or null. Optionally avoids given node/edge
// keys (for Yen's algorithm). Edge keys are "a->b".
const dijkstra = (graph, start, end, blockedNodes, blockedEdges) => {
  start = String(start); end = String(end);
  if (!graph[start] || !graph[end]) {return null;}
  const dist = { [start]: 0 };
  const prev = {};
  const done = new Set();
  const heap = new MinHeap();
  heap.push({ node: start, cost: 0 });

  while (heap.size) {
    const { node } = heap.pop();
    if (done.has(node)) {continue;}
    done.add(node);
    if (node === end) {break;}
    const neighbors = graph[node] || {};
    for (const next in neighbors) {
      if (done.has(next)) {continue;}
      if (blockedNodes && blockedNodes.has(next)) {continue;}
      if (blockedEdges && blockedEdges.has(`${node}->${next}`)) {continue;}
      const nd = dist[node] + neighbors[next];
      if (dist[next] === undefined || nd < dist[next]) {
        dist[next] = nd;
        prev[next] = node;
        heap.push({ node: next, cost: nd });
      }
    }
  }

  if (dist[end] === undefined) {return null;}
  const path = [];
  for (let n = end; n !== undefined; n = prev[n]) {path.unshift(n);}
  return { path, distance: dist[end] };
};

// Yen's algorithm: up to K loopless paths in increasing total distance.
const yenKShortest = (graph, start, end, K = 12) => {
  start = String(start); end = String(end);
  const first = dijkstra(graph, start, end);
  if (!first) {return [];}
  const A = [first];
  const B = [];
  const seen = new Set([first.path.join(',')]);

  for (let k = 1; k < K; k++) {
    const prevPath = A[k - 1].path;
    for (let i = 0; i < prevPath.length - 1; i++) {
      const spurNode = prevPath[i];
      const rootPath = prevPath.slice(0, i + 1);
      const blockedEdges = new Set();
      for (const p of A) {
        if (p.path.length > i && p.path.slice(0, i + 1).join(',') === rootPath.join(',')) {
          blockedEdges.add(`${p.path[i]}->${p.path[i + 1]}`);
        }
      }
      // Don't revisit nodes already on the root path (keeps paths loopless).
      const blockedNodes = new Set(rootPath.slice(0, i));
      const spur = dijkstra(graph, spurNode, end, blockedNodes, blockedEdges);
      if (spur && spur.path.length > 1) {
        const totalPath = rootPath.slice(0, -1).concat(spur.path);
        const key = totalPath.join(',');
        if (!seen.has(key)) {
          let distance = 0;
          for (let j = 0; j < totalPath.length - 1; j++) {
            distance += graph[totalPath[j]]?.[totalPath[j + 1]] || 0;
          }
          B.push({ path: totalPath, distance });
        }
      }
    }
    if (!B.length) {break;}
    B.sort((a, b) => a.distance - b.distance);
    let next;
    do { next = B.shift(); } while (next && seen.has(next.path.join(',')));
    if (!next) {break;}
    seen.add(next.path.join(','));
    A.push(next);
  }
  return A;
};

// Colours a station can be ridden on (its single line, or every line that
// serves an interchange).
const colorsOf = id =>
  colorLinesWithIds[id] === 'interchange'
    ? (interchangeStationsWithColors[id] || [])
    : [colorLinesWithIds[id]];

// Interchange-optimal path via Dijkstra over (station, line) states with a
// lexicographic cost: minimise interchanges first, then distance. This is exact
// - unlike sorting the k shortest-by-distance paths by interchanges, which can
// miss a longer single-line ride that needs no change at all. Boarding a
// different line (at a shared-node interchange, or across a transfer edge that
// has no line in common) costs one interchange. Returns a station-id path.
const INTERCHANGE_COST = 1e7; // larger than any total metre distance on the net
const bestInterchangePath = (graph, start, end) => {
  start = String(start); end = String(end);
  if (!graph[start] || !graph[end]) {return null;}
  const dist = {};       // stateKey -> cost
  const prev = {};       // stateKey -> previous stateKey
  const done = new Set();
  const heap = new MinHeap();
  for (const c of colorsOf(start)) {
    const k = `${start}|${c}`;
    dist[k] = 0;
    heap.push({ key: k, station: start, color: c, cost: 0 });
  }

  let endKey = null;
  while (heap.size) {
    const cur = heap.pop();
    if (done.has(cur.key)) {continue;}
    done.add(cur.key);
    if (cur.station === end) { endKey = cur.key; break; }

    const neighbors = graph[cur.station] || {};
    for (const v in neighbors) {
      const vColors = colorsOf(v);
      const w = neighbors[v];
      if (vColors.includes(cur.color)) {
        // stay on the same line
        const k = `${v}|${cur.color}`;
        const nc = cur.cost + w;
        if (dist[k] === undefined || nc < dist[k]) {
          dist[k] = nc; prev[k] = cur.key;
          heap.push({ key: k, station: v, color: cur.color, cost: nc });
        }
      } else {
        // must board a different line to take this edge (+1 interchange)
        for (const c2 of vColors) {
          const k = `${v}|${c2}`;
          const nc = cur.cost + w + INTERCHANGE_COST;
          if (dist[k] === undefined || nc < dist[k]) {
            dist[k] = nc; prev[k] = cur.key;
            heap.push({ key: k, station: v, color: c2, cost: nc });
          }
        }
      }
    }
    // change line without moving (shared-node interchange) (+1 interchange)
    for (const c2 of colorsOf(cur.station)) {
      if (c2 === cur.color) {continue;}
      const k = `${cur.station}|${c2}`;
      const nc = cur.cost + INTERCHANGE_COST;
      if (dist[k] === undefined || nc < dist[k]) {
        dist[k] = nc; prev[k] = cur.key;
        heap.push({ key: k, station: cur.station, color: c2, cost: nc });
      }
    }
  }

  if (!endKey) {return null;}
  const stations = [];
  for (let k = endKey; k !== undefined; k = prev[k]) {
    const st = k.split('|')[0];
    if (!stations.length || stations[0] !== st) {stations.unshift(st);}
  }
  return stations;
};

// Returns the single best route ([route] for backwards compatibility),
// minimising interchanges first then distance. maxDepth is accepted for
// call-site compatibility but no longer used.
export const findAllRoutes2 = (graph, start, end, stationLines, maxDepth = 50) => {
  const path = bestInterchangePath(graph, start, end);
  if (!path) {return [];}
  return [describeRoute(graph, path, stationLines)];
};

// Returns several distinct route candidates (different interchange signatures)
// so the UI can offer alternatives, ordered by fewest interchanges then
// distance. The interchange-optimal route is always included; the k
// shortest-by-distance paths supply the faster/alternative options.
export const findRouteOptions = (graph, start, end, stationLines, maxOptions = 4, maxDepth = 50) => {
  if (!graph[start] || !graph[end]) {return [];}

  const paths = [];
  const optimal = bestInterchangePath(graph, start, end);
  if (optimal) {paths.push(optimal);}
  for (const c of yenKShortest(graph, start, end, 20)) {paths.push(c.path);}

  const candidates = paths.map(p => describeRoute(graph, p, stationLines));
  candidates.sort((a, b) =>
    a.interchanges !== b.interchanges
      ? a.interchanges - b.interchanges
      : a.distance - b.distance);

  const seen = new Set();
  const distinct = [];
  for (const r of candidates) {
    const sig = `${r.interchanges}-${r.interChangeStations.join(',')}`;
    if (seen.has(sig)) {continue;}
    seen.add(sig);
    distinct.push(r);
    if (distinct.length >= maxOptions) {break;}
  }
  return distinct;
};

// Alternative BFS implementation that limits routes by transfers
export const findRoutesWithTransfers = (graph, start, end, maxTransfers = 3) => {
  // Array to store all possible routes
  const allRoutes = [];

  // Queue for BFS, each element is [station, path, totalDistance, transfers]
  const queue = [[start, [start], 0, 0]];

  while (queue.length > 0) {
    const [currentStation, currentPath, currentDistance, transfers] = queue.shift();

    // If we've reached the destination, add the path to our results
    if (currentStation === end) {
      allRoutes.push({
        path: currentPath,
        distance: currentDistance,
        transfers: transfers,
      });
      continue;
    }

    // If transfers exceed limit, skip expanding this path further
    if (transfers > maxTransfers) {
      continue;
    }

    // Get neighbors of current station
    const neighbors = graph[currentStation];

    // For each neighbor
    for (const neighbor in neighbors) {
      // Skip if this station is already in our path (avoid cycles)
      if (currentPath.includes(neighbor)) {
        continue;
      }

      // Calculate new distance
      const newDistance = currentDistance + neighbors[neighbor];

      // Create new path by appending this neighbor
      const newPath = [...currentPath, neighbor];

      // Calculate if this is a transfer (simplified - in a real implementation,
      // you would check if the line/color changed)
      const isTransfer = currentPath.length > 1; // Simplified logic
      const newTransfers = isTransfer ? transfers + 1 : transfers;

      // Add to queue
      queue.push([neighbor, newPath, newDistance, newTransfers]);
    }
  }

  // Sort routes by distance, then by number of transfers
  allRoutes.sort((a, b) => {
    if (a.distance === b.distance) {
      return a.transfers - b.transfers;
    }
    return a.distance - b.distance;
  });

  return allRoutes;
};
