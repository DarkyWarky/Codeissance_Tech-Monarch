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
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="text-white text-2xl font-semibold p-8 bg-white bg-opacity-20 rounded-lg shadow-lg">
          Please log in to view and manage aliases.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-white mb-12">Alias Management</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((userData) => (
            <div key={userData.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="px-6 py-4 bg-indigo-100">
                <div className="font-bold text-xl mb-2 text-indigo-800">{userData.username || 'N/A'}</div>
                <p className="text-gray-600 mb-4">{userData.email || 'N/A'}</p>
                <p className="text-gray-600 mb-4">{userData.alias || 'None'}</p>
                <p className="text-gray-600 mb-4">{userData.responders && userData.responders.join(', ') || 'N/A'}</p>
                <p className="text-gray-600 mb-4">{userData.credentialRequest && userData.credentialRequest.status || 'N/A'}</p>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AliasManagement;