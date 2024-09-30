import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './Home';
import Transparency from './Transparency';

const container = document.getElementById('root'); // Select the root element
const root = createRoot(container); // Create a root

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path='/transparency' element={<Transparency />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
