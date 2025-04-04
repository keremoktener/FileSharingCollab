import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 dark:focus:ring-blue-700"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#e0e7ff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
      aria-checked={isDark}
      role="switch"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track */}
      <span 
        className="absolute inset-0 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        {/* Day/night gradient background */}
        <span 
          className={`absolute inset-0 rounded-full transition-opacity duration-500 ease-in-out ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'linear-gradient(to right, #0f172a, #334155)'
          }}
        />
      </span>

      {/* Thumb */}
      <span 
        className={`
          pointer-events-none absolute left-1 flex h-6 w-6 items-center justify-center rounded-full 
          shadow-sm transform transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-6 bg-indigo-700' : 'translate-x-0 bg-white'}
        `}
      >
        {/* Moon icon */}
        <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3.5 w-3.5 text-indigo-100" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </span>
        
        {/* Sun icon */}
        <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3.5 w-3.5 text-amber-500" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle; 