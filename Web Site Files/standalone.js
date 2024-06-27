let countryCodes = {};

// Fetch country codes
fetch('https://flagcdn.com/en/codes.json')
    .then(response => response.json())
    .then(data => {
        countryCodes = data;
    })
    .catch(error => {
        console.error('Error fetching country codes:', error);
    });

// Mapping of country names in your app to the corresponding names used by the flag service
const countryNameMapping = {
    'Czech Republic': 'Czechia',
    'Virgin Islands U.S.': 'United States Virgin Islands',
    'Virgin Islands British': 'British Virgin Islands'
};

function addCountryFlags(countries) {
    const baseUrl = 'https://flagcdn.com/h24/';
    return countries.split(',').map(country => {
        const countryName = country.trim();
        // Use the mapping if it exists, otherwise use the original name
        const mappedCountryName = countryNameMapping[countryName] || countryName;
        const code = Object.keys(countryCodes).find(key => countryCodes[key].toLowerCase() === mappedCountryName.toLowerCase());
        return code ? `<img src="${baseUrl}${code}.webp" alt="${countryName}" title="${countryName}" style="margin-right: 5px;">` : countryName;
    }).join(' ');
}

function replaceLineBreaks(text) {
    // Replace custom line break placeholder with a temporary placeholder
    return text.replace(/\(\$\*\$\)/g, '($%$)');
}

function removeSpacesBeforeClosingAsterisks(text) {
    // Remove spaces before closing * or **
    return text.replace(/(\*\*|__)(.*?)\s+(\*\*|__)/g, (match, p1, p2, p3) => {
        return `${p1}${p2.trim()}${p3}`;
    }).replace(/(\*|_)(.*?)\s+(\*|_)/g, (match, p1, p2, p3) => {
        return `${p1}${p2.trim()}${p3}`;
    });
}

function restoreLineBreaks(text) {
    // Replace the temporary placeholder with actual line breaks
    return text.replace(/\(\$%\$\)/g, '\n');
}

function convertToMarkdown(text) {
    const md = window.markdownit({
        html: false,
        breaks: true,
        linkify: true,
        typographer: true
    });

    //console.log(text)
    // Step 1: Replace custom line break placeholder with a temporary placeholder
    text = replaceLineBreaks(text);

    //console.log(text)
    // Step 2: Remove spaces before closing * or **
    text = removeSpacesBeforeClosingAsterisks(text);

    //console.log(text)
    // Step 3: Replace the temporary placeholder with actual line breaks
    text = restoreLineBreaks(text);

    //console.log(text)
    // Step 4: Render markdown
    //console.log(md.render(text))
    return md.render(text);
}

function addDetailLineWithoutBreak(label, value) {
    return value ? `${label} ${value}` : '';
}

function addDetailLineWithBreak(label, value) {
    return value ? `${label} ${value} <br>` : '';
}

function addDetailWithinBrackets(value) {
    return value ? `(${value})` : '';
}

function formatDuration(min, max) {
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

function formatSimDateTime(simDateTime, includeYear) {
    const options = includeYear
        ? { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }
        : { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(simDateTime);
    return new Intl.DateTimeFormat('en-US', options).format(date) + ' local in MSFS';
}

function formatDifficultyRating(difficultyRating, difficultyExtraInfo) {
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

function showTaskDetailsStandalone(entrySeqID) {
    fetch(`GetTaskDetails.php?entrySeqID=${entrySeqID}`)
        .then(response => response.json())
        .then(task => {
            const taskDetailContainer = document.getElementById("taskDetailContainer");
            taskDetailContainer.innerHTML = `
                <div class="task-details markdown-content">
                    <div class="task-header">
                        <span class="task-number">#${entrySeqID}</span>
                        <span class="task-flags">${addCountryFlags(task.Countries)}</span>
                    </div>
                    <h1>${task.Title}</h1>
                    ${addDetailLineWithoutBreak('',convertToMarkdown(task.ShortDescription))}
                    ${addDetailLineWithBreak('🗺', task.MainAreaPOI)}
                    🛫 ${task.DepartureICAO} ${task.DepartureName} ${addDetailWithinBrackets(task.DepartureExtra)}<br>
                    🛬 ${task.ArrivalICAO} ${task.ArrivalName} ${addDetailWithinBrackets(task.ArrivalExtra)}<br>
                    ⌚ ${formatSimDateTime(task.SimDateTime, task.IncludeYear)} ${addDetailWithinBrackets(task.SimDateTimeExtraInfo)}<br>
                    ↗️ ${task.SoaringRidge ? 'Ridge' : ''}${task.SoaringThermals ? ' Thermals' : ''}${task.SoaringWaves ? ' Waves' : ''}${task.SoaringDynamic ? ' Dynamic' : ''} ${addDetailWithinBrackets(task.SoaringExtraInfo)}<br>
                    📏 ${task.TaskDistance} km task (${task.TotalDistance} km total)<br>
                    ⏳ ${formatDuration(task.DurationMin, task.DurationMax)} ${addDetailWithinBrackets(task.DurationExtraInfo)}<br>
                    ✈️ ${task.RecommendedGliders}<br>
                    🎚 ${formatDifficultyRating(task.DifficultyRating, task.DifficultyExtraInfo)}
                    <p>${task.Credits}</p>
                    <h2>📖 Full Description</h2>
                    ${addDetailLineWithoutBreak('',convertToMarkdown(task.LongDescription))}
                </div>`;
        })
        .catch(error => {
            console.error('Error fetching task details:', error);
        });
}

function showTaskListStandalone(tasks) {
    const taskListContainer = document.getElementById("taskListContainer");
    taskListContainer.innerHTML = tasks.map(task => `
        <div class="task-list-item" onclick="selectTask(${task.EntrySeqID})">
            <h4>${task.Title}</h4>
            <p>${task.ShortDescription}</p>
        </div>
    `).join('');
}

// Function to adjust the map size
function resizeMap() {
    if (window.mapInstance) {
        window.mapInstance.invalidateSize();
    }
}

// Add event listeners for resizing
window.addEventListener('resize', resizeMap);

// Call resizeMap initially to ensure correct sizing on load
resizeMap();

// Add resizer functionality
let isResizing = false;
const resizer = document.getElementById('resizer');
const tabsContainer = document.getElementById('tabsContainer');
const taskDetailContainer = document.getElementById('taskDetailContainer');

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
});

function resize(e) {
    if (isResizing) {
        const containerWidth = tabsContainer.offsetWidth + taskDetailContainer.offsetWidth;
        const newTabsWidth = e.clientX / containerWidth * 100;
        const newTaskDetailWidth = 100 - newTabsWidth;

        tabsContainer.style.width = `${newTabsWidth}%`;
        taskDetailContainer.style.width = `${newTaskDetailWidth}%`;

        resizeMap(); // Ensure map is resized
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}
