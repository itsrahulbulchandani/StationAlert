// Derives fare, journey time, segments and per-station clock times from a
// route object produced by findAllRoutes2 ({ path, colorPath, distance,
// interchanges, interChangeStations, lineChangeColors }).
import stationsFromKeys from '../components/stationsFromKeys';

// Per-hop running time and interchange dwell (minutes). Tuned to DMRC averages
// (~2 min between stations incl. dwell, ~5 min to change lines).
const HOP_MIN = 2;
const INTERCHANGE_MIN = 5;

// Delhi Metro distance-based fare slabs (non-Airport lines).
const fareForKm = km => {
  if (km <= 2) return 10;
  if (km <= 5) return 20;
  if (km <= 12) return 30;
  if (km <= 21) return 40;
  if (km <= 32) return 50;
  return 60;
};

const LINE_INFO = {
  '#CC0000': { name: 'Red Line', color: '#CC0000' },
  '#F7D117': { name: 'Yellow Line', color: '#E3A900' },
  '#0000FF': { name: 'Blue Line', color: '#0A55D8' },
  '#FF69B4': { name: 'Pink Line', color: '#E91E8C' },
  '#8F00FF': { name: 'Violet Line', color: '#8F00FF' },
  '#800080': { name: 'Magenta Line', color: '#A0008C' },
  '#008000': { name: 'Green Line', color: '#1B9E1B' },
  '#00FFFF': { name: 'Aqua Line', color: '#0AA5A5' },
  '#00AEEF': { name: 'Rapid Metro', color: '#00AEEF' },
  '#FFA500': { name: 'Airport Express', color: '#FF8C00' },
  '#808080': { name: 'Grey Line', color: '#808080' },
};

export const getLineInfo = color => {
  if (!color) return { name: 'Metro Line', color: '#888' };
  return LINE_INFO[color.toUpperCase()] || { name: 'Metro Line', color };
};

export const lightenHex = (color, percent = 0.85) => {
  try {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const nr = Math.round(r + (255 - r) * percent);
    const ng = Math.round(g + (255 - g) * percent);
    const nb = Math.round(b + (255 - b) * percent);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  } catch (e) {
    return '#F2F2F2';
  }
};

const pad = n => (n < 10 ? `0${n}` : `${n}`);
export const formatClock = (base, offsetMin) => {
  const d = new Date(base.getTime() + offsetMin * 60000);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${pad(m)} ${ampm}`;
};

// Stable pseudo platform (1-4) derived from station id so the UI is consistent.
const platformFor = id => (Math.abs(parseInt(id, 10) || 0) % 4) + 1;

// Per-station cumulative time offsets (minutes from start).
const stationTimes = item => {
  const path = item.path || [];
  const colorPath = item.colorPath || [];
  const times = [0];
  for (let i = 1; i < path.length; i++) {
    let add = HOP_MIN;
    if (colorPath[i] !== colorPath[i - 1]) add += INTERCHANGE_MIN;
    times[i] = times[i - 1] + add;
  }
  return times;
};

export const computeRouteMetrics = (item, startDate = new Date()) => {
  if (!item || !item.path) {
    return null;
  }
  const path = item.path;
  const times = stationTimes(item);
  const stationsCount = path.length;
  const interchanges =
    item.interchanges != null ? item.interchanges : (item.interChangeStations?.length || 0);
  const durationMin = times[times.length - 1] || 0;
  const distanceKm = (item.distance && item.distance > 0
    ? item.distance
    : (stationsCount - 1) * 1100) / 1000;
  const fare = fareForKm(distanceKm);

  const fromName = stationsFromKeys[path[0]];
  const toName = stationsFromKeys[path[path.length - 1]];
  const startLine = getLineInfo(item.colorPath?.[0]);
  const endLine = getLineInfo(item.colorPath?.[path.length - 1]);

  return {
    stationsCount,
    interchanges,
    durationMin,
    distanceKm,
    fare,
    fromName,
    toName,
    startLine,
    endLine,
    startTime: formatClock(startDate, 0),
    arrivalTime: formatClock(startDate, durationMin),
    times,
    startDate,
  };
};

// Groups the path into per-line segments with board info and per-station times.
export const buildSegments = (item, startDate = new Date()) => {
  const path = item.path || [];
  const colorPath = item.colorPath || [];
  const times = stationTimes(item);
  const interSet = new Set(item.interChangeStations || []);

  const segments = [];
  let current = null;
  path.forEach((id, i) => {
    const color = colorPath[i];
    if (!current || color !== current.color) {
      current = {
        color,
        lineInfo: getLineInfo(color),
        stations: [],
        boardPlatform: platformFor(id),
      };
      segments.push(current);
    }
    current.stations.push({
      id,
      name: stationsFromKeys[id],
      time: formatClock(startDate, times[i]),
      offset: times[i],
      isInterchange: interSet.has(id),
      platform: platformFor(id),
    });
  });

  // "Towards" = final station of that line within this route.
  segments.forEach(seg => {
    seg.boardStation = seg.stations[0];
    seg.towards = seg.stations[seg.stations.length - 1].name;
  });
  // Last segment heads to the journey destination.
  if (segments.length) {
    segments[segments.length - 1].towards =
      stationsFromKeys[path[path.length - 1]];
  }
  return segments;
};

export default computeRouteMetrics;
