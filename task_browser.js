"use strict"

class TaskBrowser {
    constructor() {
        let tb = this;
        let shouldHandlePopState = true; // Flag to control popstate handling
        console.log("new TaskBrowser()");
    }

    init() {
        let tb = this;
        console.log("TaskBrowser.init()");
        tb.countryCodes = {};
        tb.md = window.markdownit({
            html: false,
            breaks: true,
            linkify: true,
            typographer: true
        });
        tb.tbm = new TaskBrowserMap(tb);
        tb.initCountryCodes();

        // Mapping of country names in your app to the corresponding names used by the flag service
        tb.countryNameMapping = {
            'Czech Republic': 'Czechia',
            'Virgin Islands - U.S.': 'United States Virgin Islands',
            'Virgin Islands - British': 'British Virgin Islands'
        };
        tb.initCountryCodes();
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
        tb.shouldHandlePopState = true; // Re-enable popstate handling
    }

    resizeMap() {
        let tb = this;
        if (tb.tbm.map && document.getElementById('mapTab').classList.contains('active')) {
            tb.tbm.map.invalidateSize();
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
        const options = includeYear
            ? { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }
            : { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };

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

    showTaskDetailsStandalone(task) {
        let tb = this;
        console.log("showTaskDetailsStandalone", task);
        const taskDetailContainer = document.getElementById("taskDetailContainer");
        tb.currentTask = task; // Save the current task for download use

        // Format the last update date/time and description if present
        let lastUpdateInfo = "";
        const lastUpdateFormatted = tb.formatSimDateTime(task.LastUpdate, true, false, true);
        const lastUpdateDescription = task.LastUpdateDescription ? ` (${task.LastUpdateDescription})` : "";
        lastUpdateInfo = `Last update: ${lastUpdateFormatted}${lastUpdateDescription}`;

        taskDetailContainer.innerHTML = `
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
                📏 ${task.TaskDistance} km task (${task.TotalDistance} km total)<br>
                ⏳ ${tb.formatDuration(task.DurationMin, task.DurationMax)} ${tb.addDetailWithinBrackets(task.DurationExtraInfo)}<br>
                ✈️ ${task.RecommendedGliders}<br>
                🎚 ${tb.formatDifficultyRating(task.DifficultyRating, task.DifficultyExtraInfo)}
                <p>${task.Credits}</p>
                ${task.RepostText ? tb.addDetailLineWithoutBreak('', tb.convertToMarkdown(task.RepostText)) : ''}
                <p>${lastUpdateInfo}</p>
            </div>`;

        // Collapsible Full Description
        if (task.LongDescription) {
            tb.generateCollapsibleSection("📖 Full Description", tb.convertToMarkdown(task.LongDescription), taskDetailContainer);
        }

        // Collapsible Links
        let linksContent = `
            <ul>
                <li><a href="#" onclick="TB.copyTextToClipboard('https://wesimglide.org/index.html?task=${task.EntrySeqID}')">Share this task (copy link to clipboard)</a></li>
                <li><a href="discord://discord.com/channels/1022705603489042472/${task.TaskID}" target="_blank" onclick="TB.incrementThreadAccess(${task.EntrySeqID})">Link to this task's thread on Discord app</a></li>
                <li><a href="https://discord.com/channels/1022705603489042472/${task.TaskID}" target="_blank" onclick="TB.incrementThreadAccess(${task.EntrySeqID})">Link to this task's thread on Discord (web version)</a></li>
            </ul>`;
        tb.generateCollapsibleSection("🔗 Links", linksContent, taskDetailContainer);

        // Collapsible Files
        let filesContent = `
            <p><strong>Option 1:</strong> Download the single package DPHX file for use with the <a href="https://flightsim.to/file/62573/msfs-soaring-task-tools-dphx-unpack-load" target="_blank">DPHX Unpack & Load tool</a></p>
            <p><a href="#" onclick="TB.downloadDPHXFile('https://siglr.com/DiscordPostHelper/TaskBrowser/Tasks/${task.TaskID}.dphx', '${task.Title}.dphx')">${task.Title}.dphx</a></p>
            <p><strong>Option 2:</strong> Download individual files and install them yourself</p>
            <ul>
                <li><a href="#" onclick="TB.downloadPLNFile()">Flight plan file (PLN): ${tb.getFileNameFromPath(tb.currentTask.PLNFilename)}</a></li>
                <li><a href="#" onclick="TB.downloadWPRFile()">Weather file (WPR): ${tb.getFileNameFromPath(tb.currentTask.WPRFilename)}</a></li>
            </ul>
            <p>Current downloads (PLN or DPHX): ${task.TotDownloads}</p>`;
        tb.generateCollapsibleSection("📁 Files", filesContent, taskDetailContainer);
    }

    generateCollapsibleSection(title, content, container) {
        const section = document.createElement('div');
        section.className = 'tool-entry collapsible collapsed';

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
                } else {
                    console.log('Thread access incremented successfully');
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
                } else {
                    console.log('Download count incremented successfully');
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
        console.log("getTaskDetails()");
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
        console.log('handleTaskDetails', task_details.entrySeqID)
        tb.tbm.setB21Task(task_details);

        // Zoom in on the task if specified or if task bounds outside current map bounds
        let taskBounds = tb.tbm.b21_task.get_bounds();
        let mapBounds = tb.tbm.map.getBounds();
        let containsBounds = mapBounds.contains(taskBounds);

        if (forceZoomToTask || !containsBounds) {
            console.log('zooming to task', forceZoomToTask, containsBounds);
            tb.tbm.zoomToTask();
        }
        //tb.tbm.map.fitBounds(tb.tbm.b21_task.get_bounds());
        tb.showTaskDetailsStandalone(task_details);
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
}