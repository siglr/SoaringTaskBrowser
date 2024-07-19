var TB = new TaskBrowser();
TB.init();

// Add event listeners for resizing
window.addEventListener('resize', TB.resizeMap);

// Add resizer functionality
let isResizing = false;
const resizer = document.getElementById('resizer');
const mapContainer = document.getElementById('map');
const taskDetailContainer = document.getElementById('taskDetailContainer');

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
});

function resize(e) {
    if (isResizing) {
        const containerWidth = mapContainer.offsetWidth + taskDetailContainer.offsetWidth;
        const newMapWidth = e.clientX / containerWidth * 100;
        const newTaskDetailWidth = 100 - newMapWidth;

        mapContainer.style.width = `${newMapWidth}%`;
        taskDetailContainer.style.width = `${newTaskDetailWidth}%`;

        TB.resizeMap(); // Ensure map is resized
        TB.saveUserSettings(); // Save the splitter position
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// Call resizeMap initially to ensure correct sizing on load
TB.resizeMap();

// Function to load tab content dynamically
function loadTabContent(tabId) {
    let content = '';
    switch (tabId) {
        case 'homeTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>Our home is under construction!</h2>
                </div>
                <p>Currently, you can use the tabs above to access the available features that are ready:</p>
                <ul class="all-links">
                    <li><a href="#" onclick="TB.switchTab('eventsTab')">(📆) Discover group flight events happening soon</a></li>
                    <li><a href="#" onclick="TB.switchTab('mapTab')">(🌐) Explore tasks on the world map</a></li>
                    <li><a href="#" onclick="TB.switchTab('toolsTab')">(🛠️) View a list of useful tools and other resources for soaring in MSFS</a></li>
                    <li><a href="#" onclick="TB.switchTab('aboutTab')">( ℹ️ ) Learn a bit more about WeSimGlide.org</a></li>
                </ul>
                <p>Tell us what else you would like to see on the home page!</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>`;
            break;
        case 'eventsTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>Group Soaring Events</h2>
                </div>
                <div id="eventsGeneralInfoSection"></div>
                <button id="refreshButton" class="button-style">↻ Refresh Events</button>
                <div id="eventsList"></div>
                `;
            break;
        case 'listTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>We hope to bring search and filtering capabilities soon!</h2>
                </div>
                <p>Meanwhile, you can search and filter tasks using our <a href="https://flightsim.to/file/62573/msfs-soaring-task-tools-dphx-unpack-load" target="_blank"><button class="button-style">DPHX Unpack & Load tool!</button></a></p>
                <p>Tell us what else you would like to see.</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>`;
            break;
        case 'toolsTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>Most useful soaring tools and other references!</h2>
                </div>`;
            document.getElementById(tabId).innerHTML = content;
            setTimeout(() => {
                TB.generateToolEntry('MSFS Soaring Tools',
                    `Of course, these are our own soaring tools! How can we not recommend them!
https://flightsim.to/file/62571/msfs-soaring-task-tools-discord-post-helper
https://flightsim.to/file/62573/msfs-soaring-task-tools-dphx-unpack-load
`);
                TB.generateToolEntry('B21 Task Planner',
                    `This one is **THE** ultimate tool to get to know and use to create the flight plans for your tasks.
https://xp-soaring.github.io/tasks/b21_task_planner/index.html

You will find a good discussion thread about it on the SSC Discord Server:
[B21 Task Planner on SSC](https://discord.com/channels/876123356385149009/878323455584534558)
`);
                TB.generateToolEntry('XCSoar',
                    `Useful tool to be used while flying a task in MSFS. This tool is used in real life but there is an integration app you can use with it so it can work in MSFS.
https://www.xcsoar.org/

You will also need XCSimSoar which is the integration app to use between MSFS and XCSoar.
[Google Drive for XCSimSoar](https://drive.google.com/u/0/uc?id=12cI8cNxAlZUNWZzdsqeELIJ9GnF31RdM)

You will find a good discussion thread about it on the SSC Discord Server:
[XCSoar on SSC](https://discord.com/channels/876123356385149009/935541676825538580)
`);
                TB.generateToolEntry('Kinetic Assistant',
                    `Useful tool to be used while flying (or perhaps more specifically to get you in the air?) in MSFS.
[Kinetic Assistant Official Page](https://msfs.touching.cloud/mods/kinetic-assistant/)
You will find a good discussion thread about it on the SSC Discord Server:
[Kinetic Assistant on SSC](https://discord.com/channels/876123356385149009/876133299989385257)

And here's a video that demonstrates the most valuable features of this app:
[MSFS Glider Tow With and Without Kinetic Assistant](https://youtu.be/aHr24V9H-wY)
`);
                TB.generateToolEntry('FSPM VFR Map',
                    `Adds your vario trails on the default VFR map for any glider.
https://flightsim.to/file/3181/fspm-vfr-map
`);
                TB.generateToolEntry('Little Navmap VR Panel',
                    `If you fly in VR and love Little NavMap, then this plugin is made for you!
https://flightsim.to/file/43086/little-navmap-vr-panel
`);
                TB.generateToolEntry('NB21 Logger',
                    `Soaring-oriented flight logger that creates IGC files with a lot of information in them.
https://flightsim.to/file/64628/nb21-logger
`);
                TB.generateToolEntry("SSC Soaring Weather 1",
                    `Although each task in the library and in a **DPHX** package comes with its own weather file, frequently they are coming from a pre-made package of weather profiles. 
Also, these ready-to-go profiles can be use when you're designing tasks or doing some improv flights around the world.
https://flightsim.to/file/56827/soaring-weather
There is also a version 2 in Beta at the moment that you can download from SSC's Discord:
[SSC Weather 2 Beta on Discord](https://discord.com/channels/876123356385149009/1015259957295325185/1221443335978483932)
`);
                TB.generateToolEntry("Merlinor's 160 Soaring Weather Presets",
                    `Here's another offering for pre-made weather profiles from @Merlinor. It can complement the SSC package above.
https://flightsim.to/file/77471/160-soaring-weather-presets
`);
                TB.generateToolEntry('Tutorials / Knowledge base on MSFS soaring and group flights',
                    `Great resources that will get you up to speed on soaring in MSFS and joining group flights!
[GotGravel - The Beginner's Guide to Soaring Events](https://discord.com/channels/793376245915189268/1097520643580362753/1097520937701736529)
[SSC - How to join our Group Flights](https://discord.com/channels/876123356385149009/1038819881396744285)
`);
                // Add the message and button below all the tool entries
                const messageAndButton = `
                    <p>If you would like to suggest a new tool or reference, contact us through our support channel on Discord!</p>
                    <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                        <button class="button-style">Go to our Discord</button>
                    </a>
                    <p></p>
                `;
                const toolsTab = document.getElementById('toolsTab');
                toolsTab.insertAdjacentHTML('beforeend', messageAndButton);
            }, 0);
            break;
        case 'settingsTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>Want to customize your settings? Coming soon!</h2>
                </div>
                <p>Tell us what you would like to see.</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>`;
            break;
        case 'aboutTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>About WeSimGlide</h2>
                </div>
                <p>Welcome to WeSimGlide.org, your go-to destination for virtual soaring in Flight Simulator. Inspired by the official WeGlide.org site for real-life soaring, WeSimGlide is dedicated to bringing the same level of community to the virtual skies.</p>
                <h3>Our Vision</h3>
                <p>WeSimGlide is part of a comprehensive solution designed to enhance your soaring experience. This project includes:</p>
                <ul class="all-links">
                    <li>A dedicated <strong>Discord server</strong> for community engagement and support. <a href="https://discord.gg/aW8YYe3HJF" target="_blank">(Discord Invite)</a></li>
                    <li>Several <strong>Windows applications</strong> tailored for soaring enthusiasts. <a href="https://flightsim.to/profile/siglr" target="_blank">(Visit FlightSim.to)</a></li>
                    <li>A detailed <strong>world map browser</strong> showcasing hundreds of soaring tasks created by talented designers from around the globe (this is where you are now).</li>
                </ul>
                <h3>Who's behind this?</h3>
                <p>While the library and tools are primarily a solo endeavor by myself, Guy (MajorDad), this project wouldn't be possible without the invaluable contributions of Ian (B21) and the input from many dedicated members of the community.</p>
                <h3>Support WeSimGlide.org</h3>
                <p>WeSimGlide is a passion project aimed at enriching the virtual soaring community. If you enjoy using these tools and would like to support further development, I welcome voluntary contributions. Your donations help us cover server costs, develop new features, and maintain the quality of our offerings.</p>
                <a href="https://www.paypal.com/paypalme/wesimglide" target="_blank">
                    <button class="button-style">Donate Now</button>
                </a>
                <p>Contributions can also take other forms:</p>
                <ul>
                    <li><strong>Community Contributions:</strong> Use our tools to create, share and download soaring tasks, provide feedback, or help others on the Discord server.</li>
                    <li><strong>Spread the Word:</strong> Share WeSimGlide.org with your friends and fellow pilots to help grow our community.</li>
                </ul>
                <p>Thank you for being a part of the WeSimGlide community. Together, we can make virtual soaring an even more incredible experience.</p>
                <h3>Be Advised</h3>
                <p><strong>Note:</strong> WeSimGlide.org is still a work in progress. I appreciate your patience and feedback as I continue to improve and expand the feature set.</p>`;
            break;
    }
    document.getElementById(tabId).innerHTML = content;
}

function fetchAndDisplayEvents() {
    fetch('php/RetrieveNewsWSG.php?newsType=1')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const events = data.data;
                displayEvents(events);
            } else {
                console.error('Error fetching events:', data.message);
            }
        })
        .catch(error => console.error('Error fetching events:', error));
}

