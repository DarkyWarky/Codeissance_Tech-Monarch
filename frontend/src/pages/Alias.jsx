import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';

function AliasManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const { isAuthenticated, checkAuthStatus } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUserProfile();
      fetchAllUsers();
    }
  }, [isAuthenticated]);

  const fetchCurrentUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user/profile', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserProfile(data);
      } else if (response.status === 401) {
        console.log('User not authenticated, rechecking auth status');
        await checkAuthStatus();
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const addUserAsAlias = async (aliasGoogleId, aliasEmail) => {
    if (!currentUserProfile || !aliasGoogleId || !aliasEmail) return;

    try {
      const currentUserRef = doc(db, 'users', currentUserProfile.fullUser.googleId);
      const aliasUserRef = doc(db, 'users', aliasGoogleId);

      // Add alias to current user's document
      await updateDoc(currentUserRef, {
        alias: aliasEmail
      });

      // Add current user as responder to alias's document
      await updateDoc(aliasUserRef, {
        responders: arrayUnion(currentUserProfile.fullUser.email)
      });

      alert(`Added ${aliasEmail} as an alias successfully!`);
      fetchAllUsers(); // Refresh the list to show updated data
    } catch (error) {
      console.error('Error adding user as alias:', error);
      alert('An error occurred while adding the alias. Please try again.');
    }
  };

  const requestCredentials = async (aliasGoogleId) => {
    if (!currentUserProfile) return;

    try {
      const aliasUserRef = doc(db, 'users', aliasGoogleId);
      
      await updateDoc(aliasUserRef, {
        credentialRequest: {
          requestedBy: currentUserProfile.fullUser.email,
          requestedAt: Timestamp.now(),
          status: 'pending'
        }
      });

      alert('Credential request sent successfully. It will be automatically granted in 2 days if not rejected.');
      fetchAllUsers(); // Refresh the list to show updated data
    } catch (error) {
      console.error('Error requesting credentials:', error);
      alert('An error occurred while requesting credentials. Please try again.');
    }
  };

  const rejectCredentialRequest = async (aliasGoogleId) => {
    try {
      const aliasUserRef = doc(db, 'users', aliasGoogleId);
      
      await updateDoc(aliasUserRef, {
        credentialRequest: {
          status: 'rejected'
        }
      });

      alert('Credential request rejected successfully.');
      fetchAllUsers(); // Refresh the list to show updated data
    } catch (error) {
      console.error('Error rejecting credential request:', error);
      alert('An error occurred while rejecting the credential request. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view and manage aliases.</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-violet-600 to-indigo-700 min-h-screen">
      <h2 className="text-4xl font-heading font-bold  mb-6 text-center text-white">All Users</h2>
      <ul className="space-y-4">
        {allUsers.map((userData) => (
          <li key={userData.id} className="mb-4 p-6 border bg-gradient-to-br from-purple-100 to-indigo-200 rounded-lg shadow-md text-indigo-900 hover:from-purple-200 hover:to-indigo-300 transition-all duration-300">
            <p className="font-semibold"><strong>User ID:</strong> {userData.id}</p>
            <p><strong>Email:</strong> {userData.email || 'N/A'}</p>
            <p><strong>Username:</strong> {userData.username || 'N/A'}</p>
            <p><strong>Alias:</strong> {userData.alias || 'None'}</p>
            <p><strong>Responders:</strong></p>
            <ul className="ml-4 text-indigo-800">
              {userData.responders && userData.responders.map((responder, index) => (
                <li key={index} className="mb-1">{responder}</li>
              ))}
            </ul>
            {userData.credentialRequest && (
              <p><strong>Credential Request:</strong> {userData.credentialRequest.status}</p>
            )}
            <div className="mt-4 space-x-2">
              {userData.email && userData.id !== currentUserProfile?.fullUser.googleId && (
                <button
                  onClick={() => addUserAsAlias(userData.id, userData.email)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Add as Alias
                </button>
              )}
              {userData.responders && userData.responders.includes(currentUserProfile?.fullUser.email) && !userData.credentialRequest && (
                <button
                  onClick={() => requestCredentials(userData.id)}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Request Credentials
                </button>
)}
{userData.credentialRequest && userData.credentialRequest.status === 'pending' && (
  <button
    onClick={() => rejectCredentialRequest(userData.id)}
    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
  >
    Reject Credential Request
  </button>
)}
</div>
</li>
))}
</ul>
</div>
);
}

export default AliasManagement;