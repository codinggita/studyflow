import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20 -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-10 -z-10 pointer-events-none"></div>
        
        <Outlet />
      </main>
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm mt-auto border-t dark:border-dark-border">
        &copy; {new Date().getFullYear()} StudyFlow. Smart Study Planner.
      </footer>
    </div>
  );
};

export default Layout;
