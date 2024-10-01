document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generate');
    const copyButton = document.getElementById('copy');
    const passwordDisplay = document.getElementById('password');
  
    generateButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        const password = generateValidPassword();
        passwordDisplay.textContent = password;
        copyButton.style.display = 'inline-block';
      });
    });
  
    copyButton.addEventListener('click', function() {
      const password = passwordDisplay.textContent;
      navigator.clipboard.writeText(password).then(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          const url = new URL(tabs[0].url);
          const domain = url.hostname;
          sendPasswordToAPI(password, domain);
        });
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
      
      // Generate 8 random letters
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      
      // Ensure at least one uppercase letter
      password = password.slice(0, 1).toUpperCase() + password.slice(1);
      
      // Add 2 random numbers
      for (let i = 0; i < 2; i++) {
        password += numbers[Math.floor(Math.random() * numbers.length)];
      }
      
      // Add 1 random special character
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
      
      // Pad the password to 16 characters if it's shorter
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
        // Remove the line that opens a new tab
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle the error appropriately
      });
    }
  });