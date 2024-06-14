document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map
    const map = L.map('map').setView([20, 0], 2); // Centered at [lat, long] with zoom level 2

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data � <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch task boundaries data
    fetch('GetTasksForMap.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(task => {
                // Parse the PLNXML to extract waypoints
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(task.PLNXML, "text/xml");
                const waypoints = xmlDoc.getElementsByTagName("ATCWaypoint");

                // Extract coordinates from WorldPosition
                const coordinates = [];
                for (let i = 0; i < waypoints.length; i++) {
                    const worldPosition = waypoints[i].getElementsByTagName("WorldPosition")[0].textContent;
                    const [lat, lon] = parseWorldPosition(worldPosition);
                    coordinates.push([lat, lon]);
                }

                // Ensure coordinates array is valid before creating polyline
                if (coordinates.length > 0) {
                    const polyline = L.polyline(coordinates, {
                        color: "#ff7800", // Default line color
                        weight: 5, // Default line thickness
                        opacity: 0.7,
                        className: 'task-polyline' // Custom class for CSS styling
                    }).addTo(map)
                        .bindPopup(`<strong>EntrySeqID:</strong> ${task.EntrySeqID}<br>
                                <strong>Title:</strong> ${task.Title}`);

                    // Event handlers for polyline
                    polyline.on('mouseover', function () {
                        if (!this.options.selected) { // Only change if not selected
                            this.setStyle({ color: '#0000CD', weight: 5 }); // Medium blue
                        }
                    });

                    polyline.on('mouseout', function () {
                        if (!this.options.selected) { // Only change if not selected
                            this.setStyle({ color: '#ff7800', weight: 5 }); // Default color
                        }
                    });

                    polyline.on('click', function () {
                        resetPolylines(); // Reset other polylines
                        this.setStyle({ color: '#0000ff', weight: 7 }); // Solid blue
                        this.options.selected = true; // Mark as selected
                    });

                    polyline.on('popupclose', function () {
                        this.setStyle({ color: '#ff7800', weight: 5 });
                        this.options.selected = false; // Unmark as selected
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error fetching task boundaries:', error);
        });

    // Helper function to parse WorldPosition string
    function parseWorldPosition(worldPosition) {
        const regex = /([NS])(\d+)� (\d+)' ([\d.]+)",([EW])(\d+)� (\d+)' ([\d.]+)"/;
        const match = regex.exec(worldPosition);
        if (!match) return [0, 0];

        const lat = parseCoordinate(match[1], match[2], match[3], match[4]);
        const lon = parseCoordinate(match[5], match[6], match[7], match[8]);
        return [lat, lon];
    }

    // Helper function to convert DMS to decimal
    function parseCoordinate(direction, degrees, minutes, seconds) {
        let decimal = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
        if (direction === 'S' || direction === 'W') decimal = -decimal;
        return decimal;
    }

    // Reset all polylines to default color
    function resetPolylines() {
        map.eachLayer(layer => {
            if (layer instanceof L.Polyline && layer.options.selected) {
                layer.setStyle({ color: '#ff7800', weight: 5 });
                layer.options.selected = false;
            }
        });
    }
});
