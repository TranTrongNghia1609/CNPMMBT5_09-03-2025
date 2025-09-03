import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/context/auth.context';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="w-full">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
                <div className="w-full px-6 lg:px-12 xl:px-16 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                                Welcome to{' '}
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                    MyApp
                                </span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                                A modern user management system built with React, Node.js, and MongoDB. 
                                Experience seamless authentication and powerful user controls.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {!isAuthenticated ? (
                                    <>
                                        <Link 
                                            to="/register"
                                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Get Started
                                        </Link>
                                        <Link 
                                            to="/login"
                                            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                ) : (
                                    <Link 
                                        to="/user"
                                        className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Manage Users
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="lg:justify-self-end">
                            <div className="relative">
                                <div className="w-96 h-96 lg:w-[500px] lg:h-[500px] bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                                    <div className="text-center space-y-6">
                                        <div className="w-32 h-32 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold">User Management</h3>
                                        <p className="text-blue-100">Powerful tools for modern applications</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="w-full px-6 lg:px-12 xl:px-16 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Powerful Features
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need to manage users efficiently and securely
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Authentication</h3>
                        <p className="text-gray-600 leading-relaxed">
                            JWT-based authentication with refresh tokens, password hashing, and secure session management.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">User Management</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Complete CRUD operations for users with role-based access control and permission management.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">High Performance</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Optimized for speed with MongoDB, efficient pagination, and responsive design for all devices.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Configuration</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Simple setup with environment variables, Docker support, and comprehensive documentation.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Reports</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Built-in analytics dashboard with user statistics, activity tracking, and detailed reports.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">API Integration</h3>
                        <p className="text-gray-600 leading-relaxed">
                            RESTful API with comprehensive documentation, rate limiting, and third-party integrations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            {isAuthenticated && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <div className="w-full px-6 lg:px-12 xl:px-16 py-16">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Welcome back, {user?.username}!</h2>
                            <p className="text-xl text-gray-300">Here's your dashboard overview</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400 mb-2">150+</div>
                                <div className="text-gray-300">Total Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
                                <div className="text-gray-300">System Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                                <div className="text-gray-300">Support Available</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-400 mb-2">5★</div>
                                <div className="text-gray-300">User Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="w-full px-6 lg:px-12 xl:px-16 py-20">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 lg:p-16 text-center text-white">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of developers who trust our platform for their user management needs.
                    </p>
                    {!isAuthenticated && (
                        <Link 
                            to="/register"
                            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Start Free Trial
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;