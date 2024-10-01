import React, { useState, useEffect } from 'react';
import axios from 'axios';

const User_info = () => {
  const [routineData, setRoutineData] = useState(null);
  const [downloadData, setDownloadData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch routine data
        const routineResponse = await axios.get('http://127.0.0.1:8000/api/user/routine', { withCredentials: true });
        setRoutineData(routineResponse.data);

        // Fetch download data
        const downloadResponse = await axios.get('http://127.0.0.1:8000/api/user/downloads', { withCredentials: true });
        setDownloadData(downloadResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch user data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Information</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Routine Data</h2>
        {routineData ? (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(routineData, null, 2)}
          </pre>
        ) : (
          <p>Loading routine data...</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Download Data</h2>
        {downloadData ? (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(downloadData, null, 2)}
          </pre>
        ) : (
          <p>Loading download data...</p>
        )}
      </div>
    </div>
  );
};

export default User_info;