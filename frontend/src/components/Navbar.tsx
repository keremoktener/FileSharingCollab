import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold">
          File Sharing Platform
        </Link>
        
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">Hello, {user?.username}</span>
              <button
                onClick={logout}
                className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-transparent border border-white text-white px-4 py-1 rounded hover:bg-white hover:text-blue-600 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 