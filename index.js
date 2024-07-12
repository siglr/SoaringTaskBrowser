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
                    <h2>Soon you'll find links to useful soaring tools and other references!</h2>
                </div>
                <p>Tell us what you would like to see.</p>
                <a href="discord://discord.com/channels/1022705603489042472/1258192556202922107" target="_blank">
                    <button class="button-style">Go to our Discord</button>
                </a>`;
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
