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
  
  // Function to count interchanges in a path
  const countInterchanges = (path) => {
    if (path.length <= 1) return 0;
    
    let interchanges = 0;
    let interChangeStations = [];
    let currentLine = null;
    let lineChangeColors = [];
    
    for (let i = 0; i < path.length; i++) {
      const station = path[i];
      const stationLine = stationLines[station];

      if(stationLine == null || stationLine == "interchange"){
        continue;
      }
      // If this is the first station, set the current line
      if (i === 0) {
        currentLine = stationLine;
        continue;
      }
      
      // Check if the line changed
      if (stationLine !== currentLine) {
        interchanges++;
        interChangeStations.push(station)
        lineChangeColors.push(stationLine);
        currentLine = stationLine;
      }
    }
    
    return {interchanges, interChangeStations, lineChangeColors};
  };
  
  // For DFS, we'll use a recursive function
  function dfs(currentStation, path, totalDistance, visited, colorPath) {
    // If we've reached the destination, add the path to our results≠
    if (currentStation === end) {
      const {interchanges, interChangeStations, lineChangeColors} = countInterchanges(path);
      allRoutes.push({
        path: [...path],
        distance: totalDistance,
        interchanges: interchanges,
        interChangeStations: interChangeStations,
        colorPath: [...colorPath],
        lineChangeColors:[...lineChangeColors]
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
      const newColorPath = [...colorPath, stationLines[neighbor]]
      
      // Continue DFS
      dfs(neighbor, newPath, newDistance, newVisited, newColorPath);
    }
  }
  
  // Start DFS from the start station
  dfs(start, [start], 0, new Set([start]), [stationLines[start]]);
  
  
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
  
  return sortedBasedOnInterchanges?.slice(0,1)
}

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