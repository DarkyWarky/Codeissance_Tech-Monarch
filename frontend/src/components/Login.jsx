import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from '../Landing';

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status when the component mounts
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/profile', {
        credentials: 'include'
      });
      if (response.ok) {
        setIsAuthenticated(true);
        navigate('/home');
      }
      else{
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  return (
    <Landing />
    
  );
}

export default Login;
