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

function addCountryFlags(countries) {
    const baseUrl = 'https://flagcdn.com/w40/';
    return countries.split(',').map(country => {
        const countryName = country.trim();
        const code = Object.keys(countryCodes).find(key => countryCodes[key].toLowerCase() === countryName.toLowerCase());
        return code ? `<img src="${baseUrl}${code}.webp" alt="${countryName}" title="${countryName}" style="margin-right: 5px;">` : countryName;
    }).join(' ');
}

function convertToMarkdown(text) {
    const md = window.markdownit();
    return md.render(text.replace(/\(\$\*\$\)/g, '\n'));
}

function addDetailLinePlusBreak(label, value) {
    return value ? `${label} ${value}<br>` : '';
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

function showTaskDetailsStandalone(entrySeqID) {
    fetch(`GetTaskDetails.php?entrySeqID=${entrySeqID}`)
        .then(response => response.json())
        .then(task => {
            const taskDetailContainer = document.getElementById("taskDetailContainer");
            taskDetailContainer.innerHTML = `
                <div class="task-details">
                    #${entrySeqID}
                    <h1>${task.Title}<br>${addCountryFlags(task.Countries)}</h1>
                    ${addDetailLinePlusBreak('',convertToMarkdown(task.ShortDescription))}
                    ${addDetailLinePlusBreak('🗺', task.MainAreaPOI)}
                    🛫 ${task.DepartureICAO} ${task.DepartureName} ${addDetailWithinBrackets(task.DepartureExtra)}<br>
                    🛬 ${task.ArrivalICAO} ${task.ArrivalName} ${addDetailWithinBrackets(task.ArrivalExtra)}<br>
                    ⌚ ${task.SimDateTime} ${addDetailWithinBrackets(task.SimDateTimeExtraInfo)}<br>
                    ↗️ ${task.SoaringRidge ? 'Ridge' : ''}${task.SoaringThermals ? ' Thermals' : ''}${task.SoaringWaves ? ' Waves' : ''}${task.SoaringDynamic ? ' Dynamic' : ''} ${addDetailWithinBrackets(task.SoaringExtraInfo)}<br>
                    📏 ${task.TaskDistance} km task (${task.TotalDistance} km total)<br>
                    ⏳ ${formatDuration(task.DurationMin, task.DurationMax)} ${addDetailWithinBrackets(task.DurationExtraInfo)}<br>
                    ✈️ ${task.RecommendedGliders}<br>
                    🎚 ${task.DifficultyRating}<br><br>
                    <p>${task.Credits}</p><br>
                    ${addDetailLinePlusBreak('',convertToMarkdown(task.LongDescription))}
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
