import React, { useState, useEffect } from 'react';
import { auth, firestore, functions } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

function AliasManagement() {
  const [alias, setAlias] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [aliases, setAliases] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        fetchAliases(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAliases = async (userId) => {
    const q = query(collection(firestore, 'aliases'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    setAliases(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addAlias = async (e) => {
    e.preventDefault();
    if (!alias || !currentUser) return;

    try {
      await addDoc(collection(firestore, 'aliases'), {
        userId: currentUser.uid,
        aliasEmail: alias,
        status: 'pending',
        createdAt: new Date()
      });
      setAlias('');
      fetchAliases(currentUser.uid);
    } catch (error) {
      console.error('Error adding alias:', error);
    }
  };

  const requestAccess = async (aliasId) => {
    try {
      const sendAccessRequest = httpsCallable(functions, 'sendAccessRequest');
      await sendAccessRequest({ aliasId });
      alert('Access request sent successfully');
    } catch (error) {
      console.error('Error sending access request:', error);
    }
  };

  return (
    <div>
      <h2>Alias Management</h2>
      <form onSubmit={addAlias}>
        <input
          type="email"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Enter alias email"
        />
        <button type="submit">Add Alias</button>
      </form>
      <h3>Your Aliases:</h3>
      <ul>
        {aliases.map(alias => (
          <li key={alias.id}>
            {alias.aliasEmail} - Status: {alias.status}
            {alias.status === 'pending' && (
              <button onClick={() => requestAccess(alias.id)}>Request Access</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AliasManagement;
