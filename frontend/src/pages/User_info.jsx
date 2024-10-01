import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const User_info = () => {
  const [routineData, setRoutineData] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      const profileResponse = await axios.get('http://localhost:8000/api/user/profile', {
        withCredentials: true
      });
      const profile = profileResponse.data;
      console.log('Received profile data:', profile);

      setUserProfile(profile);

      // Fetch routine and download data from the new endpoints
      await fetchUserData();
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (err.response && err.response.status === 401) {
        navigate('/');
      } else {
        setError('Failed to fetch user profile: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const routineResponse = await axios.get('http://localhost:8000/routine');
      setRoutineData(routineResponse.data);

      const downloadResponse = await axios.get('http://localhost:8000/downloads');
      setDownloadData(downloadResponse.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-600 to-indigo-700 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">User Information</h1>
      
      {userProfile && (
        <p className="text-center mb-8">User: {userProfile.email || userProfile.fullUser?.email}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/10 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Routine Data</h2>
          {routineData ? (
            <pre className="bg-black/30 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(routineData, null, 2)}
            </pre>
          ) : (
            <p>No routine data available.</p>
          )}
        </div>

        <div className="bg-white/10 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Download Data</h2>
          {downloadData ? (
            <pre className="bg-black/30 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(downloadData, null, 2)}
            </pre>
          ) : (
            <p>No download data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default User_info;