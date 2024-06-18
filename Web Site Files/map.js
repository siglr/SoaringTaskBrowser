document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([20, 0], 2);
    const defWeight = 6;
    const hoverWeight = 7;
    const selWeight = 8;

    // Define different map layers
    const layers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
        "Google Terrain": L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
            attribution: 'Map data © <a href="https://maps.google.com">Google</a>',
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            tileSize: 256,
        }),
        "TopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://opentopomap.org">OpenTopoMap</a>'
        }),
        "Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: 'Map data © <a href="https://maps.google.com">Google</a>',
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            tileSize: 256,
        })
    };

    // Add the default layer to the map
    layers["Google Terrain"].addTo(map);

    // Add layer control to the map
    L.control.layers(layers).addTo(map);

    let runningInApp = false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('appContext')) {
        runningInApp = true;
    } else {
        runningInApp = false;
    }

    const polylines = {};
    let currentPolyline = null; // Track the currently selected polyline
    let currentEntrySeqID = null; // Track the EntrySeqID of the selected polyline

    function fetchTasks(bounds) {
        const { _southWest: sw, _northEast: ne } = bounds;

        const bufferKm = 1;
        const bufferLat = bufferKm / 110.574; // Approximate conversion from km to latitude
        const bufferLng = bufferKm / (111.320 * Math.cos((sw.lat + ne.lat) / 2 * Math.PI / 180)); // Approx conversion from km to longitude

        const latMin = sw.lat - bufferLat;
        const latMax = ne.lat + bufferLat;
        const lngMin = sw.lng - bufferLng;
        const lngMax = ne.lng + bufferLng;

        fetch(`GetTasksForMap.php?latMin=${latMin}&latMax=${latMax}&lngMin=${lngMin}&lngMax=${lngMax}`)
            .then(response => response.json())
            .then(data => {
                // console.log(`Number of tasks fetched: ${data.length}`);

                // Making sure to keep the currently selected task because it will get set to null by removing all polylines
                let preventEntrySeqIDlost = currentEntrySeqID;

                // Clear existing polylines
                Object.values(polylines).forEach(polyline => {
                    map.removeLayer(polyline);
                });

                // Clear the polylines object
                for (const key in polylines) {
                    delete polylines[key];
                }

                // Resetting the current selected task after clearing all polylines
                currentEntrySeqID = preventEntrySeqIDlost;

                data.forEach(task => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(task.PLNXML, "text/xml");
                    const waypoints = xmlDoc.getElementsByTagName("ATCWaypoint");

                    const coordinates = [];
                    for (let i = 0; i < waypoints.length; i++) {
                        const worldPosition = waypoints[i].getElementsByTagName("WorldPosition")[0].textContent;
                        const [lat, lon] = parseWorldPosition(worldPosition);
                        coordinates.push([lat, lon]);
                    }

                    if (coordinates.length > 0) {
                        const polyline = L.polyline(coordinates, {
                            color: "#ff7800",
                            weight: defWeight,
                            opacity: 0.7,
                            className: 'task-polyline'
                        });
                        polyline.addTo(map);
                        if (!runningInApp) {
                            polyline.bindPopup(`<strong>Task #</strong> ${task.EntrySeqID}<br>
                                        <strong>Title:</strong> ${task.Title}`);
                        }

                        polylines[task.EntrySeqID] = polyline;

                        polyline.on('mouseover', function () {
                            if (!this.options.selected) {
                                this.setStyle({ color: '#9900cc', weight: hoverWeight });
                            }
                        });

                        polyline.on('mouseout', function () {
                            if (!this.options.selected) {
                                this.setStyle({ color: '#ff7800', weight: defWeight });
                            }
                        });

                        polyline.on('click', function () {
                            resetPolylines();
                            this.setStyle({ color: '#0000ff', weight: selWeight });
                            this.options.selected = true;
                            currentPolyline = this; // Set the current polyline
                            currentEntrySeqID = task.EntrySeqID; // Track the EntrySeqID
                            postSelectedTask(task.EntrySeqID); // Notify the app
                        });

                        // Ensure this event only triggers if not in app context
                        if (!runningInApp) {
                            polyline.on('popupclose', function () {
                                this.setStyle({ color: '#ff7800', weight: defWeight });
                                this.options.selected = false;
                                currentPolyline = null; // Clear the current polyline
                                currentEntrySeqID = null; // Clear the current EntrySeqID
                            });
                        }
                    }
                });

                // Restore the selected task if any
                if (currentEntrySeqID && polylines[currentEntrySeqID]) {
                    const polyline = polylines[currentEntrySeqID];
                    polyline.setStyle({ color: '#0000ff', weight: selWeight });
                    polyline.options.selected = true;
                    if (!runningInApp) {
                        polyline.openPopup();
                    }
                    currentPolyline = polyline; // Set the current polyline
                }
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    // Initial task fetch
    fetchTasks(map.getBounds());

    // Fetch tasks when the map view changes
    map.on('moveend', function () {
        fetchTasks(map.getBounds());
    });

    function parseWorldPosition(worldPosition) {
        const regex = /([NS])(\d+)° (\d+)' ([\d.]+)",([EW])(\d+)° (\d+)' ([\d.]+)"/;
        const match = regex.exec(worldPosition);
        if (!match) return [0, 0];

        const lat = parseCoordinate(match[1], match[2], match[3], match[4]);
        const lon = parseCoordinate(match[5], match[6], match[7], match[8]);
        return [lat, lon];
    }

    function parseCoordinate(direction, degrees, minutes, seconds) {
        let decimal = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
        if (direction === 'S' || direction === 'W') decimal = -decimal;
        return decimal;
    }

    function resetPolylines() {
        Object.values(polylines).forEach(polyline => {
            if (polyline.options.selected) {
                polyline.setStyle({ color: '#ff7800', weight: defWeight });
                polyline.options.selected = false;
            }
        });
    }

    // Function to select a task on the map
    window.selectTask = function (entrySeqID) {
        if (polylines[entrySeqID]) {
            resetPolylines();
            const polyline = polylines[entrySeqID];
            polyline.setStyle({ color: '#0000ff', weight: selWeight });
            polyline.options.selected = true;
            if (!runningInApp) {
                polyline.openPopup();
            }
            currentPolyline = polyline; // Set the current polyline
            currentEntrySeqID = entrySeqID; // Track the EntrySeqID
        } else {
            console.warn('Task not found:', entrySeqID);
        }
    };

    // Function to zoom to the selected task
    window.zoomToTask = function () {
        if (currentPolyline) {
            map.fitBounds(currentPolyline.getBounds());
        } else {
            alert("No task selected");
        }
    };

    // Function to post a selected task ID to the app
    function postSelectedTask(entrySeqID) {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage({ action: 'selectTask', entrySeqID: entrySeqID });
        }
    }

    // Function to filter tasks based on a list of EntrySeqIDs
    window.filterTasks = function (entrySeqIDs) {

        // Hide all polylines first
        Object.values(polylines).forEach(polyline => {
            map.removeLayer(polyline);
        });

        // Show only the polylines whose EntrySeqID is in the entrySeqIDs list
        entrySeqIDs.forEach(id => {
            if (polylines[id]) {
                polylines[id].addTo(map);
            } else {
                console.warn("Polyline not found for EntrySeqID:", id);
            }
        });
    };

    // Function to clear all filters and show all tasks
    window.clearFilter = function () {

        // Add all polylines to the map
        Object.values(polylines).forEach(polyline => {
            polyline.addTo(map);
        });
    };

});
