// Initialize the map 
const map = L.map('map').setView([0, 0], 2);

// Adding a tile layer  to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 50000;
}

// Determine color based on depth
function getColor(depth) {
    return depth > 500 ? '#0000FF' : 
           depth > 300 ? '#00FFFF' : 
           depth > 200 ? '#00FF00' : 
           depth > 100 ? '#FFFF00' : 
           depth > 50  ? '#FFA500' : 
           depth > 20  ? '#FF0000' : 
           depth > 10  ? '#8B0000' : 
           depth > 0   ? '#8A2BE2' : 
                         '#8FBC8F';  
}

// Query earthquake data 
let queryURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

fetch(queryURL)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const earthquakes = data.features;
        earthquakes.forEach(eq => {
            const coords = eq.geometry.coordinates;
            const lat = coords[1];
            const lng = coords[0];
            const depth = coords[2];
            const mag = eq.properties.mag;
            const place = eq.properties.place;
            const time = new Date(eq.properties.time).toLocaleString();

            // Create a circle marker based on the earthquake's latitude and longitude
            L.circle([lat, lng], {
                color: getColor(depth),
                fillColor: getColor(depth),
                fillOpacity: 0.75,
                radius: markerSize(mag)
            }).addTo(map).bindPopup(
                `<strong>Location:</strong> ${place}<br>
                 <strong>Magnitude:</strong> ${mag}<br>
                 <strong>Depth:</strong> ${depth} km<br>
                 <strong>Time:</strong> ${time}`);
        });
    })
    .catch(error => console.error('Error loading the data:', error));

// Create a legend for the map to explain the depth color coding
const legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depths = [-10, 10, 20, 50, 100, 200, 300, 500],
        labels = [],
        from, to, color;

    // Loop through the depth intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depths.length; i++) {
        from = depths[i];
        to = depths[i + 1];

        // Get color for current depth. If it's the last one, add a '+' to denote 'and above'.
        color = getColor(from + 1);
        labels.push(
            '<i style="background:' + color + '"></i> ' +
            from + (to ? '–' + to : '+')
        );
    }

    div.innerHTML = '<strong>Depth (km)</strong><br>' + labels.join('<br>');
    return div;
};
legend.addTo(map);

