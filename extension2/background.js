chrome.runtime.onInstalled.addListener(() => {
    console.log('Cookie Blocker extension installed.');
  });
  
  // Handle notification clicks to allow cookies
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
      // Implement logic to allow the cookie if needed
      console.log('User chose to allow the cookie.');
    }
  });
  
  // Use declarativeNetRequest to block cookies
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: { type: 'modifyHeaders', responseHeaders: [{ header: 'Set-Cookie', operation: 'remove' }] },
      condition: { urlFilter: '*', resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other'] }
    }]
  });
  
  // Listen for blocked cookies
  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const blockedCookies = details.responseHeaders.filter(header => 
        header.name.toLowerCase() === 'set-cookie'
      );
      
      if (blockedCookies.length > 0) {
        blockedCookies.forEach(cookie => {
          // Notify the user that a cookie has been blocked
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Cookie Blocked',
            message: `Blocked cookie: ${cookie.value.split(';')[0]}`,
            priority: 2,
            buttons: [{ title: 'Allow Cookie' }],
            requireInteraction: true,
          });
  
          // Send the blocked cookie to the server
          sendBlockedCookieToServer(cookie.value);
        });
      }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders', 'extraHeaders']
  );
  
  // Function to send blocked cookie information to the server
  function sendBlockedCookieToServer(cookie) {
    fetch('http://localhost:3000/api/blocked-cookies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cookie }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Blocked cookie sent to server:', data);
    })
    .catch(error => {
      console.error('Error sending blocked cookie to server:', error);
    });
  }