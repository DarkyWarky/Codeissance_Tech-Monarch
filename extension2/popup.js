document.getElementById('refreshButton').addEventListener('click', refreshCookies);

function refreshCookies() {
    fetch('http://localhost:3000/api/blocked-cookies')
        .then(response => response.json())
        .then(data => {
            const cookieList = document.getElementById('cookieList');
            cookieList.innerHTML = ''; // Clear existing list

            if (data.length === 0) {
                cookieList.innerHTML = '<p>No blocked cookies.</p>';
                return;
            }

            data.forEach(cookie => {
                const listItem = document.createElement('div');
                listItem.textContent = cookie.split(';')[0]; // Display only the name=value part of the cookie
                cookieList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching blocked cookies:', error);
            document.getElementById('cookieList').innerHTML = '<p>Error fetching blocked cookies.</p>';
        });
}

// Automatically refresh cookies when popup opens
refreshCookies();