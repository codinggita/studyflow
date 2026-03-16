import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, BookOpen, LayoutDashboard, Library, ListTodo } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-500">
                <BookOpen className="w-8 h-8" />
                <span>StudyFlow</span>
            </Link>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors"
                    aria-label="Toggle Theme"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {isAuthenticated ? (
                    <>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                <LayoutDashboard className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/subjects" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                <Library className="w-5 h-5" />
                                <span>Subjects</span>
                            </Link>
                            <Link to="/tasks" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                <ListTodo className="w-5 h-5" />
                                <span>Tasks</span>
                            </Link>
                        </div>
                        <div className="hidden md:block w-px h-6 bg-gray-300 dark:bg-dark-border mx-2"></div>
                        <span className="font-medium">Hi, {user?.name || 'Student'}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors ml-4"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="font-medium hover:text-primary-600 transition-colors">
                            Log in
                        </Link>
                        <Link to="/signup" className="btn-primary">
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
