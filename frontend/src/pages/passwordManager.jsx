import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as jose from 'jose';

const PasswordManager = () => {
  const { isLoading, isAuthenticated, checkAuthStatus } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordData, setPasswordData] = useState({});
  const [otpSecret, setOtpSecret] = useState(null);
  const [otp, setOtp] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [showQRCode, setShowQRCode] = useState(false);

  const fetchPasswordsFromServer = useCallback(async (googleId) => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/user/password-data', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Raw password data from server:', data);
          
          // Ensure data is in the correct format
          const formattedData = {};
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.domain && item.password) {
                formattedData[item.domain] = item.password;
              }
            });
          } else if (typeof data === 'object') {
            Object.entries(data).forEach(([key, value]) => {
              if (value.domain && value.password) {
                formattedData[value.domain] = value.password;
              } else if (typeof value === 'string') {
                formattedData[key] = value;
              }
            });
          }
          
          console.log('Formatted password data:', formattedData);
          
          // Update the local state with the new password data
          setPasswordData(formattedData);
          
          // Encrypt and store passwords in Firebase
          encryptAndStorePasswords(googleId, formattedData);
        } else {
          console.error('Failed to fetch passwords from server');
        }
      } catch (error) {
        console.error('Error fetching passwords from server:', error);
      }

      // Schedule the next fetch after 60 seconds (1 minute)
      setTimeout(fetchData, 60000);
    };

    // Start the initial fetch
    fetchData();

    // Return a cleanup function to clear the timeout when the component unmounts
    return () => clearTimeout(fetchData);
  }, []);

  const encryptAndStorePasswords = async (googleId, passwords) => {
    const encryptedPasswords = {};
    const encoder = new TextEncoder();
    const secretKey = encoder.encode('your-secret-key');

    for (const [domain, password] of Object.entries(passwords)) {
      const jwt = await new jose.SignJWT({ password, domain })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secretKey);
      encryptedPasswords[domain] = jwt;
    }

      try {
        const userRef = doc(db, 'users', googleId);
        await setDoc(userRef, { passwords: encryptedPasswords }, { merge: true });
        console.log('Encrypted passwords stored in Firestore:', encryptedPasswords);
      } catch (error) {
        console.error('Error storing encrypted passwords in Firestore:', error);
      }

  };

  const fetchPasswordsFromFirestore = async (googleId) => {
    try {
      const userRef = doc(db, 'users', googleId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.passwords) {
          console.log('Passwords fetched from Firestore:', userData.passwords);
          setPasswordData(userData.passwords);
        } else {
          console.log('No passwords found for this user');
          setPasswordData({});
        }
      } else {
        console.log('User document not found');
        setPasswordData({});
      }
    } catch (error) {
      console.error('Error fetching passwords from Firestore:', error);
      setPasswordData({});
    }
  };

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
          
          if (data.fullUser && data.fullUser.googleId) {
            console.log('Google ID:', data.fullUser.googleId);
            await fetchPasswordsFromServer(data.fullUser.googleId);
            if (!otpSecret) {
              generateOTPSecret(data.fullUser.googleId);
            }
          }
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

      // Schedule the next fetch after 5 seconds (5000 milliseconds)
      setTimeout(fetchProfile, 5000);
    };

    if (isAuthenticated) {
      fetchProfile();
    }

    // Cleanup function to clear the timeout when the component unmounts
    return () => clearTimeout(fetchProfile);
  }, [isAuthenticated, checkAuthStatus, fetchPasswordsFromServer, otpSecret]);

  const generateOTPSecret = (googleId) => {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const secret = base32Encode(bytes);
    setOtpSecret(secret);
  };

  const base32Encode = (buffer) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }
    return result;
  };

  const generateTOTP = async (secret, time = Date.now()) => {
    const timeStep = 30;
    const t = Math.floor(time / 1000 / timeStep);
    const msg = new ArrayBuffer(8);
    const view = new DataView(msg);
    view.setBigUint64(0, BigInt(t), false);
    
    const key = await crypto.subtle.importKey(
      'raw',
      base32Decode(secret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, msg);
    const dataView = new DataView(signature);
    const offset = dataView.getUint8(19) & 0xf;
    const otp = dataView.getUint32(offset) & 0x7fffffff;
    return (otp % 1000000).toString().padStart(6, '0');
  };

  const base32Decode = (input) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = new Uint8Array(Math.ceil(input.length * 5 / 8));
    
    for (let i = 0; i < input.length; i++) {
      value = (value << 5) | alphabet.indexOf(input[i]);
      bits += 5;
      if (bits >= 8) {
        output[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }
    
    return output;
  };

  const handleRevealPassword = async (domain) => {
    if (otpSecret) {
      const generatedOTP = await generateTOTP(otpSecret);
      if (otp === generatedOTP) {
        try {
          const encoder = new TextEncoder();
          const secretKey = encoder.encode('your-secret-key');
          const { payload } = await jose.jwtVerify(passwordData[domain], secretKey);
          console.log('Decrypted payload:', payload);
          setRevealedPasswords(prev => ({ ...prev, [domain]: payload.password }));
        } catch (error) {
          console.error('Error decoding password:', error);
          alert('Failed to reveal password. Please try again.');
        }
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } else {
      alert('OTP not initialized. Please refresh the page.');
    }
  };

  const handleHidePassword = (domain) => {
    setRevealedPasswords(prev => {
      const newState = { ...prev };
      delete newState[domain];
      return newState;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-5xl font-heading font-bold mb-8 text-center text-purple-600">Password Manager</h1>
      {isAuthenticated ? (
        profile ? (
          <div className="space-y-8">
            {otpSecret && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Two-Factor Authentication Setup</h2>
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out"
                >
                  {showQRCode ? 'Hide' : 'Show'} QR Code
                </button>
                {showQRCode && (
                  <div className="mt-4 flex justify-center">
                    <QRCodeSVG value={`otpauth://totp/PasswordManager:${profile.fullUser.googleId}?secret=${otpSecret}&issuer=PasswordManager`} />
                  </div>
                )}
              </div>
            )}
            {Object.keys(passwordData).length > 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Stored Passwords</h2>
                <div className="space-y-6">
                  {Object.entries(passwordData).map(([domain, encryptedPassword]) => (
                    <div key={domain} className="border-b pb-4 last:border-b-0">
                      <p className="text-lg font-medium text-gray-800 mb-2">{domain}</p>
                      <p className="mb-3">
                        <span className="font-semibold">Password:</span> 
                        <span className="ml-2 font-mono">{revealedPasswords[domain] || '••••••••'}</span>
                      </p>
                      {revealedPasswords[domain] ? (
                        <button
                          onClick={() => handleHidePassword(domain)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm transition duration-300 ease-in-out mr-2"
                        >
                          Hide Password
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevealPassword(domain)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm transition duration-300 ease-in-out mr-2"
                        >
                          Reveal Password
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
                <p className="font-medium">No passwords stored. Generate a password using the extension first.</p>
              </div>
            )}
          </div>
        ) : profileError ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-medium">{profileError}</p>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )
      ) : (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">
          <p className="text-lg font-medium">Please log in to use the password manager.</p>
        </div>
      )}
    </div>
  );
}

export default PasswordManager;