function displayEventsStaticPortion() {
    const eventsTabGeneralInfo = document.getElementById('eventsGeneralInfoSection');

    // Add static general information collapsible section
    TB.generateCollapsibleSection("Global Schedule & Information", `
        <div class="general-info">
            <p>Welcome to the heart of our soaring communities! In this channel, you'll discover a comprehensive weekly schedule of group flights held by the various Discord communities, meticulously organized for enthusiasts across different time zones.</p>
            <h2>What's Inside:</h2>
            <ul>
                <li>A global calendar of all known group events from various soaring club channels, updated weekly.</li>
                <li>Quick reference to help you align with events, regardless of where you are in the world.</li>
            </ul>
            <h3>Remember:</h3>
            <p>While the events are listed in UTC times, these might not always correspond to your local day. Please check the local date and time (for you) usually displayed with the original event for best accuracy. Also, note that during daylight saving time changes, there might be a period with incorrect time indications.</p>
            <p>Dive into our global schedule and choose your next group flight adventure!</p>
            <div id="tutorials"></div>
            <div id="invites"></div>
            <h2>General Weekly Schedule</h2>
            <h3>Sunday</h3>
            <p>-</p>
            <h3>Monday</h3>
            <p>-</p>
            <h3>Tuesday</h3>
            🕘 09:30 UTC: Ausglide Tuesday <em>(Normal time)</em> - <a href="discord://discord.com/channels/876123356385149009/1066655140733517844">Event Channel</a></br>
            🕕 18:15 UTC: UKVGA Tuesday <em>(Daylight saving time)</em> - <a href="discord://discord.com/channels/325227457445625856/1166042887084048515">Event Channel</a></br>
            🕦 23:30 UTC: Diamonds Tuesday <em>(Daylight saving time)</em> - <a href="discord://discord.com/channels/793376245915189268/1097353400015921252">Event Channel</a></br>
            <h3>Wednesday</h3>
            🕔 17:45 UTC: SSC Wednesday <em>(Daylight saving time)</em> - <a href="discord://discord.com/channels/876123356385149009/1128345453063327835">Event Channel</a></br>
            <h3>Thursday</h3>
            🕕 18:15 UTC: UKVGA Thursday <em>(Daylight saving time)</em> - <a href="discord://discord.com/channels/325227457445625856/1166042920869175357">Event Channel</a></br>
            <h3>Friday</h3>
            🕘 21:00 UTC: Friday Soaring Club - <a href="discord://discord.com/channels/793376245915189268/1097354088892596234">Event Channel</a></br>
            <h3>Saturday</h3>
            🕔 17:45 UTC: SSC Saturday <em>(Daylight saving time)</em> - <a href="discord://discord.com/channels/876123356385149009/987611111509590087">Event Channel</a></br>
        </div>
    `, eventsTabGeneralInfo);

    // Add the tutorials section within the general information section
    const tutorialsContainer = document.getElementById('tutorials');
    TB.generateCollapsibleSection("Tutorials / Knowledge base on MSFS soaring and group flights", `
        <p>Great resources that will get you up to speed on soaring in MSFS and joining group flights!</p>
        <ul>
            <li><a href="https://discord.com/channels/793376245915189268/1097520643580362753/1097520937701736529" target="_blank">GotGravel - The Beginner's Guide to Soaring Events</a></li>
            <li><a href="https://discord.com/channels/876123356385149009/1038819881396744285" target="_blank">SSC - How to join our Group Flights</a></li>
        </ul>
    `, tutorialsContainer);

    // Add the invites section within the general information section
    const invitesContainer = document.getElementById('invites');
    TB.generateCollapsibleSection("Discord Club Invites", `
        <p>To gain access to the several club events listed on the Hub, you will first need to register on their Discord server. Here are invite links to do so.</p>
        <ul>
            <li><strong>AusGlide</strong> and <strong>Sim Soaring Club</strong> (on same SSC Discord): <a href="discord://discord.gg/h9H2MZyrg2" target="_blank">https://discord.gg/h9H2MZyrg2</a></li>
            <li><strong>💎 Diamonds</strong> and <strong>Friday Soaring Club</strong> (on same SSC Discord): <a href="discord://discord.gg/got-gravel-793376245915189268" target="_blank">https://discord.gg/got-gravel-793376245915189268</a></li>
            <li><strong>UK Virtual Gliding Association</strong> (UKVGA Discord): <a href="discord://discord.gg/9PtUtaH9tz" target="_blank">https://discord.gg/9PtUtaH9tz</a></li>
            <li><strong>Planeur France FS2020</strong>: <a href="discord://discord.gg/h2GuWXJaGK" target="_blank">https://discord.gg/h2GuWXJaGK</a></li>
        </ul>
    `, invitesContainer);
}

