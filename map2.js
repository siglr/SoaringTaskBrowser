class TaskBrowserMap {
    constructor(tb) {
        let tbm = this;
        tbm.tb = tb;

        // B21 update, these are used by B21_Task / B21_WP
        tbm.settings = {
            altitude_units: "feet",
            wp_radius_units: "m",
            task_line_color_1: "red",
            task_line_color_2: "none"
        }

        tbm.M_TO_FEET = 3.28084;
        tbm.defWeight = 6;
        tbm.hoverWeight = 7;
        tbm.selWeight = 8;

        //B21 update
        tbm.fetchBounds = null; // Keep track of the GetTasksForMap bounds
        tbm.api_tasks = {};     // Will hold all tasks from GetTasksForMap.php
        tbm.b21_task = null;    // Will hold parsed 'current' task

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

        tbm.currentPolyline = null; // Track the currently selected polyline
        tbm.currentEntrySeqID = null; // Track the EntrySeqID of the selected polyline
        tbm.filteredEntrySeqIDs = null; // Track the filtered tasks

        // Initial task fetch
        tbm.fetchTasks(tbm.map.getBounds());

        // Fetch tasks when the map view changes
        tbm.map.on('moveend', function () {
            // B21 update - only fetch if bounds have moved outside previous fetch bounds
            let new_bounds = tbm.map.getBounds();
            if (tbm.mapExpanded(new_bounds)) {
                tbm.fetchTasks(new_bounds);
            }
        });

    }

    //B21 update
    mapExpanded(new_bounds) {
        let tbm = this;
        if (tbm.fetchBounds == null) {
            return true;
        }
        return !tbm.fetchBounds.contains(new_bounds);
    }
    //
    // Common functions for the map
    //
	fetchTasks(bounds) {
        let tbm = this;
        console.log("fetchTasks()",bounds);

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
                tbm.fetchBounds = bounds; // B21 update, keep track of current map bounds so we don't re-fetch unnecessarily
				let preventEntrySeqIDlost = tbm.currentEntrySeqID;

                tbm.clearPolylines();

				// Resetting the current selected task after clearing all polylines
				tbm.currentEntrySeqID = preventEntrySeqIDlost;

				data.forEach(api_task => {
                    // B21_update - moved this code into a method
                    tbm.loadTask(api_task);
				});

				// Manager filtered tasks
				tbm.manageFilteredTasks();

				// Restore the selected task if any
				if (tbm.currentEntrySeqID && tbm.api_tasks[tbm.currentEntrySeqID].polyline) {
					const polyline = tbm.api_tasks[tbm.currentEntrySeqID].polyline;
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

    // B21 update - each polyline now stored in api_task object
    clearPolylines() {
        let tbm = this;
        for (const entrySeqID in tbm.api_tasks) {
            tbm.map.removeLayer(tbm.api_tasks[entrySeqID].polyline);
        }
    }

    // B21 update - tbm.api_tasks[entrySeqID].polyline
	resetPolylines() {
        let tbm = this;
        for (const entrySeqID in tbm.api_tasks) {
            let polyline = tbm.api_tasks[entrySeqID].polyline;
			if (polyline.options.selected) {
				polyline.setStyle({ color: '#ff7800', weight: tbm.defWeight });
				polyline.options.selected = false;
			}
        }
	}

    drawPolylines() {
        // Add all polylines to the map
        for (const entrySeqID in tbm.api_tasks) {
            let polyline = tbm.api_tasks[entrySeqID].polyline;
            polyline.addTo(tbm.map);
        }
    }

    //B21_update
    loadTask(api_task) {
        let tbm = this;

        tbm.api_tasks[api_task.EntrySeqID] = api_task; // cache the download

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(api_task.PLNXML, "text/xml");
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

            tbm.api_tasks[api_task.EntrySeqID].bounds = polyline.getBounds(); // B21 update - add .bounds to each api_task

            tbm.api_tasks[api_task.EntrySeqID].polyline = polyline; // b21 update - add polyline to api_tasks entry

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
                tbm.taskClicked(api_task.EntrySeqID); //
            });
        }
    }

    // B21 update
    taskClicked(entrySeqID) {
        let tbm = this;
        console.log(`taskClicked ${entrySeqID}`);

        tbm.currentEntrySeqID = entrySeqID; // Track the EntrySeqID
        let api_task = tbm.api_tasks[entrySeqID];

        tbm.resetPolylines();
        tbm.currentPolyline = api_task.polyline; // Set the current polyline
        tbm.currentPolyline.setStyle({ color: '#0000ff', weight: tbm.selWeight });
        tbm.currentPolyline.options.selected = true;

        tbm.setB21Task(api_task);

        if (tbm.runningInApp) {
            tbm.postSelectedTask(entrySeqID); // Notify the app
        } else {
            tbm.map.fitBounds(api_task.bounds);
            tbm.tb.getTaskDetails(entrySeqID); // Call standalone.js function
        }
    }

    setB21Task(api_task) {
        let tbm = this;
        // Remove the previous task map_elements
        if (tbm.b21_task != null) {
            tbm.b21_task.reset();
        }

        tbm.b21_task = new B21_Task(tbm);   // B21 update here's where we parse the XML into a B21_Task
        tbm.b21_task.load_pln_str(api_task.PLNXML, api_task.Title);
        tbm.b21_task.update_waypoints();
        tbm.b21_task.update_waypoint_icons();

        tbm.b21_task.draw();
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

	manageFilteredTasks() {
        let tbm = this;
		// Check if filtered tasks are active or not (filteredEntrySeqIDs is null or not)
		if (tbm.filteredEntrySeqIDs === null) {
			return;
		}
		// Hide all polylines first
        tbm.clearPolylines();

		// Show only the polylines whose EntrySeqID is in the filteredEntrySeqIDs list
		tbm.filteredEntrySeqIDs.forEach(entrySeqID => {
			if (tbm.api_tasks[entrySeqID]) {
				tbm.api_tasks[entrySeqID].polyline.addTo(tbm.map);
			}
		});
	}

    // Function to select a task on the map
    selectTask(entrySeqID, forceBoundsUpdate = false) {
        let tbm = this;
        console.log("selectTask()", entrySeqID);
        if (tbm.api_tasks[entrySeqID]) {
            tbm.updateSelectedTask(entrySeqID);
        } else {
            console.warn('Error selecting task:', error);
        }
    }

    updateSelectedTask(entrySeqID) {
        let tbm = this;
        console.log('updateSelectedTask()', entrySeqID)
        tbm.resetPolylines();
        const polyline = tbm.api_tasks[entrySeqID].polyline;
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
    selectTaskFromApp(entrySeqID, forceBoundsUpdate = false) {
        let tbm = this;
        console.log("selectTaskFromApp()", entrySeqID);
        tbm.selectTask(entrySeqID, forceBoundsUpdate)
        //tbm.taskClicked(entrySeqID);
        //tbm.zoomToTask();
    }

    // Function to filter tasks based on a list of EntrySeqIDs
    filterTasksFromApp(entrySeqIDs) {
        let tbm = this;
        // Save the list of tasks
        tbm.filteredEntrySeqIDs = entrySeqIDs;

        manageFilteredTasks();

    }

    // Function to clear all filters and show all tasks
    clearFilterFromApp() {
        let tbm = this;
        tbm.filteredEntrySeqIDs = null;

        tbm.drawPolylines();
    }
}
