document.addEventListener("DOMContentLoaded", function () {
    if (window.chrome && window.chrome.webview) {
        // Exit if running inside WebView2
        return;
    }

    // Initialize standalone features
    initializeStandaloneFeatures();
});

function initializeStandaloneFeatures() {
    addTaskList();
    addTaskDetailDisplay();
    updateTaskList();
}

// Add task list display
function addTaskList() {
    const taskListContainer = document.getElementById('taskListContainer');
    // Additional styling and structure if needed
}

// Add task detail display
function addTaskDetailDisplay() {
    const taskDetailContainer = document.getElementById('taskDetailContainer');
    // Additional styling and structure if needed
}

// Update task list
function updateTaskList() {
    const taskListContainer = document.getElementById('taskListContainer');
    taskListContainer.innerHTML = ''; // Clear existing list

    Object.keys(polylines).forEach(entrySeqID => {
        const task = polylines[entrySeqID];

        const taskItem = document.createElement('div');
        taskItem.textContent = `Task #${entrySeqID}`;
        taskItem.style.cursor = 'pointer';
        taskItem.addEventListener('click', () => {
            selectTask(entrySeqID, true); // Select and zoom to task
        });

        taskListContainer.appendChild(taskItem);
    });
}

// Update task details
function updateTaskDetails() {
    const taskDetailContainer = document.getElementById('taskDetailContainer');
    taskDetailContainer.innerHTML = ''; // Clear existing details

    if (currentEntrySeqID) {
        const taskDetail = polylines[currentEntrySeqID];

        const detail = document.createElement('div');
        detail.textContent = `Task Details for #${currentEntrySeqID}`;
        // Populate with actual task details
        taskDetailContainer.appendChild(detail);
    }
}

// Hook to update the task list whenever tasks are fetched
document.addEventListener('tasksFetched', () => {
    if (!window.chrome || !window.chrome.webview) {
        updateTaskList();
    }
});
