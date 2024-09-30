const SERVER_URL = 'http://localhost:8000/api';  // Updated to match your server port

// Initialize storage and set up listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('Privacy Guardian extension installed.');
  fetchAllDataFromServer();
});

function fetchAllDataFromServer() {
  fetch(`${SERVER_URL}/all`)
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set(data);
      setupCookieBlocking(data.cookieRules);
    })
    .catch(error => console.error('Error fetching data from server:', error));
}

function setupCookieBlocking(cookieRules) {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'Set-Cookie', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: '*',
        resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other']
      }
    }]
  });
}

chrome.cookies.onChanged.addListener((changeInfo) => {
  if (!changeInfo.removed) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        const hostname = new URL(tabs[0].url).hostname;
        chrome.storage.local.get("cookieRules", (data) => {
          const cookieRules = data.cookieRules || {};
          if (cookieRules[hostname]?.blockAll) {
            chrome.cookies.remove({
              url: tabs[0].url,
              name: changeInfo.cookie.name
            });
            sendBlockedCookieToServer(changeInfo.cookie, hostname);
          }
        });
      }
    });
  }
});

function sendBlockedCookieToServer(cookie, domain) {
  fetch(`${SERVER_URL}/user/blockedCookies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cookie, domain })
  }).catch(error => console.error('Error sending blocked cookie to server:', error));

  // Also store the blocked cookie locally
  chrome.storage.local.get('blockedCookies', (data) => {
    const blockedCookies = data.blockedCookies || [];
    blockedCookies.push({ name: cookie.name, domain: domain });
    chrome.storage.local.set({ blockedCookies: blockedCookies });
  });
}

// Anti-Phishing
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    checkForPhishing(tabId, tab.url);
  }
});

function checkForPhishing(tabId, url) {
  chrome.storage.local.get("phishingBlacklist", (data) => {
    const blacklist = data.phishingBlacklist || [];
    if (blacklist.includes(url)) {
      chrome.tabs.update(tabId, {url: chrome.runtime.getURL("blocked.html")});
    }
  });
}

// Replace the container-related code with session history tracking
let sessionHistory = [];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    addToSessionHistory(tab.url);
  }
});

function addToSessionHistory(url) {
  const timestamp = new Date().toISOString();
  sessionHistory.push({ url, timestamp });
  // Limit history to last 100 entries to prevent excessive memory usage
  if (sessionHistory.length > 100) {
    sessionHistory.shift();
  }
  // Notify popup to update history display
  chrome.runtime.sendMessage({ action: "updateSessionHistory", history: sessionHistory });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSessionHistory") {
    sendResponse({ history: sessionHistory });
  }
});

// Get all permissions for current website
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      getWebsitePermissions(tab.url);
    }
  });
});

function getWebsitePermissions(url) {
  chrome.permissions.getAll((permissions) => {
    const hostname = new URL(url).hostname;
    const websitePermissions = permissions.origins.filter(origin => origin.includes(hostname));
    console.log(`Permissions for ${hostname}:`, websitePermissions);
    // You can send this information to your popup or use it as needed
  });
}

// Sync data with server periodically
function syncDataWithServer() {
  fetchAllDataFromServer();
}

setInterval(syncDataWithServer, 5 * 60 * 1000); // Every 5 minutes

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "reportToServer") {
    fetch(`${SERVER_URL}/${request.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.data)
    }).catch(error => console.error(`Error reporting to server:`, error));
  }
});

// Container management
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    addToSessionHistory(tab.url);
  }
});

// Site Permissions Management
chrome.permissions.onAdded.addListener((permissions) => {
  if (permissions.origins) {
    updateSitePermissions(permissions.origins[0], true);
  }
});

chrome.permissions.onRemoved.addListener((permissions) => {
  if (permissions.origins) {
    updateSitePermissions(permissions.origins[0], false);
  }
});

function updateSitePermissions(origin, granted) {
  chrome.storage.local.get("sitePermissions", (data) => {
    const permissions = data.sitePermissions || {};
    permissions[origin] = granted;
    chrome.storage.local.set({ sitePermissions: permissions }, () => {
      console.log(`Updated site permissions: ${origin} - ${granted ? 'Granted' : 'Denied'}`);
    });
    
    // Update server
    fetch(`${SERVER_URL}/sitePermissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions)
    }).catch(error => console.error('Error updating site permissions on server:', error));
  });
}

// Website Blocking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    checkBlockedWebsite(tabId, tab.url);
  }
});

function checkBlockedWebsite(tabId, url) {
  chrome.storage.local.get({blockedWebsites: []}, (data) => {
    const blockedWebsites = data.blockedWebsites;
    if (blockedWebsites.some(blockedUrl => url.includes(blockedUrl))) {
      chrome.tabs.update(tabId, {url: chrome.runtime.getURL("blocked.html")});
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateCookieRules") {
    // Refresh cookie blocking rules
    chrome.storage.local.get("cookieRules", (data) => {
      setupCookieBlocking(data.cookieRules);
    });
  }
});

// Function to check current site permissions
function checkCurrentSitePermissions(tabId, url) {
  const permissionsToCheck = [
    'geolocation',
    'notifications',
    'microphone',
    'camera'
  ];

  chrome.permissions.contains({
    permissions: permissionsToCheck,
    origins: [url]
  }, (result) => {
    const permissions = {};
    permissionsToCheck.forEach(permission => {
      permissions[permission] = result ? 'granted' : 'not granted';
    });
    chrome.storage.local.set({ [url]: permissions }, () => {
      console.log(`Permissions for ${url} updated:`, permissions);
      chrome.runtime.sendMessage({ 
        action: "updateSitePermissions", 
        url: url, 
        permissions: permissions 
      });
    });
  });
}

// Check permissions when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkCurrentSitePermissions(tabId, tab.url);
  }
});

// Cookie blocking
chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    return {
      responseHeaders: details.responseHeaders.filter(header => header.name.toLowerCase() !== 'set-cookie')
    };
  },
  {urls: ["<all_urls>"]},
  ["blocking", "responseHeaders"]
);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPermissions") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        chrome.storage.local.get(tabs[0].url, (data) => {
          sendResponse({permissions: data[tabs[0].url] || {}});
        });
        return true; // Indicates that the response is sent asynchronously
      }
    });
  }
});