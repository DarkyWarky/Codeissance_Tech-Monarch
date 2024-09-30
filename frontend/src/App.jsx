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
    <div className=" flex items-center justify-center h-screen w-full text-cyan-700">
      <h1>Welcome to My App</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
    </>
  );
}

export default App;