function displayEvents(events) {
    const eventsTabEventsList = document.getElementById('eventsList');

    events.forEach(event => {
        // Ensure the date is parsed correctly as UTC
        const eventDate = new Date(event.EventDate.replace(' ', 'T') + 'Z'); // Ensure the date is ISO format and UTC

        // Convert to local time zone
        const localEventDate = eventDate.toLocaleString(navigator.language, {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });

        const dayOfWeek = eventDate.toLocaleDateString(navigator.language, { weekday: 'long' });

        let moreInfoLink = event.URLToGo;
        if (moreInfoLink && moreInfoLink.includes("discord.com")) {
            moreInfoLink = moreInfoLink.replace("https://", "discord://");
        }

        let soaringInfo = "<em>The task has not been published yet.</em>";
        let taskButton = "";
        let moreInfoContent = "";

        if (event.EntrySeqID) {
            soaringInfo = `
                ↗️ ${event.SoaringRidge ? 'Ridge' : ''}${event.SoaringThermals ? ' Thermals' : ''}${event.SoaringWaves ? ' Waves' : ''}${event.SoaringDynamic ? ' Dynamic' : ''} ${TB.addDetailWithinBrackets(event.SoaringExtraInfo)}<br>
                ⏳ ${TB.formatDuration(event.DurationMin, event.DurationMax)} ${TB.addDetailWithinBrackets(event.DurationExtraInfo)}<br>
            `;
            taskButton = `<button class="button-style" onclick="switchToMapAndSelectTask(${event.EntrySeqID})">View task on map</button>`;
        }

        if (moreInfoLink) {
            moreInfoContent = `<p><a href="${moreInfoLink}" target="_blank">More info on this group event</a></p>`;
        }

        const eventContent = `
            <h3>${event.Subtitle}</h3>
            <p>${TB.convertToMarkdown(event.Comments)}</p>
            ${soaringInfo}
            <p><strong>Event meetup time:</strong> ${localEventDate} local</p>
            ${moreInfoContent}
            ${taskButton}
        `;

        TB.generateCollapsibleSection(`📆 ${dayOfWeek}, ${localEventDate} : ${event.Title}`, eventContent, eventsList);
    });

    // Add this function to handle the tab switch and task selection
    window.switchToMapAndSelectTask = function (entrySeqID) {
        TB.switchTab('mapTab'); // Switch to the map tab
        TB.tbm.selectTaskFromURL(entrySeqID); // Select the task on the map
    };

}

