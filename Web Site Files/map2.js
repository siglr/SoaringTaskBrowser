class TaskBrowserMap {
    constructor(tb) {
        let tbm = this;
        tbm.tb = tb;
        tbm.M_TO_FEET = 3.28084;
        tbm.defWeight = 6;
        tbm.hoverWeight = 7;
        tbm.selWeight = 8;

        tbm.b21_task = null; // Will hold parsed 'current' task

        tbm.map = L.map('map').setView([20, 0], 2);
        // Define different map layers
        tbm.layers = {
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
        tbm.layers["Google Terrain"].addTo(tbm.map);

        // Add layer control to the map
        L.control.layers(tbm.layers).addTo(tbm.map);

        tbm.runningInApp = false;
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('appContext')) {
            tbm.runningInApp = true;
        } else {
            tbm.runningInApp = false;
        }

        tbm.polylines = {};
        tbm.currentPolyline = null; // Track the currently selected polyline
        tbm.currentEntrySeqID = null; // Track the EntrySeqID of the selected polyline
        tbm.filteredEntrySeqIDs = null; // Track the filtered tasks

        // Initial task fetch
        tbm.fetchTasks(tbm.map.getBounds());

        // Fetch tasks when the map view changes
        tbm.map.on('moveend', function () {
            tbm.fetchTasks(tbm.map.getBounds());
        });

    }

    //
    // Common functions for the map
    //
	fetchTasks(bounds) {
        let tbm = this;
		const { _southWest: sw, _northEast: ne } = bounds;

		const bufferKm = 0.5;
		const bufferLat = bufferKm / 110.574; // Approximate conversion from km to latitude
		const bufferLng = bufferKm / (111.320 * Math.cos((sw.lat + ne.lat) / 2 * Math.PI / 180)); // Approx conversion from km to longitude

		const latMin = sw.lat - bufferLat;
		const latMax = ne.lat + bufferLat;
		const lngMin = sw.lng - bufferLng;
		const lngMax = ne.lng + bufferLng;

        let fetch_promise;
        if (DEBUG_LOCAL) {
		    fetch_promise = test_fetch_tasks(`GetTasksForMap.php?latMin=${latMin}&latMax=${latMax}&lngMin=${lngMin}&lngMax=${lngMax}`)
        } else {
		    fetch_promise = fetch(`php/GetTasksForMap.php?latMin=${latMin}&latMax=${latMax}&lngMin=${lngMin}&lngMax=${lngMax}`)
        }
        fetch_promise
			.then(response => response.json())
			.then(data => {
				let preventEntrySeqIDlost = tbm.currentEntrySeqID;

				// Clear existing polylines
				Object.values(tbm.polylines).forEach(polyline => {
					tbm.map.removeLayer(polyline);
				});

				// Clear the polylines object
				for (const key in tbm.polylines) {
					delete tbm.polylines[key];
				}

				// Resetting the current selected task after clearing all polylines
				tbm.currentEntrySeqID = preventEntrySeqIDlost;

				data.forEach(task => {

                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(task.PLNXML, "text/xml");
                    const waypoints = xmlDoc.getElementsByTagName("ATCWaypoint");

                    const coordinates = [];
                    for (let i = 0; i < waypoints.length; i++) {
                        const worldPosition = waypoints[i].getElementsByTagName("WorldPosition")[0].textContent;
                        const [lat, lon] = tbm.parseWorldPosition(worldPosition);
                        coordinates.push([lat, lon]);
                    }

                    if (coordinates.length > 0) {
                        const polyline = L.polyline(coordinates, {
                            color: "#ff7800",
                            weight: tbm.defWeight,
                            opacity: 0.7,
                            className: 'task-polyline'
                        });
                        polyline.addTo(tbm.map);

                        tbm.polylines[task.EntrySeqID] = polyline;

                        polyline.on('mouseover', function () {
                            if (!this.options.selected) {
                                this.setStyle({ color: '#9900cc', weight: tbm.hoverWeight });
                            }
                        });

                        polyline.on('mouseout', function () {
                            if (!this.options.selected) {
                                this.setStyle({ color: '#ff7800', weight: tbm.defWeight });
                            }
                        });

                        polyline.on('click', function () {
                            tbm.resetPolylines();
                            this.setStyle({ color: '#0000ff', weight: tbm.selWeight });
                            this.options.selected = true;
                            tbm.currentPolyline = this; // Set the current polyline
                            tbm.currentEntrySeqID = task.EntrySeqID; // Track the EntrySeqID
                            if (!tbm.runningInApp) {
                                tbm.tb.showTaskDetailsStandalone(task.EntrySeqID); // Call standalone.js function
                            } else {
                                tbm.postSelectedTask(task.EntrySeqID); // Notify the app
                            }
                        });
					}
				});

				// Manager filtered tasks
				tbm.manageFilteredTasks();

				// Restore the selected task if any
				if (tbm.currentEntrySeqID && tbm.polylines[tbm.currentEntrySeqID]) {
					const polyline = tbm.polylines[tbm.currentEntrySeqID];
					polyline.setStyle({ color: '#0000ff', weight: tbm.selWeight });
					polyline.options.selected = true;
					if (!tbm.runningInApp) {
						polyline.openPopup();
					}
					tbm.currentPolyline = polyline; // Set the current polyline
				}

				return Promise.resolve();
			})
			.catch(error => {
				console.error('Error fetching tasks:', error);
				return Promise.reject(error);
			});
	}

    parseWorldPosition(worldPosition) {
        let tbm = this;
        const regex = /([NS])(\d+)° (\d+)' ([\d.]+)",([EW])(\d+)° (\d+)' ([\d.]+)"/;
        const match = regex.exec(worldPosition);
        if (!match) return [0, 0];

        const lat = tbm.parseCoordinate(match[1], match[2], match[3], match[4]);
        const lon = tbm.parseCoordinate(match[5], match[6], match[7], match[8]);
        return [lat, lon];
    }

    parseCoordinate(direction, degrees, minutes, seconds) {
        let tbm = this;
        let decimal = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
        if (direction === 'S' || direction === 'W') decimal = -decimal;
        return decimal;
    }

	resetPolylines() {
        let tbm = this;
		Object.values(tbm.polylines).forEach(polyline => {
			if (polyline.options.selected) {
				polyline.setStyle({ color: '#ff7800', weight: tbm.defWeight });
				polyline.options.selected = false;
			}
		});
	}

	fetchTaskBounds(entrySeqID) {
        let tbm = this;
		return fetch(`php/GetTaskBounds.php?entrySeqID=${entrySeqID}`)
			.then(response => response.json())
			.then(bounds => {
				if (bounds && bounds.LatMin !== undefined && bounds.LatMax !== undefined && bounds.LongMin !== undefined && bounds.LongMax !== undefined) {
					return {
						latMin: bounds.LatMin,
						latMax: bounds.LatMax,
						lngMin: bounds.LongMin,
						lngMax: bounds.LongMax
					};
				} else {
					throw new Error('Invalid bounds data');
				}
			})
			.catch(error => {
				console.error('Error fetching task bounds:', error);
				throw error;
			});
	}

	manageFilteredTasks() {
        let tbm = this;
		// Check if filtered tasks are active or not (filteredEntrySeqIDs is null or not)
		if (tbm.filteredEntrySeqIDs === null) {
			return;
		}
		// Hide all polylines first
		Object.values(tbm.polylines).forEach(polyline => {
			tbm.map.removeLayer(polyline);
		});

		// Show only the polylines whose EntrySeqID is in the filteredEntrySeqIDs list
		tbm.filteredEntrySeqIDs.forEach(id => {
			if (tbm.polylines[id]) {
				tbm.polylines[id].addTo(tbm.map);
			}
		});
	}

    //
    // Buttons on the map
    //

    // Full world button function
    resetToFullWorld() {
        let tbm = this;
        tbm.map.setView([20, 0], 2); // Set the default view with the entire world
    }

    // Function to zoom to the selected task
    zoomToTask() {
        let tbm = this;
        if (tbm.currentPolyline) {
            tbm.map.fitBounds(tbm.currentPolyline.getBounds());
        } else {
            alert("No task selected");
        }
    }

    //
    // Functions that send messages to the task browser app
    //

    // Function to post a selected task ID to the app
    postSelectedTask(entrySeqID) {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage({ action: 'selectTask', entrySeqID: entrySeqID });
        }
    }

    //
    // Commands received by the task browser app
    //
    
    // Function to select a task on the map
    selectTask(entrySeqID, forceBoundsUpdate = false) {
        let tbm = this;
        if (tbm.polylines[entrySeqID]) {
            tbm.resetPolylines();
            const polyline = tbm.polylines[entrySeqID];
            polyline.setStyle({ color: '#0000ff', weight: tbm.selWeight });
            polyline.options.selected = true;
            if (!tbm.runningInApp) {
                polyline.openPopup();
            }
            tbm.currentPolyline = polyline; // Set the current polyline
            tbm.currentEntrySeqID = entrySeqID; // Track the EntrySeqID

            // Set map bounds to the polyline bounds if forceBoundsUpdate is true
            if (forceBoundsUpdate) {
                const polylineBounds = polyline.getBounds();
                tbm.map.fitBounds(polylineBounds);
            }
        } else {
            tbm.fetchTaskBounds(entrySeqID).then(bounds => {
                if (bounds) {
                    const southWest = L.latLng(bounds.latMin, bounds.lngMin);
                    const northEast = L.latLng(bounds.latMax, bounds.lngMax);
                    const newBounds = L.latLngBounds(southWest, northEast);
                    tbm.currentEntrySeqID = entrySeqID; // Track the EntrySeqID
                    tbm.map.fitBounds(newBounds);
                }
            }).catch(error => {
                console.error('Error fetching task bounds:', error);
            });
        }
    }

    // Function to filter tasks based on a list of EntrySeqIDs
    filterTasks(entrySeqIDs) {
        let tbm = this;
        // Save the list of tasks
        tbm.filteredEntrySeqIDs = entrySeqIDs;

        manageFilteredTasks();

    }

    // Function to clear all filters and show all tasks
    clearFilter() {
        let tbm = this;
        tbm.filteredEntrySeqIDs = null;

        // Add all polylines to the map
        Object.values(tbm.polylines).forEach(polyline => {
            polyline.addTo(tbm.map);
        });
    }
}
