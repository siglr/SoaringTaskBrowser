function showTaskDetailsStandalone(entrySeqID) {
    fetch(`GetTaskDetails.php?entrySeqID=${entrySeqID}`)
        .then(response => response.json())
        .then(task => {
            const taskDetailContainer = document.getElementById("taskDetailContainer");
            taskDetailContainer.innerHTML = `
                <div class="task-details">
                    <h2>${task.Title} ${addCountryFlags(task.Countries)}</h2>
                    <p>${task.ShortDescription}</p>
                    <p>🗺 ${task.MainAreaPOI}</p>
                    <p>🛫 ${task.DepartureICAO} ${task.DepartureName} ${task.DepartureExtra}</p>
                    <p>🛬 ${task.ArrivalICAO} ${task.ArrivalName} ${task.ArrivalExtra}</p>
                    <p>⌚ ${task.SimDateTime} ${task.SimDateTimeExtraInfo}</p>
                    <p>↗️ ${task.SoaringRidge ? 'Ridge' : ''}${task.SoaringThermals ? ' Thermals' : ''}${task.SoaringWaves ? ' Waves' : ''}${task.SoaringDynamic ? ' Dynamic' : ''}</p>
                    <p>📏 ${task.TaskDistance} km total (${task.TotalDistance} mi total)</p>
                    <p>⏳ ${task.DurationMin} to ${task.DurationMax} minutes</p>
                    <p>✈️ ${task.RecommendedGliders}</p>
                    <p>🎚 ${task.DifficultyRating}</p>
                    <p>${task.Credits}</p>
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

function addCountryFlags(countries) {
    const flagMap = {
        "Russia": "🇷🇺",
        "Azerbaijan": "🇦🇿",
        // Add other country flags as needed
    };
    return countries.split(',').map(country => flagMap[country.trim()] || '').join(' ');
}
