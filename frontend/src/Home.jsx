import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch the authenticated user's profile data
    axios.get('http://localhost:8000/profile', { withCredentials: true })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
      });
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      {userData ? (
        <div>
          <h2>Welcome, {userData.profile.displayName}</h2>
          <p>Email: {userData.profile.emails[0].value}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Home;
