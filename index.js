var TB = new TaskBrowser();
TB.init();

// Add event listeners for resizing
window.addEventListener('resize', TB.resizeMap);

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

        TB.resizeMap(); // Ensure map is resized
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
                <p>Tell us what you would like to see.</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>`;
            break;
        case 'eventTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>Soon you will find soaring events here!</h2>
                </div>
                <p>Tell us what you would like to see.</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>`;
            break;
        case 'listTab':
            content = `
                <div class="header-container">
                    <img src="images/WeSimGlide.png" alt="WeSimGlideLogo" class="header-image">
                    <h2>We hope to bring search and filtering capabilities soon!</h2>
                </div>
                <p>Tell us what you would like to see.</p>
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
                <ul>
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

// Overriding the switchTab function to load content dynamically
TB.switchTab = function (tabId) {
    // Load content if it hasn't been loaded yet
    const tabContent = document.getElementById(tabId);
    if (!tabContent.innerHTML) {
        loadTabContent(tabId);
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
};
