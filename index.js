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

        TB.taskDetailsContainerWidth = taskDetailContainer.style.width;

        TB.resizeMap(); // Ensure map is resized
        TB.saveMapUserSettings(); // Save the splitter position
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// Call resizeMap initially to ensure correct sizing on load
TB.resizeMap();

function loadToolsFromXML() {
    return fetch('otherdata/tools.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "application/xml");
            const tools = xmlDoc.getElementsByTagName('tool');
            const toolEntries = [];

            for (let i = 0; i < tools.length; i++) {
                const title = tools[i].getElementsByTagName('title')[0].textContent;
                const text = tools[i].getElementsByTagName('text')[0].textContent;
                toolEntries.push({ Title: title, Description: text });
            }

            return toolEntries;
        })
        .catch(error => {
            console.error('Error fetching tools:', error);
            return [];
        });
}

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
                    <li><a href="#" onclick="TB.switchTab('settingsTab')">(⚙️) Adjust your display settings here</a></li>
                    <li><a href="#" onclick="TB.switchTab('aboutTab')">( ℹ️ ) Learn a bit more about WeSimGlide.org</a></li>
                </ul>
                <p>Tell us what else you would like to see on the home page!</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>
                <hr>
                <div class="community-section">
                    <h2>Featured Soaring Communities and Clubs</h2>
                    <div class="community-logos">
                        <div class="community-item">
                            <a href="discord://discord.gg/got-gravel-793376245915189268" target="_blank">
                                <img src="images/SoaringDiamondsClub.jpg" alt="Soaring Diamonds Club" class="community-logo">
                            </a>
                            <p class="community-name"><strong>Soaring Diamonds Club</strong></p>
                            <p class="community-clubs">Hosted on<br>GotGravel's Discord</p>
                        </div>
                        <div class="community-item">
                            <a href="discord://discord.gg/got-gravel-793376245915189268" target="_blank">
                                <img src="images/GotGravel.jpg" alt="GotGravel" class="community-logo">
                            </a>
                            <p class="community-name"><strong>Friday Soaring Club</strong></p>
                            <p class="community-clubs">Hosted on<br>GotGravel's Discord</p>
                        </div>
                        <div class="community-item">
                            <a href="discord://discord.gg/h9H2MZyrg2" target="_blank">
                                <img src="images/SSCLogo.jpg" alt="Sim Soaring Club" class="community-logo">
                            </a>
                            <p class="community-name"><strong>Sim Soaring Club</strong></p>
                            <p class="community-clubs">Also home of<br>AusGlide Club</p>
                        </div>
                        <div class="community-item">
                            <a href="discord://discord.gg/9PtUtaH9tz" target="_blank">
                                <img src="images/UKVGALogo.jpg" alt="UKVGA" class="community-logo">
                            </a>
                            <p class="community-name"><strong>UK Virtual Gliding Association</strong></p>
                            <p class="community-clubs"></p>
                        </div>
                    </div>
                </div>`;
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
        case 'toolsTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>Most useful soaring tools and other references!</h2>
                </div>`;
            document.getElementById(tabId).innerHTML = content;
            setTimeout(() => {
                loadToolsFromXML().then(toolEntries => {
                    toolEntries.forEach(toolEntry => {
                        TB.generateToolEntry(toolEntry.Title, toolEntry.Description);
                    });

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
                });
            }, 0);
            break;
        case 'settingsTab':
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
    const settings = TB.userSettings;
    const timeFormat = settings?.timeFormat || 'usa'; // Default to 12 hours if not set

    events.forEach(event => {
        // Ensure the date is parsed correctly as UTC
        const eventDate = new Date(event.EventDate.replace(' ', 'T') + 'Z'); // Ensure the date is ISO format and UTC

        const localEventDate = eventDate.toLocaleString(navigator.language, {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: timeFormat === 'usa'
        });

        const dayOfWeek = eventDate.toLocaleDateString(navigator.language, { weekday: 'long' });

        let moreInfoLink = event.URLToGo;
        if (moreInfoLink && moreInfoLink.includes("discord.com")) {
            moreInfoLink = moreInfoLink.replace("https://", "discord://");
        }

        let soaringInfo = "<em>The task has not yet been published.</em>";
        let taskButton = "";
        let moreInfoContent = "";

        if (event.EntrySeqID) {
            soaringInfo = `
                ↗️ ${event.SoaringRidge ? 'Ridge' : ''}${event.SoaringThermals ? ' Thermals' : ''}${event.SoaringWaves ? ' Waves' : ''}${event.SoaringDynamic ? ' Dynamic' : ''} ${TB.addDetailWithinBrackets(event.SoaringExtraInfo)}<br>
                ⏳ ${TB.formatDuration(event.DurationMin, event.DurationMax)} ${TB.addDetailWithinBrackets(event.DurationExtraInfo)}<br>
            `;
            taskButton = `<button class="button-style" onclick="switchToMapAndSelectTask(${event.EntrySeqID})" title="View task on map">
                <img src="images/World.png" alt="View task on map" style="height: 20px; vertical-align: middle;">
            </button>`;
        }

        shareButton = `<button class="button-style" onclick="TB.copyTextToClipboard('https://wesimglide.org/index.html?event=${event.Key}')" title="Share event (copy link to clipboard)">
            <img src="images/ShareLink.png" alt="Share event (copy link to clipboard)" style="height: 20px; vertical-align: middle;">
        </button>`;

        if (moreInfoLink) {
            moreInfoContent = `<p><a href="${moreInfoLink}" target="_blank">More info on this group event</a></p>`;
        }

        // Determine highlight class
        const now = new Date(); // Define the current time
        const minutesToEvent = (eventDate - now) / 6000;
        let highlightClass = null;
        let titleSuffix = '';
        if (minutesToEvent <= 60 && minutesToEvent > 0) {
            highlightClass = 'highlightYellow';
            titleSuffix = ' (Starting soon)';
        } else if (eventDate <= now) {
            highlightClass = 'highlightGreen';
            titleSuffix = ' (In progress)';
        }

        const eventContent = `
            <h3>${event.Subtitle}</h3>
            <p>${TB.convertToMarkdown(event.Comments)}</p>
            ${soaringInfo}
            <p><strong>Event meetup time:</strong> ${localEventDate} local</p>
            ${moreInfoContent}
            ${taskButton}
            ${shareButton}
        `;

        TB.generateCollapsibleSection(`📆 ${dayOfWeek}, ${localEventDate} : ${event.Title}${titleSuffix}`, eventContent, eventsList, event.Key, highlightClass);
    });

    // Add this function to handle the tab switch and task selection
    window.switchToMapAndSelectTask = function (entrySeqID) {
        TB.switchTab('mapTab'); // Switch to the map tab
        TB.tbm.selectTaskFromURL(entrySeqID); // Select the task on the map
    };

    // Check URL params for an event ID and expand it if found
    const params = new URLSearchParams(window.location.search);
    const eventIdToExpand = params.get('event');
    if (eventIdToExpand) {
        const eventElement = document.getElementById(eventIdToExpand);
        if (eventElement) {
            eventElement.classList.remove('collapsed');
            eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

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
    if (tabId === 'mapTab') {
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
        TB.switchTab('mapTab');
        TB.tbm.selectTaskFromURL(params.task); // Ensure task details are fetched
    } else if (params.event) {
        TB.switchTab('eventsTab');
        const eventId = `${params.event}`;
        const eventElement = document.getElementById(eventId);
        if (eventElement) {
            eventElement.classList.remove('collapsed');
            eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (params.tab) {
        switch (params.tab) {
            case 'map':
                TB.switchTab('mapTab');
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