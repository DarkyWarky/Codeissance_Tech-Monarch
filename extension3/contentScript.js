chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkPermission") {
        navigator.permissions.query({name: request.permission})
            .then(result => sendResponse({state: result.state}))
            .catch(() => sendResponse({state: 'error'}));
        return true; // Indicates that the response is sent asynchronously
    }
});