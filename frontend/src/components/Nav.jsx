import React from 'react';
import { Home , Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8000/auth/google';
};

const NavItem = ({ icon: Icon, isActive, link }) => (
  <Link
    to={link}
    className={`p-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${
      isActive
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
        : 'text-gray-500 hover:text-violet-500 hover:bg-gray-100'
    }`}
  >
    <Icon size={24} />
  </Link>
);

const Nav = ({ isAuthenticated, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { id: 'home', icon: Home, link: '/home' },
  ];

  // Left links excluding 'Emails'
  const leftLinks = [
    { id: 'transparency', name: 'Transparency', link: '/transparency' },
    { id: 'faqs', name: 'FAQs', link: '/faqs' },
  ];

  // Conditionally add 'Emails' only if authenticated
  if (isAuthenticated) {
    leftLinks.push({ id: 'emails', name: 'Access', link: '/emails' },{id:'alias',name:"Posthumous",link:'/alias'},{id: 'extensions',name:"Extensions",link:'/extensions' },{id:'passwords',name:"Password Manager",link:'/password-manager'});
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md py-4 px-6 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          DigiPrints
        </Link>

        {/* Centered left links */}
        <div className="hidden sm:flex space-x-6">
          {leftLinks.map((link) => (
            <Link
              key={link.id}
              to={link.link}
              className={`text-gray-600 hover:text-violet-600 text-lg transition-colors duration-300 ${
                location.pathname === link.link ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right-side nav items */}
        <div className="flex space-x-4 items-center">
          {isAuthenticated && navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              isActive={location.pathname === item.link}
              link={item.link}
            />
          ))}

          {/* Login/Logout Button */}
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full px-5 py-2 transition-all duration-300 shadow-lg"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="bg-purple-700 hover:bg-indigo-500 text-white font-medium rounded-full px-5 py-2 transition-all duration-300 shadow-lg"
            >
              Login with Google
            </button>
          )}
        </div>
      </div>

      {/* Mobile Left Links */}
      <div className="flex sm:hidden justify-center mt-4 space-x-6">
        {leftLinks.map((link) => (
          <Link
            key={link.id}
            to={link.link}
            className={`text-gray-600 hover:text-violet-600 text-lg transition-colors duration-300 ${
              location.pathname === link.link ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Nav;