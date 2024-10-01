document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generate');
    const copyButton = document.getElementById('copy');
    const passwordDisplay = document.getElementById('password');
    const incognitoToggle = document.getElementById('incognito-toggle');
  
    generateButton.addEventListener('click', function() {
        const password = generateValidPassword();
        passwordDisplay.textContent = password;
        copyButton.style.display = 'inline-block';
    });
  
    copyButton.addEventListener('click', function() {
        const password = passwordDisplay.textContent;
        navigator.clipboard.writeText(password).then(() => {
            if (!incognitoToggle.checked) {
                getCurrentTab().then(tab => {
                    const url = new URL(tab.url);
                    const domain = url.hostname;
                    sendPasswordToAPI(password, domain);
                });
            }
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        });
    });
  
    function generateValidPassword() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*';
        
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        
        password = password.slice(0, 1).toUpperCase() + password.slice(1);
        
        for (let i = 0; i < 2; i++) {
            password += numbers[Math.floor(Math.random() * numbers.length)];
        }
        
        password += specialChars[Math.floor(Math.random() * specialChars.length)];
        
        while (password.length < 16) {
            const charSet = alphabet + numbers + specialChars;
            password += charSet[Math.floor(Math.random() * charSet.length)];
        }
        
        return password;
    }
  
    function sendPasswordToAPI(password, domain) {
        console.log('Sending to API:', { password, domain });
        fetch('http://127.0.0.1:8000/api/user/passwordgen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password, domain: domain }),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function getCurrentTab() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs.length > 0) {
                    resolve(tabs[0]);
                } else {
                    reject("No active tab found");
                }
            });
        });
    }

    let storedData = {};

    incognitoToggle.addEventListener('change', function() {
        if (this.checked) {
            enableIncognitoMode();
        } else {
            disableIncognitoMode();
        }
        chrome.storage.sync.set({incognitoMode: this.checked});
        updateIncognitoUI(this.checked);
    });

    chrome.storage.sync.get('incognitoMode', function(data) {
        incognitoToggle.checked = data.incognitoMode || false;
        updateIncognitoUI(incognitoToggle.checked);
        if (incognitoToggle.checked) {
            enableIncognitoMode();
        }
    });

    function enableIncognitoMode() {
        console.log('Incognito mode enabled');
        // Store current data
        chrome.storage.local.get(null, function(items) {
            storedData = items;
            // Clear local storage
            chrome.storage.local.clear(function() {
                console.log('Local storage cleared');
            });
        });

        // Clear cookies
        chrome.cookies.getAll({}, function(cookies) {
            for (let cookie of cookies) {
                chrome.cookies.remove({url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path, name: cookie.name});
            }
            console.log('Cookies cleared');
        });
    }

    function disableIncognitoMode() {
        console.log('Incognito mode disabled');
        // Restore stored data
        chrome.storage.local.set(storedData, function() {
            console.log('Local storage restored');
        });
        storedData = {};
    }

    function updateIncognitoUI(isIncognito) {
        document.body.style.backgroundColor = isIncognito ? '#333' : '#f0f0f0';
        document.body.style.color = isIncognito ? '#fff' : '#333';
        const incognitoLabel = document.querySelector('.incognito-label');
        incognitoLabel.textContent = isIncognito ? 'Incognito Mode (ON)' : 'Incognito Mode';
    }

    incognitoToggle.addEventListener('change', function() {
        if (this.checked) {
            console.log('Incognito mode enabled');
        } else {
            console.log('Incognito mode disabled');
        }
        chrome.storage.sync.set({incognitoMode: this.checked});
    });

    chrome.storage.sync.get('incognitoMode', function(data) {
        incognitoToggle.checked = data.incognitoMode || false;
    });
});