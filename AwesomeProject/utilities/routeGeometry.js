// Builds the highlighted-journey polyline so it follows the ACTUAL metro track
// geometry instead of joining station dots with straight lines.
//
// The base network is drawn from `shapes` (parsed shapes_with_colors.txt) which
// holds the real, curving track path as many ordered points per line/branch.
// A route, however, is just a list of station ids — so naively connecting their
// coordinates gives straight chords that cut across the real alignment.
//
// For each hop (station A -> next station B) we find the shape of that line on
// which both A and B sit closest, then slice the shape's vertices between them.
// Consecutive hops are grouped into per-line-colour segments (matching the
// station marker colours), with a straight connector bridging interchanges.
//
// Returns: [{ color: <displayHex>, coords: [{latitude, longitude}, ...] }, ...]
// Coordinates are {latitude, longitude}; the Android (MapLibre) map converts to
// [lng, lat] itself.

// Max distance (in degrees, ~111 km/deg) a station may sit from a shape vertex
// for the snap to be trusted. Stations lie on their line's shape, so a real snap
// is only tens of metres; beyond this we assume the shape doesn't cover the hop
// (e.g. missing branch data) and fall back to a straight line. ~0.005° ≈ 550 m.
const MAX_SNAP_DEG = 0.005;
const MAX_SNAP_SQ = MAX_SNAP_DEG * MAX_SNAP_DEG;

const isFinitePair = c =>
  c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude);

const sameCoord = (a, b) =>
  a && b && a.latitude === b.latitude && a.longitude === b.longitude;

// Cheap squared planar distance in degrees — fine for nearest-vertex ranking at
// city scale (no need for haversine here).
const sqDist = (a, b) => {
  const dLat = a.latitude - b.latitude;
  const dLon = a.longitude - b.longitude;
  return dLat * dLat + dLon * dLon;
};

// Index of the shape vertex nearest to `coord`, with its squared distance.
const nearestVertex = (pts, coord) => {
  let bestI = -1;
  let bestD = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const d = sqDist(pts[i], coord);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  return {index: bestI, dist: bestD};
};

// Group shape point-arrays by their (upper-cased) colour for quick lookup.
const groupShapesByColor = shapes => {
  const byColor = {};
  Object.values(shapes || {}).forEach(pts => {
    if (!pts || !pts.length) return;
    const col = (pts[0].shape_color || '').trim().toUpperCase();
    if (!col) return;
    (byColor[col] || (byColor[col] = [])).push(pts);
  });
  return byColor;
};

// Slice the best-fitting shape between station coords A and B. Considers every
// shape whose colour is one of `rawColors` (the source hex on each station, e.g.
// "#CC0000") and picks the one where A and B snap closest combined. Returns the
// ordered vertices [{latitude, longitude}] from A to B, or null when no shape
// covers the hop well enough.
const sliceShapeBetween = (shapesByColor, rawColors, A, B) => {
  let best = null;
  for (const raw of rawColors) {
    const col = (raw || '').trim().toUpperCase();
    const candidates = shapesByColor[col];
    if (!candidates) continue;
    for (const pts of candidates) {
      const a = nearestVertex(pts, A);
      const b = nearestVertex(pts, B);
      const score = a.dist + b.dist;
      if (!best || score < best.score) {
        best = {pts, ai: a.index, bi: b.index, aDist: a.dist, bDist: b.dist, score};
      }
    }
  }
  if (!best || best.aDist > MAX_SNAP_SQ || best.bDist > MAX_SNAP_SQ) return null;

  const {pts, ai, bi} = best;
  const slice =
    ai <= bi ? pts.slice(ai, bi + 1) : pts.slice(bi, ai + 1).reverse();
  return slice.map(p => ({latitude: p.latitude, longitude: p.longitude}));
};

const pushUnique = (coords, c) => {
  if (!isFinitePair(c)) return;
  if (coords.length && sameCoord(coords[coords.length - 1], c)) return;
  coords.push(c);
};

// Build per-colour route segments that trace the real track.
export const buildRouteSegments = (
  selectedRoute = {},
  stations = [],
  shapes = {},
  getLineInfo = () => ({color: '#888'}),
) => {
  const path = selectedRoute?.path || [];
  const colorPath = selectedRoute?.colorPath || [];
  if (!path.length) return [];

  const byId = new Map(stations.map(s => [String(s.id), s]));
  const shapesByColor = groupShapesByColor(shapes);

  const segs = [];
  let cur = null;
  let prevStation = null;
  let prevRaw = null;

  path.forEach((id, i) => {
    const st = byId.get(String(id));
    if (!st || !isFinitePair(st.coords)) return;

    const raw = colorPath[i];
    const dispColor = getLineInfo(raw).color;

    if (!cur || cur.color !== dispColor) {
      // New line segment. Bridge from the previous segment's last point with a
      // straight connector across the interchange, then start at this station.
      cur = {color: dispColor, coords: []};
      if (segs.length) {
        const prevCoords = segs[segs.length - 1].coords;
        if (prevCoords.length) pushUnique(cur.coords, prevCoords[prevCoords.length - 1]);
      }
      segs.push(cur);
      pushUnique(cur.coords, st.coords);
    } else if (prevStation) {
      // Same line — trace the actual track from the previous station to here.
      const rawColors =
        prevRaw && prevRaw !== raw ? [raw, prevRaw] : [raw];
      const slice = sliceShapeBetween(
        shapesByColor,
        rawColors,
        prevStation.coords,
        st.coords,
      );
      if (slice && slice.length > 1) {
        slice.forEach(p => pushUnique(cur.coords, p));
        // Ensure the polyline reaches the station marker exactly.
        pushUnique(cur.coords, st.coords);
      } else {
        pushUnique(cur.coords, st.coords);
      }
    }

    prevStation = st;
    prevRaw = raw;
  });

  return segs;
};

export default buildRouteSegments;
