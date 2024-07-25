"use strict"

class TaskBrowser {
    constructor() {
        let tb = this;
        let shouldHandlePopState = true;
    }

    init() {
        let tb = this;
        tb.countryCodes = {};
        tb.md = window.markdownit({
            html: false,
            breaks: true,
            linkify: true,
            typographer: true
        });
        tb.tbm = new TaskBrowserMap(tb);
        tb.taskDetailsContainerWidth = 0;
        tb.initCountryCodes();

        // Mapping of country names in your app to the corresponding names used by the flag service
        tb.countryNameMapping = {
            'Czech Republic': 'Czechia',
            'Virgin Islands - U.S.': 'United States Virgin Islands',
            'Virgin Islands - British': 'British Virgin Islands'
        };
        tb.initCountryCodes();
        tb.userSettings = tb.loadUserSettings();
        tb.userMapSettings = tb.loadMapUserSettings();
        tb.TaskDetailsPanelVisible = false;
        tb.hideTaskDetailsPanel();
    }

    initCountryCodes() {
        let tb = this;
        fetch('https://flagcdn.com/en/codes.json')
            .then(response => response.json())
            .then(data => {
                tb.countryCodes = data;
            })
            .catch(error => {
                console.error('Error fetching country codes:', error);
            });
    }

    getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    // Function to clear a specific parameter from the URL
    clearUrlParameter(param) {
        //const url = new URL(window.location);
        //url.searchParams.delete(param);
        //window.history.replaceState({}, document.title, url.toString());
    }

