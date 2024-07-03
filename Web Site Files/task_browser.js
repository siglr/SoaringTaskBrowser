class TaskBrowser {
    constructor() {
        let tb = this;
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
    }

    init() {
        let tb = this;
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
        text = tb.replaceLineBreaks(text);
        text = tb.removeSpacesBeforeClosingAsterisks(text);
        text = tb.restoreLineBreaks(text);
        return tb.md.render(text);
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

    formatSimDateTime(simDateTime, includeYear) {
        const options = includeYear
            ? { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }
            : { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        const date = new Date(simDateTime);
        return new Intl.DateTimeFormat('en-US', options).format(date) + ' local in MSFS';
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

    showTaskDetailsStandalone(entrySeqID) {
        let tb = this;
        fetch(`php/GetTaskDetails.php?entrySeqID=${entrySeqID}`)
            .then(response => response.json())
            .then(task => {
                const taskDetailContainer = document.getElementById("taskDetailContainer");
                taskDetailContainer.innerHTML = `
                    <div class="task-details markdown-content">
                        <div class="task-header">
                            <span class="task-number">#${entrySeqID}</span>
                            <span class="task-flags">${this.addCountryFlags(task.Countries)}</span>
                        </div>
                        <h1>${task.Title}</h1>
                        ${tb.addDetailLineWithoutBreak('', tb.convertToMarkdown(task.ShortDescription))}
                        ${tb.addDetailLineWithBreak('🗺', task.MainAreaPOI)}
                        🛫 ${task.DepartureICAO} ${task.DepartureName} ${tb}<br>
                        🛬 ${task.ArrivalICAO} ${task.ArrivalName} ${this.addDetailWithinBrackets(task.ArrivalExtra)}<br>
                        ⌚ ${tb.formatSimDateTime(task.SimDateTime, task.IncludeYear)} ${tb.addDetailWithinBrackets(task.SimDateTimeExtraInfo)}<br>
                        ↗️ ${task.SoaringRidge ? 'Ridge' : ''}${task.SoaringThermals ? ' Thermals' : ''}${task.SoaringWaves ? ' Waves' : ''}${task.SoaringDynamic ? ' Dynamic' : ''} ${tb.addDetailWithinBrackets(task.SoaringExtraInfo)}<br>
                        📏 ${task.TaskDistance} km task (${task.TotalDistance} km total)<br>
                        ⏳ ${tb.formatDuration(task.DurationMin, task.DurationMax)} ${tb.addDetailWithinBrackets(task.DurationExtraInfo)}<br>
                        ✈️ ${task.RecommendedGliders}<br>
                        🎚 ${tb.formatDifficultyRating(task.DifficultyRating, task.DifficultyExtraInfo)}
                        <p>${task.Credits}</p>
                        <h2>📖 Full Description</h2>
                        ${tb.addDetailLineWithoutBreak('', tb.convertToMarkdown(task.LongDescription))}
                    </div>`;
            })
            .catch(error => {
                console.error('Error fetching task details:', error);
            });
    }

    showTaskListStandalone(tasks) {
        const taskListContainer = document.getElementById("taskListContainer");
        taskListContainer.innerHTML = tasks.map(task => `
            <div class="task-list-item" onclick="TB.selectTask(${task.EntrySeqID})">
                <h4>${task.Title}</h4>
                <p>${task.ShortDescription}</p>
            </div>
        `).join('');
    }

    selectTask(entrySeqID, forceBoundsUpdate = false) {
        let tb = this;
        tb.tbm.selectTask(entrySeqID, forceBoundsUpdate);
    }

}
