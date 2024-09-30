import React from 'react';
import Nav from './components/Nav';

function App() {
  const handleLogin = () => {
    // Redirect to the backend to start Google OAuth login
    window.location.href = 'http://localhost:8000/auth/google';
  };

  return (
    <>
    <Nav />
    <div className="">
      <h1>Welcome to My App</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
    </>
  );
}

export default App;