// Call fetchAndDisplayEvents when the events tab is switched to
TB.switchTab = function (tabId) {
    // Load content if it hasn't been loaded yet
    const tabContent = document.getElementById(tabId);
    if (!tabContent.innerHTML) {
        loadTabContent(tabId);
        if (tabId === 'eventsTab') {
            displayEventsStaticPortion();
            fetchAndDisplayEvents();
            // Refresh events function
            document.getElementById('refreshButton').addEventListener('click', () => {
                document.getElementById('eventsList').innerHTML = ''; // Clear the events list
                fetchAndDisplayEvents(); // Fetch and display updated events
            });
        }
    }

    // Switch tabs
    const tabs = document.getElementsByClassName('tabContent');
    for (let tab of tabs) {
        tab.classList.remove('active');
    }
    tabContent.classList.add('active');

    const buttons = document.getElementsByClassName('tabButton');
    for (let button of buttons) {
        button.classList.remove('active');
    }
    document.querySelector(`button[data-tab="${tabId}"]`).classList.add('active');

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId.replace('Tab', ''));

    // Preserve task or event parameters based on the active tab
    if (tabId === 'mapTab' || tabId === 'listTab') {
        const taskParam = url.searchParams.get('task');
        if (taskParam) {
            url.searchParams.set('task', taskParam);
        } else {
            url.searchParams.delete('task');
        }
        url.searchParams.delete('event');
    } else if (tabId === 'eventTab') {
        const eventParam = url.searchParams.get('event');
        if (eventParam) {
            url.searchParams.set('event', eventParam);
        } else {
            url.searchParams.delete('event');
        }
        url.searchParams.delete('task');
    } else {
        url.searchParams.delete('task');
        url.searchParams.delete('event');
    }

    // Update page title based on the active tab
    switch (tabId) {
        case 'homeTab':
            document.title = "WeSimGlide - Home";
            break;
        case 'eventsTab':
            document.title = "WeSimGlide - Events";
            break;
        case 'mapTab':
            document.title = "WeSimGlide - World Map";
            break;
        case 'listTab':
            document.title = "WeSimGlide - Task List";
            break;
        case 'toolsTab':
            document.title = "WeSimGlide - Tools";
            break;
        case 'settingsTab':
            document.title = "WeSimGlide - Settings";
            break;
        case 'aboutTab':
            document.title = "WeSimGlide - About";
            break;
        default:
            document.title = "WeSimGlide";
            break;
    }

    window.history.pushState({}, '', url);
};

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    return result;
}

