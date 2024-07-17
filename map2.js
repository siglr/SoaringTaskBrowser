class TaskBrowserMap {
    constructor(tb) {
        let tbm = this;
        tbm.tb = tb;

        // B21 update, these are used by B21_Task / B21_WP
        tbm.settings = {
            altitude_units: "feet",
            wp_radius_units: "m",
            task_line_color_1: "blue",
            task_line_color_2: "none"
        }

        tbm.M_TO_FEET = 3.28084;
        tbm.defWeight = 6;
        tbm.hoverWeight = 7;
        tbm.selWeight = 0;

        //B21 update
        tbm.fetchBounds = null; // Keep track of the GetTasksForMap bounds
        tbm.api_tasks = {};     // Will hold all tasks from GetTasksForMap.php
        tbm.b21_task = null;    // Will hold parsed 'current' task

        //tbm.map = L.map('map').setView([20, 0], 2);


        // b21_airports requirements
        tbm.canvas_renderer = L.canvas();
        tbm.airport_markers = L.layerGroup(); //.addTo(planner.map);

        // Define different map layers
        tbm.base_maps = {
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

        tbm.map_layers = {
            "Airports": tbm.airport_markers,
            "Railways": L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            }),
            "Wind Compass": L.layerGroup()
        };

        tbm.map = L.map('map', {
            minZoom: 2,
            maxZoom: 16,
            worldCopyJump: true,
            layers: [tbm.base_maps["Google Terrain"], tbm.airport_markers]
        });

        tbm.map.setView([20, 0], 2);;

        L.control.layers(tbm.base_maps, tbm.map_layers).addTo(tbm.map);

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
        tbm.fetchTasks();

        // Fetch tasks when the map view changes
        tbm.map.on('moveend', function () {
            tbm.airports.draw(tbm.map);
            // B21 update - only fetch if bounds have moved outside previous fetch bounds
            let new_bounds = tbm.map.getBounds();
            if (tbm.mapExpanded(new_bounds)) {
                tbm.fetchTasks();
            }
        });

        tbm.airports = new B21_Airports(tbm, {
            json_url: "https://xp-soaring.github.io/tasks/b21_task_planner/airports/airports.json",
            airport_img_url: "https://xp-soaring.github.io/tasks/b21_task_planner/images/airport_00.png"
        });

        tbm.airports.init(tbm.map); // Here we ASYCHRONOUSLY load the airports JSON data (& will draw on map)

        tbm.addCompassRoseControl();
        tbm.setWindCompassVisibility(false);

        // Listen to layer control changes
        tbm.map.on('overlayadd', function (eventLayer) {
            if (eventLayer.name === 'Wind Compass') {
                tbm.setWindCompassVisibility(true);
            }
        });

        tbm.map.on('overlayremove', function (eventLayer) {
            if (eventLayer.name === 'Wind Compass') {
                tbm.setWindCompassVisibility(false);
            }
        });

    }

    fetchTasks() {
        let tbm = this;
        console.log("fetchTasks()");

        let bounds = tbm.map.getBounds();
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
            .then(tasks => { tbm.handleTasks(tasks, bounds); })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    // Process the tasks returned by fetchTasks
    handleTasks(tasks, bounds) {
        let tbm = this;
        tbm.fetchBounds = bounds; // B21 update, keep track of current map bounds so we don't re-fetch unnecessarily
        let preventEntrySeqIDlost = tbm.currentEntrySeqID;

        tbm.clearPolylines();

        // Resetting the current selected task after clearing all polylines
        tbm.currentEntrySeqID = preventEntrySeqIDlost;

        tasks.forEach(api_task => {
            // B21_update - moved this code into a method
            tbm.loadTask(api_task);
        });

        // Manager filtered tasks to remove tasks from the display !!! NEED TO FIX !!!
        tbm.manageFilteredTasks();

        // Restore selected task
        if (tbm.currentEntrySeqID > 0) {
            let api_task = tbm.api_tasks[tbm.currentEntrySeqID];
            tbm.selectTaskCommon(tbm.currentEntrySeqID, false, false);
            //tbm.setB21Task(api_task);
        }

    }

    //B21_update
    loadTask(api_task) {
        let tbm = this;

        // Check if the task is not in the cache
        if (!tbm.api_tasks[api_task.EntrySeqID]) {
            tbm.api_tasks[api_task.EntrySeqID] = api_task; // cache the download
        }

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

            polyline.on('mouseover', () => { tbm.highlightTask(tbm, api_task.EntrySeqID); });

            polyline.on('mouseout', () => { tbm.unhighlightTask(tbm, api_task.EntrySeqID); });

            polyline.on('click', function () {
                tbm.selectTaskFromClick(api_task.EntrySeqID);
            });
        }
    }

    highlightTask(tbm, entrySeqID) {
        // Only highlight if it's not the currently selected task
        if (tbm.currentEntrySeqID !== entrySeqID) {
            tbm.api_tasks[entrySeqID].polyline.setStyle({ color: '#9900cc', weight: tbm.hoverWeight });
        }
    }

    unhighlightTask(tbm, entrySeqID) {
        // Only unhighlight if it's not the currently selected task
        if (tbm.currentEntrySeqID !== entrySeqID) {
            tbm.api_tasks[entrySeqID].polyline.setStyle({ color: '#ff7800', weight: tbm.defWeight });
        }
    }

    //B21 update
    mapExpanded(new_bounds) {
        let tbm = this;
        if (tbm.fetchBounds == null) {
            return true;
        }
        return !tbm.fetchBounds.contains(new_bounds);
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

    setB21Task(api_task) {
        let tbm = this;
        console.log('setB21Task', api_task.entrySeqID)
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

    //
    // TASK SELECTION REFACTORING
    //

    // Selecting a task from the "task" parameter in the URL string
    selectTaskFromURL(entrySeqID) {

        let tbm = this;
        const entrySeqIDNbr = Number(entrySeqID);
        console.log("selectTaskFromURL()", entrySeqIDNbr);

        // 1. Remove the task parameter from the URL
        tbm.tb.clearUrlParameter('task');

        // 2. Make sure the corresponding task entrySeqID is loaded in api_tasks, if not, we need to fetch it and change map bounds
        //Doesn't seem to be required at the moment, the task ends up being selected

        // 3. Wait for the fetch and bounds change to be completed
        //Doesn't seem to be required at the moment, the task ends up being selected

        // 4. Get the task details to show on the right panel.
        tbm.tb.getTaskDetails(entrySeqIDNbr, true); // Display task details on the right panel

        // 5. Call the selectTaskCommon to perform the common actions
        tbm.selectTaskCommon(entrySeqIDNbr, true);


    }

    // Selecting a task from a true user click on the map
    selectTaskFromClick(entrySeqID, forceZoomToTask = false) {

        let tbm = this;
        console.log("selectTaskFromClick()", entrySeqID);

        // 1. Call the selectTaskCommon to perform the common actions
        tbm.selectTaskCommon(entrySeqID, forceZoomToTask);

        // 2a. If we're not running in the context of the DPHX app, get the task details to show on the right panel.
        // 2b. If we're running in the context of DPHX app, call the postSelectedTask function.
        if (tbm.runningInApp) {
            tbm.postSelectedTask(entrySeqID); // Notify the app
        } else {
            tbm.tb.getTaskDetails(entrySeqID, false); // Display task details on the right panel
        }
    }

    // Selecting a task based on an interaction from the external DPHX app
    selectTaskFromDPHXApp(entrySeqID, forceZoomToTask = false) {

        let tbm = this;
        const entrySeqIDNbr = Number(entrySeqID);
        console.log("selectTaskFromDPHXApp()", entrySeqIDNbr);

        // 1. Make sure the corresponding task entrySeqID is loaded in api_tasks, if not, we need to fetch it and change map bounds
        // Right now, not necessary as all tasks are being loaded right from the start

        // 2. Wait for the fetch and bounds change to be completed
        // Right now, not necessary as all tasks are being loaded right from the start

        // 3. Call the selectTaskCommon to perform the common actions
        tbm.selectTaskCommon(entrySeqIDNbr, forceZoomToTask);

    }

    // Common actions that need to be performed by all task selection use cases
    selectTaskCommon(entrySeqID, forceZoomToTask = false, realSelection = true) {

        let tbm = this;
        console.log("selectTaskCommon()", entrySeqID);

        // 1. The previous (if any) selected task's normal unselected polyline should be drawn (and the detailed task rendering removed)
        tbm.resetPolylines();

        // 2. Render the detailed task and remove the regular polyline
        tbm.currentEntrySeqID = entrySeqID; // Track the EntrySeqID
        let api_task = tbm.api_tasks[entrySeqID]; // Retrieve api_task from the cache
        tbm.currentPolyline = api_task.polyline; // Set the current polyline
        tbm.currentPolyline.setStyle({ color: '#0000ff', weight: tbm.selWeight }); // Set selWeight (0 actually)
        tbm.currentPolyline.options.selected = true; // Se the selection flag on the polyline
        tbm.setB21Task(api_task); // Render the B21Task

        if (realSelection) {
            // 3. Zoom in on the task if specified or if task bounds outside current map bounds
            let taskBounds = tbm.b21_task.get_bounds();
            let mapBounds = tbm.map.getBounds();
            let containsBounds = mapBounds.contains(taskBounds);

            if (forceZoomToTask || !containsBounds) {
                console.log('zooming to task', forceZoomToTask, containsBounds);
                tbm.zoomToTask();
            }
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
        if (tbm.b21_task) {
            tbm.map.fitBounds(tbm.b21_task.get_bounds());
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

    // Function to filter tasks based on a list of EntrySeqIDs
    filterTasksFromApp(entrySeqIDs) {
        let tbm = this;
        console.log('filterTasksFromApp');

        // Save the list of tasks
        tbm.filteredEntrySeqIDs = entrySeqIDs;

        tbm.manageFilteredTasks();

        // Todo: Reselect active task??

    }

    // Function to clear all filters and show all tasks
    clearFilterFromApp() {
        let tbm = this;
        console.log('clearFilterFromApp');

        // Clear the list of filtered tasks
        tbm.filteredEntrySeqIDs = null;

        tbm.drawPolylines();

        // Todo: Reselect active task??

    }

    addCompassRoseControl() {
        let tbm = this;

        // Custom control for the compass rose
        L.Control.CompassRose = L.Control.extend({
            onAdd: function (map) {
                let compassContainer = L.DomUtil.create('div', 'compass-container');
                compassContainer.innerHTML = `
                    <img id="compassRose" class="compass-rose" src="images/compass_rose.png" alt="Compass Rose">
                    <img id="windArrow" class="wind-arrow" src="images/wind_arrow.png" alt="Wind Arrow">
                    <div id="windDirection" class="wind-direction">0°</div>
                `;
                tbm.makeDraggable(compassContainer, compassContainer.querySelector('#windDirection'));
                return compassContainer;
            }
        });

        // Add the control to the map
        tbm.compassControl = new L.Control.CompassRose({ position: 'topleft' });
        tbm.map.addControl(tbm.compassControl);

        // Event listener for changing wind direction
        tbm.setWindDirection(0);  // Initialize with 0° wind direction
    }

    setWindCompassVisibility(isVisible = true) {
        let compassContainer = document.querySelector('.compass-container');
        if (compassContainer) {
            if (isVisible) {
                compassContainer.style.display = 'block';
            } else {
                compassContainer.style.display = 'none';
            }
        }
    }

    setWindDirection(degree, speed, altitude) {

        let windDirectionElem = document.getElementById('windDirection');
        let windArrowElem = document.getElementById('windArrow');
        if (windDirectionElem && windArrowElem) {
            windDirectionElem.innerText = `${speed} kts`;
            windArrowElem.style.transform = `rotate(${degree}deg)`;
        }
    }

    makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        // Prevent map from handling drag events
        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);

        L.DomEvent.on(handle, 'mousedown', function (e) {
            isDragging = true;
            offsetX = e.clientX - parseInt(window.getComputedStyle(element).left);
            offsetY = e.clientY - parseInt(window.getComputedStyle(element).top);
            element.style.transition = 'none'; // Disable transitions during drag

            L.DomEvent.stopPropagation(e); // Prevent map from handling the event
        });

        L.DomEvent.on(document, 'mousemove', function (e) {
            if (isDragging) {
                let x = e.clientX - offsetX;
                let y = e.clientY - offsetY;
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                L.DomEvent.stopPropagation(e); // Prevent map from handling the event
            }
        });

        L.DomEvent.on(document, 'mouseup', function (e) {
            if (isDragging) {
                isDragging = false;
                element.style.transition = ''; // Re-enable transitions after drag
                L.DomEvent.stopPropagation(e); // Prevent map from handling the event
            }
        });
    }
}
