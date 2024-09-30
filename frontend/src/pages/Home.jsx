import React from 'react';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to Home</h1>
      {/* Add your home page content here */}
    </div>
  );
};

export default Home;