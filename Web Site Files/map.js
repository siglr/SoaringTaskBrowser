document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    const polylines = {};
    let currentPolyline = null; // Track the currently selected polyline

    fetch('GetTasksForMap.php')
        .then(response => response.json())
        .then(data => {
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
                        weight: 5,
                        opacity: 0.7,
                        className: 'task-polyline'
                    }).addTo(map)
                        .bindPopup(`<strong>Task #</strong> ${task.EntrySeqID}<br>
                                    <strong>Title:</strong> ${task.Title}`);

                    polylines[task.EntrySeqID] = polyline;

                    polyline.on('mouseover', function () {
                        if (!this.options.selected) {
                            this.setStyle({ color: '#0000CD', weight: 5 });
                        }
                    });

                    polyline.on('mouseout', function () {
                        if (!this.options.selected) {
                            this.setStyle({ color: '#ff7800', weight: 5 });
                        }
                    });

                    polyline.on('click', function () {
                        resetPolylines();
                        this.setStyle({ color: '#0000ff', weight: 7 });
                        this.options.selected = true;
                        currentPolyline = this; // Set the current polyline
                        postSelectedTask(task.EntrySeqID); // Notify the app
                    });

                    polyline.on('popupclose', function () {
                        this.setStyle({ color: '#ff7800', weight: 5 });
                        this.options.selected = false;
                        currentPolyline = null; // Clear the current polyline
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error fetching task boundaries:', error);
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
                polyline.setStyle({ color: '#ff7800', weight: 5 });
                polyline.options.selected = false;
            }
        });
    }

    // Function to select a task on the map
    window.selectTask = function (entrySeqID) {
        if (polylines[entrySeqID]) {
            resetPolylines();
            const polyline = polylines[entrySeqID];
            polyline.setStyle({ color: '#0000ff', weight: 7 });
            polyline.options.selected = true;
            polyline.openPopup();
            currentPolyline = polyline; // Set the current polyline
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
