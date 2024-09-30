import React, { useState } from 'react';
import { Home, Search, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

const NavItem = ({ icon: Icon, isActive, onClick, link }) => (
  <Link to={link}> {/* Wrap button in Link */}
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-all duration-300 ease-in-out ${
        isActive
          ? 'bg-violet-500 text-white'
          : 'text-gray-600 hover:bg-blue-100'
      }`}
    >
      <Icon size={20} />
    </button>
  </Link>
);

const AnimatedNavbar = () => {
  const [activeItem, setActiveItem] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, link: '/' },
    { id: 'search', icon: Search, link: '/search' },
    { id: 'notifications', icon: Bell, link: '/notifications' },
    { id: 'settings', icon: Settings, link: '/settings' },
  ];

  // New left-side links
  const leftLinks = [
    { id: 'transparency', name: 'Transparency', link: '/transparency' },
    { id: 'faqs', name: 'FAQs', link: '/faqs' },
  ];

  return (
    <nav className="bg-white shadow-md py-2 px-4 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Logo on the left */}
        <div className="text-xl font-bold text-violet-500">Logo</div>

        {/* Centered left links */}
        <div className="flex-grow flex justify-center space-x-4"> {/* Centering the left links */}
          {leftLinks.map((link) => (
            <Link key={link.id} to={link.link} className="text-gray-600 hover:text-blue-500">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right-side nav items and Sign Up/Login button */}
        <div className="flex space-x-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              isActive={activeItem === item.id}
              onClick={() => setActiveItem(item.id)} // Update active item on click
              link={item.link} // Pass the link prop
            />
          ))}

          {/* Sign Up/Login Button */}
          <Link to="/login" className="border text-sm font-medium bg-blue-100 text-black border-gray-300 rounded-full px-4 py-2 hover:bg-blue-300 transition duration-300 ease-in-out">
            Sign Up/Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AnimatedNavbar;
