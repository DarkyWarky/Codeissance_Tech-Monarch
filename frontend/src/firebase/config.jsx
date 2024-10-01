import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBZv9IhZuLQT20d4s6KLqCHFHitYFIhfVg",
  authDomain: "digital-footprint-dfce4.firebaseapp.com",
  projectId: "digital-footprint-dfce4",
  storageBucket: "digital-footprint-dfce4.appspot.com",
  messagingSenderId: "528801682327",
  appId: "1:528801682327:web:44cf5c50c18317cc6aaad2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, functions };
