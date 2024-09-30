const SERVER_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    setupTabListeners();
    document.getElementById('refreshButton').addEventListener('click', refreshBlockedCookies);
    document.getElementById('clearCookiesButton').addEventListener('click', clearAllBlockedCookies);
    document.getElementById('blockAllCookiesToggle').addEventListener('change', toggleBlockAllCookies);
    document.getElementById('blockWebsiteButton').addEventListener('click', blockWebsite);
    loadTabContent('cookie-rules');
    loadBlockedWebsites();
    displayCurrentWebsitePermissions(); // Call this only once
    refreshBlockedCookies();
    updateBlockAllCookiesToggle();
});

function setupTabListeners() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab-button.active').classList.remove('active');
            tab.classList.add('active');
            loadTabContent(tab.dataset.tab);
        });
    });
}

function loadTabContent(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'cookie-rules') {
        refreshBlockedCookies();
    } else if (tabName === 'site-permissions') {
        loadSitePermissions();
        displayCurrentWebsitePermissions(); // Refresh permissions when tab is selected
    } else if (tabName === 'session-history') {
        loadSessionHistory();
    } else if (tabName === 'website-blocking') {
        loadBlockedWebsites();
    }
}

function handleFetchResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        console.error('Unexpected content type:', contentType);
        return response.text().then(text => {
            console.error('Response text:', text);
            throw new Error("Oops, we haven't got JSON!");
        });
    }
}

// Use this function for all fetch calls
function fetchData(endpoint) {
    return fetch(`${SERVER_URL}/${endpoint}`)
        .then(handleFetchResponse)
        .catch(error => {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        });
}

function loadCookieRules() {
    fetchData('cookieRules')
        .then(data => {
            const cookieRulesDiv = document.getElementById('cookie-rules');
            cookieRulesDiv.innerHTML = '';
            for (const [domain, rule] of Object.entries(data)) {
                const ruleElement = document.createElement('div');
                const toggleSwitch = document.createElement('input');
                toggleSwitch.type = 'checkbox';
                toggleSwitch.checked = rule.blockAll;
                toggleSwitch.addEventListener('change', () => updateCookieRule(domain, toggleSwitch.checked));
                ruleElement.appendChild(toggleSwitch);
                ruleElement.appendChild(document.createTextNode(`${domain}: ${rule.blockAll ? 'Blocked' : 'Allowed'}`));
                cookieRulesDiv.appendChild(ruleElement);
            }
        })
        .catch(error => {
            console.error('Error loading cookie rules:', error);
            document.getElementById('cookie-rules').innerHTML = '<p>Error loading cookie rules.</p>';
        });
}

