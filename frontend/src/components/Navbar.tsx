import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Get initials for the avatar
  const getInitials = () => {
    if (!user?.username) return '?';
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center space-x-2 transition-transform hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>File Sharing Platform</span>
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center p-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <div className="text-sm font-medium">
                <span className="opacity-80">Hello,</span> {user?.username}
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-9 w-9 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm shadow-md">
                  {getInitials()}
                </div>
                <button
                  onClick={logout}
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-transparent border border-white text-white px-4 py-1.5 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 py-3 px-4 transition-all">
          <div className="flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center py-2">
                  <div className="h-8 w-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                    {getInitials()}
                  </div>
                  <div className="text-sm">{user?.username}</div>
                </div>
                <div className="flex items-center py-2">
                  <span className="text-sm mr-3">Toggle theme:</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={logout}
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-all w-full text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center py-2">
                  <span className="text-sm mr-3">Toggle theme:</span>
                  <ThemeToggle />
                </div>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition-all w-full text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent border border-white text-white px-4 py-1.5 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors w-full text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 