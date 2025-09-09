import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth.context';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            {/* Match the same container structure as UserPage */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                MyApp
                            </span>
                        </Link>
                    </div>
                    
                    <nav className="flex items-center space-x-4 lg:space-x-8">
                        <Link 
                            to="/" 
                            className="text-gray-700 hover:text-blue-600 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 hover:bg-blue-50"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/users" 
                            className="text-gray-700 hover:text-blue-600 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 hover:bg-blue-50"
                        >
                            Users
                        </Link>
                        
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3 lg:space-x-6">
                                <div className="flex items-center space-x-2 lg:space-x-3 bg-green-50 px-3 lg:px-4 py-2 rounded-lg">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold text-xs lg:text-sm">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex flex-col">
                                        <span className="text-xs lg:text-sm font-semibold text-gray-800">
                                            {user?.username}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {user?.email}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 lg:space-x-4">
                                <Link 
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 hover:bg-blue-50"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 lg:px-6 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;