function updateCookieRule(domain, blockAll) {
    fetch(`${SERVER_URL}/cookieRules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [domain]: { blockAll } })
    })
    .then(response => response.json())
    .then(() => {
        console.log(`Updated cookie rule for ${domain}: ${blockAll ? 'Blocked' : 'Allowed'}`);
        loadCookieRules();
        chrome.runtime.sendMessage({action: "updateCookieRules"});
    })
    .catch(error => {
        console.error('Error updating cookie rule:', error);
    });
}

function loadSitePermissions() {
    chrome.runtime.sendMessage({action: "getPermissions"}, function(response) {
        if (response && response.permissions) {
            updatePermissionsDisplay(response.permissions);
        }
    });
}

function updatePermissionsDisplay(permissions) {
    const permissionsList = document.getElementById('permissionsList');
    permissionsList.innerHTML = '';
    for (const [permission, state] of Object.entries(permissions)) {
        const listItem = document.createElement('div');
        listItem.textContent = `${permission}: ${state}`;
        permissionsList.appendChild(listItem);
    }
}

function loadSessionContainers() {
    chrome.tabs.query({}, (tabs) => {
        const containersDiv = document.getElementById('containers');
        containersDiv.innerHTML = '';
        tabs.forEach(tab => {
            chrome.storage.session.get(`container_${tab.id}`, (data) => {
                const containerElement = document.createElement('div');
                containerElement.textContent = `Tab ${tab.id}: ${data[`container_${tab.id}`] || 'No container'}`;
                containersDiv.appendChild(containerElement);
            });
        });
    });
}

function loadAntiPhishingSettings() {
    fetchData('phishingBlacklist')
        .then(data => {
            const antiPhishingDiv = document.getElementById('anti-phishing');
            antiPhishingDiv.innerHTML = '';
            data.forEach(url => {
                const urlElement = document.createElement('div');
                urlElement.textContent = url;
                antiPhishingDiv.appendChild(urlElement);
            });
        })
        .catch(error => {
            console.error('Error loading anti-phishing settings:', error);
            document.getElementById('anti-phishing').innerHTML = '<p>Error loading anti-phishing settings.</p>';
        });
}

function refreshBlockedCookies() {
    chrome.storage.local.get('blockedCookies', function(data) {
        const blockedCookies = data.blockedCookies || [];
        const cookieList = document.getElementById('blockedCookieList');
        cookieList.innerHTML = '';
        blockedCookies.forEach(cookie => {
            const cookieItem = document.createElement('div');
            cookieItem.textContent = `${cookie.name} (${cookie.domain})`;
            cookieList.appendChild(cookieItem);
        });
    });
}

function clearAllBlockedCookies() {
    chrome.storage.local.set({blockedCookies: []}, function() {
        refreshBlockedCookies();
    });
}

function toggleBlockAllCookies() {
    const toggle = document.getElementById('blockAllCookiesToggle');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const hostname = new URL(currentTab.url).hostname;
        chrome.storage.local.get('cookieRules', function(data) {
            const cookieRules = data.cookieRules || {};
            cookieRules[hostname] = {blockAll: toggle.checked};
            chrome.storage.local.set({cookieRules: cookieRules}, function() {
                console.log(`Blocking all cookies for ${hostname}: ${toggle.checked}`);
                chrome.runtime.sendMessage({
                    action: "updateCookieRules",
                    hostname: hostname,
                    blockAll: toggle.checked
                });
            });
        });
    });
}

function updateBlockAllCookiesToggle() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const hostname = new URL(currentTab.url).hostname;
        chrome.storage.local.get('cookieRules', function(data) {
            const cookieRules = data.cookieRules || {};
            const toggle = document.getElementById('blockAllCookiesToggle');
            toggle.checked = cookieRules[hostname]?.blockAll || false;
        });
    });
}

function blockWebsite() {
    const input = document.getElementById('blockWebsiteInput');
    const website = input.value.trim();
    if (website) {
        chrome.storage.local.get('blockedWebsites', function(data) {
            const blockedWebsites = data.blockedWebsites || [];
            if (!blockedWebsites.includes(website)) {
                blockedWebsites.push(website);
                chrome.storage.local.set({blockedWebsites: blockedWebsites}, function() {
                    input.value = '';
                    loadBlockedWebsites();
                });
            }
        });
    }
}

function loadBlockedWebsites() {
    chrome.storage.local.get('blockedWebsites', function(data) {
        const blockedWebsites = data.blockedWebsites || [];
        const websiteList = document.getElementById('blockedWebsitesList');
        websiteList.innerHTML = '';
        blockedWebsites.forEach(website => {
            const listItem = document.createElement('li');
            listItem.textContent = website;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => removeBlockedWebsite(website));
            listItem.appendChild(removeButton);
            websiteList.appendChild(listItem);
        });
    });
}

function removeBlockedWebsite(website) {
    chrome.storage.local.get('blockedWebsites', function(data) {
        const blockedWebsites = data.blockedWebsites || [];
        const index = blockedWebsites.indexOf(website);
        if (index > -1) {
            blockedWebsites.splice(index, 1);
            chrome.storage.local.set({blockedWebsites: blockedWebsites}, function() {
                loadBlockedWebsites();
            });
        }
    });
}

function loadSessionHistory() {
    chrome.history.search({text: '', maxResults: 10}, function(historyItems) {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        historyItems.forEach(item => {
            const listItem = document.createElement('div');
            listItem.textContent = `${new Date(item.lastVisitTime).toLocaleString()} - ${item.title}`;
            historyList.appendChild(listItem);
        });
    });
}

function requestPermissionCheck() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        chrome.runtime.sendMessage({action: "checkPermissions", tabId: currentTab.id}, function(response) {
            if (response && response.permissions) {
                updatePermissionsDisplay(response.permissions);
            }
        });
    });
}

function addContainer() {
    const containerName = prompt("Enter container name:");
    if (containerName) {
        fetch(`${SERVER_URL}/containers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [containerName]: containerName })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Container added:', data);
            loadSessionContainers();
        })
        .catch(error => {
            console.error('Error adding container:', error);
        });
    }
}

function displayCurrentWebsitePermissions() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        const hostname = new URL(currentTab.url).hostname;
        const permissionsDiv = document.getElementById('permissionsList');
        permissionsDiv.innerHTML = `<h3>Permissions for ${hostname}:</h3>`;
        const permissionsToCheck = ['geolocation', 'notifications', 'microphone', 'camera'];
        
        Promise.all(permissionsToCheck.map(permission => 
            new Promise(resolve => {
                if (permission === 'microphone' || permission === 'camera') {
                    chrome.tabs.sendMessage(currentTab.id, {action: "checkPermission", permission: permission}, response => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                            resolve({ permission, state: 'not granted' });
                        } else {
                            resolve({ permission, state: response.state === 'granted' ? 'granted' : 'not granted' });
                        }
                    });
                } else {
                    chrome.permissions.contains({ permissions: [permission] }, result => {
                        resolve({ permission, state: result ? 'granted' : 'not granted' });
                    });
                }
            })
        )).then(results => {
            permissionsDiv.innerHTML = `<h3>Permissions for ${hostname}:</h3>`; // Clear previous results
            results.forEach(({ permission, state }) => {
                const permissionElement = document.createElement('div');
                permissionElement.textContent = `${permission}: ${state}`;
                permissionsDiv.appendChild(permissionElement);
            });
        });
    });
}

// Call this function when the popup is opened
displayCurrentWebsitePermissions();