function handleParams(params) {
    if (params.task) {
        if (params.tab === 'list') {
            TB.switchTab('listTab');
        } else {
            TB.switchTab('mapTab');
        }
        TB.tbm.selectTaskFromURL(params.task); // Ensure task details are fetched
    } else if (params.event) {
        TB.switchTab('eventsTab');
    } else if (params.tab) {
        switch (params.tab) {
            case 'map':
                TB.switchTab('mapTab');
                break;
            case 'list':
                TB.switchTab('listTab');
                break;
            case 'events':
                TB.switchTab('eventsTab');
                break;
            case 'tools':
                TB.switchTab('toolsTab');
                break;
            case 'settings':
                TB.switchTab('settingsTab');
                break;
            case 'about':
                TB.switchTab('aboutTab');
                break;
            case 'home':
                TB.switchTab('homeTab');
                break;
            default:
                TB.switchTab('homeTab');
                break;
        }
    } else {
        TB.switchTab('homeTab');
    }
}

// URL parameter handling
document.addEventListener('DOMContentLoaded', function () {
    const params = getUrlParams();
    handleParams(params);
});

// Handle browser back and forward buttons
window.addEventListener('popstate', function () {
    if (TB.shouldHandlePopState) {
        const params = getUrlParams();
        handleParams(params);
    }
    TB.shouldHandlePopState = true;
});