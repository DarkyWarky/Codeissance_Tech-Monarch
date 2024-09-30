import React from 'react';

function App() {
  const handleLogin = () => {
    // Redirect to the backend to start Google OAuth login
    window.location.href = 'http://localhost:8000/auth/google';
  };

  return (
    <div className="App">
      <h1>Welcome to My App</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}

export default App;