    copyTextToClipboard(text) {
        let tb = this;
        tb.shouldHandlePopState = false; // Disable popstate handling
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert("Link copied to your clipboard!");
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert("Link copied to your clipboard!");
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            document.body.removeChild(textArea);
        }
        //tb.shouldHandlePopState = true; // Re-enable popstate handling
    }

    resizeMap() {
        let tb = this;
        try {
            if (tb.tbm && tb.tbm.map && document.getElementById('mapTab').classList.contains('active')) {
                tb.tbm.map.invalidateSize();
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    switchTab(tabId) {
        let tb = this;
        document.querySelectorAll('.tabButton').forEach(button => button.classList.remove('active'));
        document.querySelectorAll('.tabContent').forEach(content => content.classList.remove('active'));
        document.querySelector(`[onclick="TB.switchTab('${tabId}')"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'mapTab') {
            tb.resizeMap();
        }
    }

    addCountryFlags(countries) {
        let tb = this;
        const baseUrl = 'https://flagcdn.com/h24/';
        return countries.split(',').map(country => {
            const countryName = country.trim();
            const mappedCountryName = tb.countryNameMapping[countryName] || countryName;
            const code = Object.keys(tb.countryCodes).find(key => tb.countryCodes[key].toLowerCase() === mappedCountryName.toLowerCase());
            return code ? `<img src="${baseUrl}${code}.webp" alt="${countryName}" title="${countryName}" style="margin-right: 5px;">` : countryName;
        }).join(' ');
    }

    replaceLineBreaks(text) {
        return text.replace(/\(\$\*\$\)/g, '($%$)');
    }

    removeSpacesBeforeClosingAsterisks(text) {
        const removeSpaces = (text, delimiter) => {
            const parts = text.split(delimiter);
            for (let i = 1; i < parts.length; i += 2) {
                parts[i] = parts[i].trimEnd();
            }
            return parts.join(delimiter);
        };

        text = removeSpaces(text, '**');
        text = removeSpaces(text, '__');
        text = removeSpaces(text, '*');
        text = removeSpaces(text, '_');

        return text;
    }

    restoreLineBreaks(text) {
        return text.replace(/\(\$%\$\)/g, '\n');
    }

    convertToMarkdown(text) {
        let tb = this;

        // Function to add target="_blank" to all href links
        function addTargetBlank(html) {
            return html.replace(/<a /g, '<a target="_blank" ');
        }

        // Function to replace http:// or https:// with discord:// for Discord links
        function convertDiscordLinks(html) {
            return html.replace(/href="https?:\/\/discord\.com/g, 'href="discord://discord.com');
        }

        text = tb.replaceLineBreaks(text);
        text = tb.removeSpacesBeforeClosingAsterisks(text);
        text = tb.restoreLineBreaks(text);

        let renderedMarkdown = tb.md.render(text);
        renderedMarkdown = addTargetBlank(renderedMarkdown);
        return convertDiscordLinks(renderedMarkdown);
    }

    addDetailLineWithoutBreak(label, value) {
        return value ? `${label} ${value}` : '';
    }

    addDetailLineWithBreak(label, value) {
        return value ? `${label} ${value} <br>` : '';
    }

    addDetailWithinBrackets(value) {
        return value ? `(${value})` : '';
    }

    formatDuration(min, max) {
        const formatTime = (time) => {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            return `${hours}h${minutes > 0 ? minutes : ''}`;
        };

        if (min > 0 && max > 0) {
            return `${min} to ${max} minutes (${formatTime(min)} to ${formatTime(max)})`;
        } else if (min > 0) {
            return `Around ${min} minutes (${formatTime(min)})`;
        } else if (max > 0) {
            return `Around ${max} minutes (${formatTime(max)})`;
        } else {
            return 'Not specified';
        }
    }

    formatSimDateTime(simDateTime, includeYear, appendLocalInMSFS = true, convertToLocal = false) {
        const timeFormat = this.userSettings.timeFormat || 'usa';
        const options = includeYear
            ? { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: timeFormat === 'usa' }
            : { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: timeFormat === 'usa' };

        let date = new Date(simDateTime);
        if (convertToLocal) {
            date = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)); // Convert to local time
        }

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        return appendLocalInMSFS ? formattedDate + ' local in MSFS' : formattedDate;
    }

    formatDifficultyRating(difficultyRating, difficultyExtraInfo) {
        if (difficultyRating === "0. None / Custom") {
            return difficultyExtraInfo ? difficultyExtraInfo : 'Unknown - Judge by yourself!';
        } else {
            const ratingStars = '★'.repeat(parseInt(difficultyRating)) + '☆'.repeat(5 - parseInt(difficultyRating));
            const ratingLabels = [
                'Beginner',
                'Student',
                'Experienced',
                'Professional',
                'Champion'
            ];
            const ratingText = `${ratingStars} - ${ratingLabels[parseInt(difficultyRating) - 1]}`;
            return difficultyExtraInfo ? `${ratingText} (${difficultyExtraInfo})` : ratingText;
        }
    }

    generateTaskDetailsMainSection(task) {
        let tb = this;

        // Format the last update date/time and description if present
        let lastUpdateInfo = "";
        const lastUpdateFormatted = tb.formatSimDateTime(task.LastUpdate, true, false, true);
        const lastUpdateDescription = task.LastUpdateDescription ? ` (${task.LastUpdateDescription})` : "";
        lastUpdateInfo = `Last update: ${lastUpdateFormatted}${lastUpdateDescription}`;

        // Get user settings for distance
        const distanceUnit = tb.userSettings.distance || 'imperial';
        let taskDistance = task.TaskDistance;
        let totalDistance = task.TotalDistance;
        let distanceUnitLabel = 'km';

        if (distanceUnit === 'imperial') {
            taskDistance = (task.TaskDistance * 0.621371).toFixed(0); // Convert km to miles
            totalDistance = (task.TotalDistance * 0.621371).toFixed(0); // Convert km to miles
            distanceUnitLabel = 'miles';
        }

        // Create the task details HTML
        let taskDetailsHtml = `
            <div class="task-details markdown-content">
                <div class="task-header">
                    <span class="task-number">#${task.EntrySeqID}</span>
                    <span class="task-flags">${this.addCountryFlags(task.Countries)}</span>
                </div>
                <h1>${task.Title}</h1>
                ${tb.addDetailLineWithoutBreak('', tb.convertToMarkdown(task.ShortDescription))}
                ${tb.addDetailLineWithBreak('🗺', task.MainAreaPOI)}
                🛫 ${task.DepartureICAO} ${task.DepartureName} ${task.DepartureExtra}<br>
                🛬 ${task.ArrivalICAO} ${task.ArrivalName} ${this.addDetailWithinBrackets(task.ArrivalExtra)}<br>
                ⌚ ${tb.formatSimDateTime(task.SimDateTime, task.IncludeYear)} ${tb.addDetailWithinBrackets(task.SimDateTimeExtraInfo)}<br>
                ↗️ ${task.SoaringRidge ? 'Ridge' : ''}${task.SoaringThermals ? ' Thermals' : ''}${task.SoaringWaves ? ' Waves' : ''}${task.SoaringDynamic ? ' Dynamic' : ''} ${tb.addDetailWithinBrackets(task.SoaringExtraInfo)}<br>
                📏 ${taskDistance} ${distanceUnitLabel} task (${totalDistance} ${distanceUnitLabel} total)<br>
                ⏳ ${tb.formatDuration(task.DurationMin, task.DurationMax)} ${tb.addDetailWithinBrackets(task.DurationExtraInfo)}<br>
                `;

        // Check and add AAT minimum time if available
        if (tb.tbm.b21_task && tb.tbm.b21_task.aat_min_time_s) {
            const aatMinTime = tb.tbm.b21_task.aat_min_time_s;
            const hours = Math.floor(aatMinTime / 3600);
            const minutes = Math.floor((aatMinTime % 3600) / 60);
            const formattedAatMinTime = `⚠️ AAT with a minimum duration of ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
            taskDetailsHtml += `${formattedAatMinTime}<br>`;
        }

        taskDetailsHtml += `
                ✈️ ${task.RecommendedGliders}<br>
                🎚 ${tb.formatDifficultyRating(task.DifficultyRating, task.DifficultyExtraInfo)}
                <p>${task.Credits}</p>
                ${task.RepostText ? tb.addDetailLineWithoutBreak('', tb.convertToMarkdown(task.RepostText)) : ''}
                <p>${lastUpdateInfo}</p>
            </div>`;

        return taskDetailsHtml;
    }

    generateTaskDetailsFullDescription(task) {
        let tb = this;
        // Collapsible Full Description
        if (task.LongDescription) {
            tb.generateCollapsibleSection("📖 Full Description", tb.convertToMarkdown(task.LongDescription), taskDetailContainer);
        }
    }

    generateTaskDetailsFiles(task) {
        let tb = this;

        // Collapsible Files
        let filesContent = `
            <p><strong>Option 1:</strong> Download the single package DPHX file for use with the <a href="https://flightsim.to/file/62573/msfs-soaring-task-tools-dphx-unpack-load" target="_blank">DPHX Unpack & Load tool</a></p>
            <p>
                <a href="#" onclick="TB.downloadDPHXFile('https://siglr.com/DiscordPostHelper/TaskBrowser/Tasks/${task.TaskID}.dphx', '${task.Title}.dphx')">
                    <img src="images/DPHXFile.png" alt="DPHX File" class="file-icon" style="width: 40px; height: 40px;">
                    ${task.Title}.dphx
                </a>
            </p>
            <p><strong>Option 2:</strong> Download individual files and install them yourself</p>
            <p>
                <a href="#" onclick="TB.downloadPLNFile()">
                    <img src="images/PLNFile.png" alt="PLN File" class="file-icon">
                    Flight plan file (PLN): ${tb.getFileNameFromPath(tb.currentTask.PLNFilename)}
                </a>
            </p>
            <p>
                <a href="#" onclick="TB.downloadWPRFile()">
                    <img src="images/WPRFile.png" alt="WPR File" class="file-icon">
                    Weather file (WPR): ${tb.getFileNameFromPath(tb.currentTask.WPRFilename)}
                </a>
            </p>
            <p>Current downloads (PLN or DPHX): ${task.TotDownloads}</p>`;
        tb.generateCollapsibleSection("📁 Files", filesContent, taskDetailContainer);
    }

    generateTaskDetailsRestriction(task) {
        let tb = this;
        // Get user settings for altitude
        const altitudeUnit = tb.userSettings.altitude || 'imperial';
        let restrictionsContent = '<ul>';
        tb.tbm.b21_task.waypoints.forEach((wp, index) => {
            const name = wp.name || `Waypoint ${index + 1}`;
            let restriction = '';

            const minAlt = wp.min_alt_m;
            const maxAlt = wp.max_alt_m;

            if (altitudeUnit === 'imperial') {
                if (maxAlt) {
                    restriction += `${name}: MAX ${Math.round(maxAlt * 3.28084)}'`;
                }
                if (minAlt) {
                    restriction += `${name}: MIN ${Math.round(minAlt * 3.28084)}'`;
                }
                if (maxAlt && minAlt) {
                    restriction = `${name}: Between ${Math.round(minAlt * 3.28084)}' and ${Math.round(maxAlt * 3.28084)}'`;
                }
            } else {
                if (maxAlt) {
                    restriction += `${name}: MAX ${Math.round(maxAlt)} m`;
                }
                if (minAlt) {
                    restriction += `${name}: MIN ${Math.round(minAlt)} m`;
                }
                if (maxAlt && minAlt) {
                    restriction = `${name}: Between ${Math.round(minAlt)} m and ${Math.round(maxAlt)} m`;
                }
            }

            if (restriction) {
                restrictionsContent += `<li>${restriction}</li>`;
            }
        });
        restrictionsContent += '</ul>';

        // Only generate the section if there are restrictions
        if (restrictionsContent !== '<ul></ul>') {
            tb.generateCollapsibleSection("⚠️ Altitude Restrictions", restrictionsContent, taskDetailContainer);
        }
    }

    generateTaskDetailsWeather(task) {
        let tb = this;
        const userSettings = tb.loadUserSettings(); // Load user settings for unit preferences

        // Collapsible Weather Section
        let elevMeasurement = tb.wsg_weather.isAltitudeAMGL ? "AMGL - Ground" : "AMSL - Sea";

        // MSL Pressure conversion
        let mslPressure = tb.wsg_weather.mslPressure;
        if (userSettings.pressure === 'inHg') {
            mslPressure = (mslPressure / 3386.39).toFixed(2) + ' inHg'; // Convert Pa to inHg
        } else {
            mslPressure = (mslPressure / 100).toFixed(2) + ' hPa'; // Convert Pa to hPa
        }
        if (parseFloat(mslPressure) !== 29.92) { // Check for non-standard value
            mslPressure += ' ⚠️';
        }

        // MSL Temperature conversion
        let mslTemperature = tb.wsg_weather.mslTemperature;
        if (userSettings.temperature === 'fahrenheit') {
            mslTemperature = ((mslTemperature - 273.15) * 9 / 5 + 32).toFixed(1) + ' °F'; // Convert Kelvin to Fahrenheit
        } else {
            mslTemperature = (mslTemperature - 273.15).toFixed(1) + ' °C'; // Convert Kelvin to Celsius
        }

        let aerosolIndex = tb.wsg_weather.aerosolDensity;

        // Precipitations
        let precipitations = tb.wsg_weather.precipitations;
        if (precipitations > 0) {
            if (userSettings.temperature === 'fahrenheit') {
                precipitations = (precipitations / 25.4).toFixed(2) + ' inch/h'; // Convert mm/h to inch/h
            } else {
                precipitations = precipitations + ' mm/h'; // Keep mm/h
            }
        } else {
            precipitations = null; // Don't display if 0
        }

        // Snow Cover
        let snowCover = tb.wsg_weather.snowCover;
        if (snowCover > 0) {
            if (userSettings.temperature === 'fahrenheit') {
                snowCover = (snowCover * 39.3701).toFixed(2) + ' inches'; // Convert meters to inches
            } else {
                snowCover = (snowCover * 100).toFixed(2) + ' cm'; // Convert meters to cm
            }
        } else {
            snowCover = null; // Don't display if 0
        }

        // Thunderstorm Intensity
        let thunderstormIntensity = tb.wsg_weather.thunderstormIntensity;
        if (thunderstormIntensity > 0) {
            thunderstormIntensity = (thunderstormIntensity * 100).toFixed(1) + ' %'; // Convert to percentage
        } else {
            thunderstormIntensity = null; // Don't display if 0
        }

        // Generate weather content HTML
        let weatherContent = `
            <ul>
                <li>Name: ${tb.wsg_weather.name}</li>
                ${task.WeatherSummary ? `<li>Summary: ${task.WeatherSummary}</li>` : ''}
                <li>Altitudes: ${elevMeasurement}</li>
                <li>MSL Pressure: ${mslPressure}</li>
                <li>MSL Temp.: ${mslTemperature}</li>
                <li>Aerosol: ${aerosolIndex}</li>
                ${precipitations ? `<li>Precipitations: ${precipitations}</li>` : ''}
                ${snowCover ? `<li>Snow Cover: ${snowCover}</li>` : ''}
                ${thunderstormIntensity ? `<li>Lightning: ${thunderstormIntensity}</li>` : ''}
            </ul>
            <img src="https://siglr.com/DiscordPostHelper/TaskBrowser/WeatherCharts/${task.EntrySeqID}.jpg" class="weather-image" onclick="TB.showImageModal(this.src)" />
        `;

        tb.generateCollapsibleSection("🌥 Weather & Chart", weatherContent, taskDetailContainer);
    }

    generateTaskDetailsWinds(task) {
        let tb = this;
        // Collapsible Winds Section
        let windsContent = `
        <p>
        Coming soon...
        </p>`;
        tb.generateCollapsibleSection("🌬️ Winds", windsContent, taskDetailContainer);
    }

    generateTaskDetailsClouds(task) {
        let tb = this;
        // Collapsible Clouds Section
        let cloudsContent = `
        <p>
        Coming soon...
        </p>`;
        tb.generateCollapsibleSection("☁️ Clouds", cloudsContent, taskDetailContainer);
    }

    generateTaskDetailsWaypoints(task) {
        let tb = this;

        // Create the waypoints content
        let waypointsContent = '';

        tb.tbm.b21_task.waypoints.forEach((wp) => {
            let firstLine = wp.getFirstLine();
            let secondLine = wp.getSecondLine();
            let thirdLine = wp.getThirdLine();

            // Wrap the lines in a div and conditionally add a horizontal line
            waypointsContent += `
                <div class="waypoint-item" data-index="${wp.index}" style="margin: 0; padding: 5px; cursor: pointer;">
                    <div>${firstLine}</div>
                    <div>${secondLine}</div>
                    <div>${thirdLine}</div>
                </div>
                ${wp.index < tb.tbm.b21_task.waypoints.length - 1 ? '<hr style="margin: 5px 0;">' : ''}
            `;
        });

        tb.generateCollapsibleSection("🗺️ Waypoints", waypointsContent, taskDetailContainer);

        document.querySelectorAll('.waypoint-item').forEach(item => {
            item.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                const waypoint = tb.tbm.b21_task.waypoints[index];
                if (waypoint && waypoint.position) {
                    waypoint.wp_click(waypoint);
                } else {
                    console.warn(`Waypoint ${index} does not have a valid position.`);
                }
            });
        });
    }

    selectWaypointInList(index) {
        let tb = this;
        // Remove 'selected' class from all waypoint items
        document.querySelectorAll('.waypoint-item').forEach(item => item.classList.remove('selected'));

        // Add 'selected' class to the clicked waypoint item
        const selectedItem = document.querySelector(`.waypoint-item[data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    selectWaypointOnMap(index) {
        let tb = this;
        let waypoint = tb.tbm.b21_task.waypoints[index];
        if (waypoint) {
            tb.tbm.b21_task.set_current_wp(index);
        }
    }

    showTaskDetailsStandalone(task) {
        let tb = this;
        const taskDetailContainer = document.getElementById("taskDetailContainer");
        tb.currentTask = task; // Save the current task for download use

        taskDetailContainer.innerHTML = tb.generateTaskDetailsMainSection(task);
        tb.generateTaskDetailsFullDescription(task);
        tb.generateTaskDetailsFiles(task);
        tb.generateTaskDetailsRestriction(task);
        tb.generateTaskDetailsWeather(task);
        tb.generateTaskDetailsWinds(task);
        tb.generateTaskDetailsClouds(task);
        tb.generateTaskDetailsWaypoints(task);

        // Show the task control panel
        const taskControlPanel = document.getElementById('taskControlPanel');
        taskControlPanel.style.display = 'block';

        // Add event listener to the deselect button
        const deselectButton = document.getElementById('deselectTaskButton');
        deselectButton.onclick = function () {
            tb.tbm.deselectTask();
        };
        // Add event listener to the copy to clipboard button
        const copyButton = document.getElementById('copyTaskLinkToClipboard');
        copyButton.onclick = function () {
            tb.copyTextToClipboard(`https://wesimglide.org/index.html?task=${task.EntrySeqID}`);
        };

        // Add event listener to the Discord task thread button
        const gotoDiscordThreadButton = document.getElementById('gotoDiscordThread');
        gotoDiscordThreadButton.onclick = function () {
            tb.incrementThreadAccess(task.EntrySeqID);
            window.open(`discord://discord.com/channels/1022705603489042472/${task.TaskID}`, '_blank');
        };

        // Add event listener to the download DPHX file button
        const directDPHXDownloadButton = document.getElementById('directDPHXDownload');
        directDPHXDownloadButton.onclick = function () {
            tb.downloadDPHXFile(`https://siglr.com/DiscordPostHelper/TaskBrowser/Tasks/${task.TaskID}.dphx`, `${task.Title}.dphx`);
        };

        // Add event listener to the toggle task details button
        const toggleTaskDetailsPanelButton = document.getElementById('toggleTaskDetailsPanel');
        toggleTaskDetailsPanelButton.onclick = function () {
            const taskDetailContainer = document.getElementById('taskDetailContainer');
            if (tb.TaskDetailsPanelVisible == false) {
                tb.TaskDetailsPanelVisible = true;
                tb.showTaskDetailsPanel();
            } else {
                tb.TaskDetailsPanelVisible = false;
                tb.hideTaskDetailsPanel();
            }
        };

    }

    // Function to show image in a modal
    showImageModal(src) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = "block";
        modalImg.src = src;
        document.addEventListener('keydown', TB.handleKeyDown); // Add event listener for keydown
    }

    // Function to close the image modal
    closeImageModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = "none";
        document.removeEventListener('keydown', TB.handleKeyDown); // Remove event listener for keydown
    }

    // Function to handle keydown events
    handleKeyDown(event) {
        if (event.key === 'Escape') {
            TB.closeImageModal();
        }
    }

    generateCollapsibleSection(title, content, container, id = null) {
        const section = document.createElement('div');
        section.className = 'tool-entry collapsible collapsed';

        if (id) {
            section.id = id;
        }

        const titleElement = document.createElement('div');
        titleElement.className = 'title';
        titleElement.innerText = title;

        const contentElement = document.createElement('div');
        contentElement.className = 'content';
        contentElement.innerHTML = content;

        section.appendChild(titleElement);
        section.appendChild(contentElement);

        titleElement.addEventListener('click', () => {
            section.classList.toggle('collapsed');
        });

        container.appendChild(section);
    }

    // Function to increment thread access count
    incrementThreadAccess(entrySeqID) {
        fetch(`php/IncrementThreadAccessForTask.php?EntrySeqID=${entrySeqID}`)
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    console.error('Error incrementing thread access:', data.message);
                }
            })
            .catch(err => console.error('Error incrementing thread access:', err));
    }

    incrementDownloadCount(entrySeqID) {
        // Call the PHP script to increment the download count
        fetch(`php/IncrementDownloadForTask.php?EntrySeqID=${entrySeqID}`)
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    console.error('Error incrementing download count:', data.message);
                }
            })
            .catch(err => console.error('Error incrementing download count:', err));
    }

    downloadDPHXFile(url, filename) {
        let tb = this;
        // Increment download count
        tb.incrementDownloadCount(tb.currentTask.EntrySeqID);

        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(err => console.error('Error downloading file:', err));
    }

    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/xml' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getFileNameFromPath(filePath) {
        return filePath.split('\\').pop().split('/').pop();
    }

    downloadPLNFile() {
        let tb = this;
        // Increment download count
        tb.incrementDownloadCount(tb.currentTask.EntrySeqID);
        const fileName = tb.getFileNameFromPath(tb.currentTask.PLNFilename);
        tb.downloadTextFile(tb.currentTask.PLNXML, fileName);
    }

    downloadWPRFile() {
        let tb = this;
        const fileName = tb.getFileNameFromPath(tb.currentTask.WPRFilename);
        tb.downloadTextFile(tb.currentTask.WPRXML, fileName);
    }

    getTaskDetails(entrySeqID, forceZoomToTask = false) {
        let tb = this;
        let fetch_promise;
        if (DEBUG_LOCAL) {
            fetch_promise = test_fetch_task_details(entrySeqID);
        } else {
            fetch_promise = fetch(`php/GetTaskDetails.php?entrySeqID=${entrySeqID}`);
        }
        fetch_promise
            .then(response => response.json())
            .then(task_details => { tb.handleTaskDetails(task_details, forceZoomToTask); })
            .catch(error => {
                console.error('Error fetching task details:', error);
            });
    }

    handleTaskDetails(task_details, forceZoomToTask = false) {
        let tb = this;

        if (!tb.tbm.b21_task) {
            tb.tbm.setB21Task(task_details);
        }

        if (!task_details.EntrySeqID == tb.tbm.b21_task.planner.currentEntrySeqID) {
            tb.tbm.setB21Task(task_details);
        }

        tb.setWeatherInfo(task_details.WPRXML);

        // Zoom in on the task if specified or if task bounds outside current map bounds
        let taskBounds = tb.tbm.b21_task.get_bounds();
        let mapBounds = tb.tbm.map.getBounds();
        let containsBounds = mapBounds.contains(taskBounds);

        if (forceZoomToTask || !containsBounds) {
            tb.tbm.zoomToTask();
        }
        //tb.tbm.map.fitBounds(tb.tbm.b21_task.get_bounds());
        tb.showTaskDetailsStandalone(task_details);
    }

    setWeatherInfo(wpr_str) {
        let tb = this;
        tb.wsg_weather = new WSG_Weather();
        tb.wsg_weather.load_wpr_str(wpr_str);
        console.log("Weather information loaded:", tb.wsg_weather);
    }

    clearTaskDetails() {
        // Assuming taskDetailContainer is the element that holds the task details
        let tb = this;
        let taskDetailContainer = document.getElementById('taskDetailContainer');
        if (taskDetailContainer) {
            taskDetailContainer.innerHTML = ''; // Clear the task details
        }
        tb.TaskDetailsPanelVisible = false;
        tb.hideTaskDetailsPanel();
    }

    generateToolEntry(title, description) {
        let tb = this;
        const descriptionHtml = tb.convertToMarkdown(description);

        const toolEntry = document.createElement('div');
        toolEntry.className = 'tool-entry collapsible collapsed';

        const titleElement = document.createElement('div');
        titleElement.className = 'title';
        titleElement.innerText = title;

        const contentElement = document.createElement('div');
        contentElement.className = 'content';
        contentElement.innerHTML = descriptionHtml;

        toolEntry.appendChild(titleElement);
        toolEntry.appendChild(contentElement);

        titleElement.addEventListener('click', () => {
            toolEntry.classList.toggle('collapsed');
        });

        const toolsTab = document.getElementById('toolsTab');
        toolsTab.appendChild(toolEntry);

        const links = contentElement.querySelectorAll('a');
        links.forEach(link => {
            const url = link.href;
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                tb.fetchYouTubeMetadata(url).then(metadata => {
                    if (metadata.embedHtml) {
                        const preview = document.createElement('div');
                        preview.className = 'link-preview';
                        preview.innerHTML = `
                            <div class="youtube-container">
                                ${metadata.embedHtml}
                                <div class="preview-details">
                                    ${metadata.ogTitle !== title ? `<a href="${url}" target="_blank"><h3>${metadata.ogTitle}</h3></a>` : ''}
                                    <p>${metadata.ogDescription}</p>
                                </div>
                            </div>
                        `;
                        link.insertAdjacentElement('afterend', preview);
                    }
                });
            } else {
                tb.fetchLinkMetadata(url).then(metadata => {
                    if ((metadata.ogTitle && metadata.ogTitle !== title) || metadata.ogDescription || metadata.ogImage) {
                        const preview = document.createElement('div');
                        preview.className = 'link-preview';
                        preview.innerHTML = `
                            ${metadata.ogImage ? `<img src="${metadata.ogImage}" alt="Preview Image">` : ''}
                            <div class="preview-details">
                                ${metadata.ogTitle && metadata.ogTitle !== title ? `<a href="${url}" target="_blank"><h3>${metadata.ogTitle}</h3></a>` : ''}
                                <p>${metadata.ogDescription}</p>
                            </div>
                        `;
                        link.insertAdjacentElement('afterend', preview);
                    }
                });
            }
        });
    }

    // Function to fetch metadata for YouTube links
    fetchYouTubeMetadata(url) {
        let videoId;
        if (url.includes('youtu.be')) {
            videoId = url.split('/').pop();
        } else {
            videoId = new URL(url).searchParams.get('v');
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyCQD9fCWerrxjy-GQr3-w0k1d2UftSXDfo&part=snippet`;
        return fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const snippet = data.items[0].snippet;
                const shortDescription = snippet.description.length > 400 ? snippet.description.substring(0, 400) + '...' : snippet.description;
                return {
                    ogTitle: snippet.title,
                    ogDescription: shortDescription,
                    ogImage: snippet.thumbnails.high.url,
                    embedHtml: `<iframe width="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
                };
            })
            .catch(error => {
                console.error('Error fetching YouTube metadata:', error);
                return {};
            });
    }

    // Function to fetch metadata for other links
    fetchLinkMetadata(url) {
        if (url.includes('discord.com') || url.includes('google.com')) {
            return Promise.resolve({});
        }
        const apiUrl = `php/FetchMetadata.php?url=${encodeURIComponent(url)}`;
        return fetch(apiUrl)
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching link metadata:', error);
                return {};
            });
    }

    setJsonCookie(name, jsonObject, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        var jsonString = JSON.stringify(jsonObject);
        var encodedJsonString = encodeURIComponent(jsonString);
        document.cookie = name + "=" + encodedJsonString + expires + "; path=/";
    }

    getJsonCookie(name, renewDays) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                var encodedJsonString = c.substring(nameEQ.length, c.length);
                var jsonString = decodeURIComponent(encodedJsonString);
                var jsonObject = JSON.parse(jsonString);

                // Renew the cookie's expiration date
                if (renewDays) {
                    this.setJsonCookie(name, jsonObject, renewDays);
                }

                return jsonObject;
            }
        }
        return null;
    }

    getCookieSize(name) {
        const jsonCookie = this.getJsonCookie(name);
        if (jsonCookie) {
            const jsonString = JSON.stringify(jsonCookie);
            const encodedJsonString = encodeURIComponent(jsonString);
            return encodedJsonString.length;
        }
        return 0;
    }

    saveMapUserSettings() {
        const tb = this;
        if (!tb.ApplyingSettings) {
            const settings = {
                mapLayer: tb.tbm.getCurrentMapLayer(),
                showAirports: tb.tbm.isLayerVisible('Airports'),
                showRailways: tb.tbm.isLayerVisible('Railways'),
                windCompass: tb.tbm.isLayerVisible('Wind Compass'),
                showSelectedOnly: tb.tbm.isLayerVisible('Show selected only'),
                taskDetailWidth: tb.taskDetailsContainerWidth
            };
            tb.setJsonCookie('mapUserSettings', settings, 300);
        }
    }

    loadMapUserSettings() {
        const tb = this;
        const settings = tb.getJsonCookie('mapUserSettings', 300);

        // Set default settings if not found
        const defaultSettings = {
            mapLayer: "Google Terrain",
            showAirports: true,
            showRailways: false,
            windCompass: false,
            showSelectedOnly: true,
            taskDetailWidth: '30%'
        };

        // Merge default settings with loaded settings
        const mergedSettings = { ...defaultSettings, ...settings };

        // Apply settings to the map
        tb.ApplyingSettings = true;
        tb.tbm.setMapLayer(mergedSettings.mapLayer);
        tb.tbm.setLayerVisibility('Airports', mergedSettings.showAirports);
        tb.tbm.setLayerVisibility('Railways', mergedSettings.showRailways);
        tb.tbm.setLayerVisibility('Wind Compass', mergedSettings.windCompass);
        tb.tbm.setLayerVisibility('Show selected only', mergedSettings.showSelectedOnly);
        tb.setTaskDetailWidth(mergedSettings.taskDetailWidth);
        tb.ApplyingSettings = false;
    }

    setTaskDetailWidth(width) {
        const tb = this;
        const taskDetailContainer = document.getElementById('taskDetailContainer');
        const mapContainer = document.getElementById('map');
        tb.taskDetailsContainerWidth = width;
        taskDetailContainer.style.width = width;
        mapContainer.style.width = `${100 - parseFloat(width)}%`;
        this.resizeMap(); // Ensure the map resizes correctly
    }

    loadUserSettings() {
        const tb = this;
        const settings = tb.getJsonCookie('userSettings', 300);

        // Default settings
        const defaultSettings = {
            uiTheme: 'dark',
            timeFormat: 'usa',
            altitude: 'imperial',
            distance: 'imperial',
            gateMeasurement: 'imperial',
            windSpeed: 'knots',
            pressure: 'inHg',
            temperature: 'fahrenheit'
        };

        // Merge default settings with saved settings
        const mergedSettings = { ...defaultSettings, ...settings };

        // Set the radio buttons based on the settings
        tb.ApplyingSettings = true;
        document.querySelector(`input[name="uiTheme"][value="${mergedSettings.uiTheme}"]`).checked = true;
        document.querySelector(`input[name="timeFormat"][value="${mergedSettings.timeFormat}"]`).checked = true;
        document.querySelector(`input[name="altitude"][value="${mergedSettings.altitude}"]`).checked = true;
        document.querySelector(`input[name="distance"][value="${mergedSettings.distance}"]`).checked = true;
        document.querySelector(`input[name="gateMeasurement"][value="${mergedSettings.gateMeasurement}"]`).checked = true;
        document.querySelector(`input[name="windSpeed"][value="${mergedSettings.windSpeed}"]`).checked = true;
        document.querySelector(`input[name="pressure"][value="${mergedSettings.pressure}"]`).checked = true;
        document.querySelector(`input[name="temperature"][value="${mergedSettings.temperature}"]`).checked = true;
        tb.ApplyingSettings = false;

        // Attach change event listeners to save settings when any radio button is changed
        document.querySelectorAll('#settingsForm input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                tb.saveUserSettings();
            });
        });

        return mergedSettings;
    }

    saveUserSettings() {
        const tb = this;
        if (!tb.ApplyingSettings) {
            const settings = {
                uiTheme: document.querySelector('input[name="uiTheme"]:checked').value,
                timeFormat: document.querySelector('input[name="timeFormat"]:checked').value,
                altitude: document.querySelector('input[name="altitude"]:checked').value,
                distance: document.querySelector('input[name="distance"]:checked').value,
                gateMeasurement: document.querySelector('input[name="gateMeasurement"]:checked').value,
                windSpeed: document.querySelector('input[name="windSpeed"]:checked').value,
                pressure: document.querySelector('input[name="pressure"]:checked').value,
                temperature: document.querySelector('input[name="temperature"]:checked').value
            };
            tb.setJsonCookie('userSettings', settings, 300);
            tb.userSettings = settings;
        }
    }

    hideTaskDetailsPanel() {
        let tb = this;
        if (tb.TaskDetailsPanelVisible == true) {
            return;
        }
        const taskDetailContainer = document.getElementById('taskDetailContainer');
        const resizer = document.getElementById('resizer');
        const map = document.getElementById('map');
        taskDetailContainer.style.display = 'none';
        resizer.style.display = 'none';
        map.style.width = '100%';
        tb.resizeMap(); // Ensure map is resized
    }

    showTaskDetailsPanel() {
        let tb = this;
        if (tb.TaskDetailsPanelVisible == false) {
            return;
        }
        const taskDetailContainer = document.getElementById('taskDetailContainer');
        const resizer = document.getElementById('resizer');
        const map = document.getElementById('map');
        taskDetailContainer.style.display = 'block';
        resizer.style.display = 'block';
        tb.setTaskDetailWidth(tb.taskDetailsContainerWidth);
        //tb.resizeMap(); // Ensure map is resized
    }

}