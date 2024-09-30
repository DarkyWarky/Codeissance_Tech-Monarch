import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const Home = () => {
  const { isLoading, isAuthenticated, checkAuthStatus } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user/profile', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setProfileError(null);
          
          // Store user information in Firestore
          await storeUserInFirestore(data);
        } else if (response.status === 401) {
          console.log('User not authenticated, rechecking auth status');
          await checkAuthStatus();
          setProfileError('Authentication failed. Please try logging in again.');
        } else {
          setProfileError('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileError(`Error fetching profile: ${error.message}`);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, checkAuthStatus]);

  const storeUserInFirestore = async (userData) => {
    try {
      const { fullUser } = userData;
      const userRef = doc(db, 'users', fullUser.googleId);
      await setDoc(userRef, {
        email: fullUser.email,
        username: fullUser.displayName,
      }, { merge: true });
      console.log('User information stored in Firestore');
    } catch (error) {
      console.error('Error storing user information in Firestore:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Home</h1>
      {isAuthenticated ? (
        profile ? (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
            <p className="mb-2"><strong>Username:</strong> {profile.username || 'N/A'}</p>
            <p className="mb-2"><strong>Email:</strong> {profile.email || 'N/A'}</p>
            <p className="mb-2"><strong>Access Token:</strong> {profile.accessToken ? 'Present' : 'Not available'}</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Raw Profile Data:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        ) : profileError ? (
          <p className="text-red-500">{profileError}</p>
        ) : (
          <p>Loading profile...</p>
        )
      ) : (
        <p className="text-lg">Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default Home;