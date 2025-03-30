const fs = require('fs');

// Read all the files
const shapesData = fs.readFileSync('shapes.txt', 'utf8').split('\n');
const tripsData = fs.readFileSync('trips.txt', 'utf8').split('\n');
const routesData = fs.readFileSync('routes.txt', 'utf8').split('\n');

// Create route_id to color mapping from routes.txt
const routeColors = {};
routesData.forEach(line => {
    if (!line || line.startsWith('route_id')) return; // Skip header and empty lines
    const [route_id, , , route_long_name] = line.split(',');
    if (route_long_name) {
        const colorName = route_long_name.split('_')[0]; // Gets 'RED', 'BLUE', etc.
        routeColors[route_id] = colorName;
    }
});

// Create shape_id to route_id mapping from trips.txt
const shapeToRoute = {};
tripsData.forEach(line => {
    if (!line || line.startsWith('route_id')) return; // Skip header and empty lines
    const [route_id, , , , , , , shape_id] = line.split(',');
    if (shape_id) {
        shapeToRoute[shape_id] = route_id;
    }
});

// Define color codes for each line
const colorCodes = {
    'RED': '#CC0000',
    'BLUE': '#0000FF',
    'YELLOW': '#F7D117',
    'GREEN': '#008000',
    'VIOLET': '#8F00FF',
    'PINK': '#FF69B4',
    'MAGENTA': '#800080',
    'GRAY': '#808080',
    'ORANGE': '#FFA500',
    'AQUA': '#00FFFF',
    'RAPID': '#FF4500'
};

// Update shapes.txt with color information
const updatedShapesData = shapesData.map(line => {
    if (!line) return line; // Skip empty lines
    if (line.startsWith('shape_id')) {
        return line + ',shape_color'; // Add color column header
    }
    const [shape_id, ...rest] = line.split(',');
    const route_id = shapeToRoute[shape_id];
    const routeColor = routeColors[route_id];
    const colorCode = colorCodes[routeColor] || '#000000';
    return line + ',' + colorCode;
});

// Write the updated data back to shapes.txt
fs.writeFileSync('shapes_with_colors.txt', updatedShapesData.join('\n'));

// Log some statistics
console.log('Processing complete!');
console.log('Routes found:', Object.keys(routeColors).length);
console.log('Shapes processed:', shapesData.length - 1); // -1 for header
console.log('Shape to route mappings:', Object.keys(shapeToRoute).length);