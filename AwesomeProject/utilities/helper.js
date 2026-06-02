import { colorLinesWithIds, interchangeStationsWithColors } from "../components/graph";

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
        distance: currentDistance
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
}

export const findAllRoutes2  = (graph, start, end, stationLines, maxDepth = 50) => {
  
  // Check if start and end exist in graph
  if (!graph[start] || !graph[end]) {
          return [];
  }
  
  // Array to store all possible routes
  const allRoutes = [];

  const createColorPath = (path) => {
    let colorPath = [];
    if(path.length == 18){
      console.log("path", path)
    }
    for(let i = 0; i < path.length; i++) {
      const currentStation = path[i];
      const currentStationLine = stationLines[currentStation];
      
      // If current station is an interchange station
      if (currentStationLine === 'interchange') {
        const interchangeColors = interchangeStationsWithColors[currentStation];
        
        // Get previous color if exists
        const prevColor = i > 0 ? colorPath[i-1] : null;
        
        // Look ahead for next non-interchange station's color
        let nextColor = null;
        let j = i + 1;
        while (j < path.length && stationLines[path[j]] === 'interchange') {
          j++;
        }
        if (j < path.length) {
          nextColor = colorLinesWithIds[path[j]];
        }
        
        // Priority 1: Use previous color if it's valid for this interchange
        if (prevColor && interchangeColors.includes(prevColor)) {
          colorPath.push(prevColor);
        }
        // Priority 2: Use next color if it's valid for this interchange
        else if (nextColor && interchangeColors.includes(nextColor)) {
          colorPath.push(nextColor);
        }
        // Priority 3: Use first available color from interchange colors
        else if (interchangeColors.length > 0) {
          colorPath.push(interchangeColors[0]);
        }
      } else {
        // For regular stations, use their assigned color
        colorPath.push(colorLinesWithIds[currentStation]);
      }
    }
    
    return colorPath;
  }
  
  // Function to count interchanges in a path
  const countInterchanges = (path) => {
    if (path.length <= 1) return 0;
    
    let interchanges = 0;
    let interChangeStations = [];
    let currentLine = null;
    let lineChangeColors = [];
    let colorPath = createColorPath(path);

    if(path.length == 18){
      console.log("path", path)
    }
    
    for (let i = 0; i < path.length; i++) {
      const station = path[i];
      const stationLine = stationLines[station];
      
      if (i === 0) {
        currentLine = colorPath[0];
        continue;
      }
      
      // Check if the line changed
      if (colorPath[i] !== currentLine) {
        interchanges++;
        interChangeStations.push(path[i-1]);
        lineChangeColors.push(colorPath[i]);
        currentLine = colorPath[i];
      }
    }
    
    return {interchanges, interChangeStations, lineChangeColors, colorPath};
  };
  
  // For DFS, we'll use a recursive function
  function dfs(currentStation, path, totalDistance, visited) {
    // If we've reached the destination, add the path to our results
    if (currentStation === end) {
      const {interchanges, interChangeStations, lineChangeColors, colorPath} = countInterchanges(path);
      allRoutes.push({
        path: [...path],
        distance: totalDistance,
        interchanges: interchanges,
        interChangeStations: interChangeStations,
        colorPath: [...colorPath],
        lineChangeColors: [...lineChangeColors]
      });
      return;
    }
    
    // If path is too long, skip expanding this path further
    if (path.length > maxDepth) {
      return;
    }
    
    // Get neighbors of current station
    const neighbors = graph[currentStation];
    
    // For each neighbor
    for (const neighbor in neighbors) {
      // Skip if we've already visited this station in the current path
      if (visited.has(neighbor)) {
        continue;
      }
      
      // Create new visited set for this branch
      const newVisited = new Set(visited);
      newVisited.add(neighbor);
      
      // Calculate new distance
      const newDistance = totalDistance + neighbors[neighbor];
      
      // Create new path by appending this neighbor
      const newPath = [...path, neighbor];
      
      // Continue DFS
      dfs(neighbor, newPath, newDistance, newVisited);
    }
  }
  
  // Start DFS from the start station
  dfs(start, [start], 0, new Set([start]));
  
  // Sort routes by distance and then by number of interchanges
  allRoutes.sort((a, b) => {
    // First compare by distance
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    // If distances are equal, compare by number of interchanges
    return a.interchanges - b.interchanges;
  });
  
  let sortedBasedOnInterchanges = allRoutes ? allRoutes.sort((a, b) => a.interchanges - b.interchanges) : [];
  
  return sortedBasedOnInterchanges?.slice(0,1);
}

// Returns several distinct route candidates (not just the single best) so the
// UI can offer alternative options. Reuses the same colour/interchange logic
// as findAllRoutes2 without altering it.
export const findRouteOptions = (graph, start, end, stationLines, maxOptions = 4, maxDepth = 50) => {
  if (!graph[start] || !graph[end]) return [];
  const allRoutes = [];

  const createColorPath = (path) => {
    let colorPath = [];
    for (let i = 0; i < path.length; i++) {
      const currentStation = path[i];
      const currentStationLine = stationLines[currentStation];
      if (currentStationLine === 'interchange') {
        const interchangeColors = interchangeStationsWithColors[currentStation];
        const prevColor = i > 0 ? colorPath[i - 1] : null;
        let nextColor = null;
        let j = i + 1;
        while (j < path.length && stationLines[path[j]] === 'interchange') j++;
        if (j < path.length) nextColor = colorLinesWithIds[path[j]];
        if (prevColor && interchangeColors.includes(prevColor)) colorPath.push(prevColor);
        else if (nextColor && interchangeColors.includes(nextColor)) colorPath.push(nextColor);
        else if (interchangeColors.length > 0) colorPath.push(interchangeColors[0]);
      } else {
        colorPath.push(colorLinesWithIds[currentStation]);
      }
    }
    return colorPath;
  };

  const countInterchanges = (path) => {
    let interchanges = 0;
    let interChangeStations = [];
    let currentLine = null;
    let lineChangeColors = [];
    let colorPath = createColorPath(path);
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

  function dfs(currentStation, path, totalDistance, visited) {
    if (currentStation === end) {
      const { interchanges, interChangeStations, lineChangeColors, colorPath } = countInterchanges(path);
      allRoutes.push({
        path: [...path], distance: totalDistance, interchanges,
        interChangeStations, colorPath: [...colorPath], lineChangeColors: [...lineChangeColors],
      });
      return;
    }
    if (path.length > maxDepth) return;
    const neighbors = graph[currentStation];
    for (const neighbor in neighbors) {
      if (visited.has(neighbor)) continue;
      const newVisited = new Set(visited);
      newVisited.add(neighbor);
      dfs(neighbor, [...path, neighbor], totalDistance + neighbors[neighbor], newVisited);
    }
  }
  dfs(start, [start], 0, new Set([start]));

  // De-duplicate by interchange signature, keep variety of options.
  const seen = new Set();
  const distinct = [];
  for (const r of allRoutes.sort((a, b) => a.distance - b.distance)) {
    const sig = `${r.interchanges}-${r.interChangeStations.join(',')}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    distinct.push(r);
    if (distinct.length >= maxOptions) break;
  }
  return distinct;
};

// Example usage:
// const graph = {
//   'Station A': { 'Station B': 5 },
//   'Station B': { 'Station A': 5, 'Station C': 3 },
//   'Station C': { 'Station B': 3, 'Station D': 4 },
//   'Station D': { 'Station C': 4 }
// };
//
// const stationLines = {
//   'Station A': 'Line 1',
//   'Station B': 'Line 1',
//   'Station C': 'Line 2',
//   'Station D': 'Line 2'
// };
//
// const routes = findAllRoutes(graph, 'Station A', 'Station D', stationLines);

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
        transfers: transfers
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