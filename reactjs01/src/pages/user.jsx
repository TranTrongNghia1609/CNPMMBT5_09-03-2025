import React, { useState, useEffect } from 'react';
import { getAllUsersAPI, deleteUserAPI, createUserAPI, updateUserAPI, searchUsersAPI, getUserSuggestionsAPI, filterUsersAPI } from '../components/util/api';
import { useAuth } from '../components/context/auth.context';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Search & Filter States
    const [searchParams, setSearchParams] = useState({
        search: '',
        username: '',
        email: '',
        createdFrom: '',
        createdTo: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionField, setSuggestionField] = useState('');

    const { user: currentUser, isAuthenticated } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, searchParams, activeFilter]);

    // Debounce search để tránh gọi API quá nhiều
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchParams.search || searchParams.username || searchParams.email) {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchParams.search, searchParams.username, searchParams.email]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let response;

            if (activeFilter) {
                // Sử dụng preset filter
                response = await filterUsersAPI(activeFilter, {
                    page: pagination.page,
                    limit: pagination.limit
                });
            } else if (hasSearchParams()) {
                // Sử dụng search API
                response = await searchUsersAPI({
                    ...searchParams,
                    page: pagination.page,
                    limit: pagination.limit
                });
            } else {
                // Lấy tất cả users
                response = await getAllUsersAPI({
                    page: pagination.page,
                    limit: pagination.limit
                });
            }

            if (response.data.users || response.data.data) {
                const userData = response.data.users || response.data.data;
                const paginationData = response.data.pagination;
                
                setUsers(userData);
                setPagination(prev => ({
                    ...prev,
                    total: paginationData?.totalUsers || response.data.total || userData.length,
                    totalPages: paginationData?.totalPages || response.data.totalPages || Math.ceil(userData.length / pagination.limit)
                }));
            } else {
                setUsers(response.data);
            }
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasSearchParams = () => {
        return Object.values(searchParams).some(value => 
            value && value !== 'createdAt' && value !== 'desc'
        );
    };

    const handleSearchChange = (field, value) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Reset pagination when searching
        setPagination(prev => ({ ...prev, page: 1 }));
        
        // Clear active filter when searching
        if (activeFilter) {
            setActiveFilter(null);
        }
    };

    const handleSuggestions = async (field, query) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const response = await getUserSuggestionsAPI(field, query, 5);
            setSuggestions(response.data.data || []);
            setSuggestionField(field);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setSearchParams(prev => ({
            ...prev,
            [suggestionField]: suggestion
        }));
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleFilterClick = (filterType) => {
        setActiveFilter(filterType);
        setSearchParams({
            search: '',
            username: '',
            email: '',
            createdFrom: '',
            createdTo: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setActiveFilter(null);
        setSearchParams({
            search: '',
            username: '',
            email: '',
            createdFrom: '',
            createdTo: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await deleteUserAPI(userId);
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: ''
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await updateUserAPI(editingUser._id, {
                    username: formData.username,
                    email: formData.email
                });
            } else {
                await createUserAPI(formData);
            }
            
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const canEditUser = (user) => {
        return isAuthenticated && currentUser && currentUser._id === user._id;
    };

    const FilterButton = ({ type, label, icon, isActive, onClick }) => (
        <button
            onClick={() => onClick(type)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div className="w-full bg-gray-50 min-h-screen">
            <div className="w-full px-6 lg:px-12 xl:px-16 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
                            <p className="text-xl text-gray-600">Manage users, search and filter data</p>
                        </div>
                        {isAuthenticated && (
                            <button 
                                onClick={handleCreate}
                                className="mt-6 lg:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add User
                            </button>
                        )}
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    {/* Quick Filters */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
                        <div className="flex flex-wrap gap-3">
                            <FilterButton
                                type="recent"
                                label="Recent Users"
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                isActive={activeFilter === 'recent'}
                                onClick={handleFilterClick}
                            />
                            <FilterButton
                                type="today"
                                label="Today"
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                isActive={activeFilter === 'today'}
                                onClick={handleFilterClick}
                            />
                            <FilterButton
                                type="thisweek"
                                label="This Week"
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                isActive={activeFilter === 'thisweek'}
                                onClick={handleFilterClick}
                            />
                            <FilterButton
                                type="thismonth"
                                label="This Month"
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                isActive={activeFilter === 'thismonth'}
                                onClick={handleFilterClick}
                            />
                            
                            {(activeFilter || hasSearchParams()) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center px-4 py-2 rounded-lg font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Form */}
                    <div className="border-t pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                            {/* Global Search */}
                            <div className="flex-1 relative">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search users by username or email..."
                                        value={searchParams.search}
                                        onChange={(e) => handleSearchChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Advanced Search Toggle */}
                            <button
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                Advanced Search
                                <svg className={`w-4 h-4 ml-2 transform transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Advanced Search Form */}
                        {showAdvancedSearch && (
                            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Username Search with Suggestions */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                        <input
                                            type="text"
                                            placeholder="Search by username..."
                                            value={searchParams.username}
                                            onChange={(e) => {
                                                handleSearchChange('username', e.target.value);
                                                handleSuggestions('username', e.target.value);
                                            }}
                                            onFocus={() => {
                                                if (searchParams.username.length >= 2) {
                                                    handleSuggestions('username', searchParams.username);
                                                }
                                            }}
                                            onBlur={() => {
                                                setTimeout(() => setShowSuggestions(false), 200);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                        
                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestionField === 'username' && suggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSuggestionSelect(suggestion)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Search with Suggestions */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="text"
                                            placeholder="Search by email..."
                                            value={searchParams.email}
                                            onChange={(e) => {
                                                handleSearchChange('email', e.target.value);
                                                handleSuggestions('email', e.target.value);
                                            }}
                                            onFocus={() => {
                                                if (searchParams.email.length >= 2) {
                                                    handleSuggestions('email', searchParams.email);
                                                }
                                            }}
                                            onBlur={() => {
                                                setTimeout(() => setShowSuggestions(false), 200);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                        
                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestionField === 'email' && suggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSuggestionSelect(suggestion)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={searchParams.sortBy}
                                            onChange={(e) => handleSearchChange('sortBy', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="createdAt">Created Date</option>
                                            <option value="username">Username</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </div>

                                    {/* Sort Order */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                        <select
                                            value={searchParams.sortOrder}
                                            onChange={(e) => handleSearchChange('sortOrder', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="desc">Newest First</option>
                                            <option value="asc">Oldest First</option>
                                        </select>
                                    </div>

                                    {/* Date From */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Created From</label>
                                        <input
                                            type="date"
                                            value={searchParams.createdFrom}
                                            onChange={(e) => handleSearchChange('createdFrom', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Date To */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Created To</label>
                                        <input
                                            type="date"
                                            value={searchParams.createdTo}
                                            onChange={(e) => handleSearchChange('createdTo', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 rounded-lg">
                        <div className="flex">
                            <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 text-lg">{error}</span>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                {(activeFilter || hasSearchParams()) && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <span className="text-blue-700">
                                {activeFilter 
                                    ? `Showing ${activeFilter} users`
                                    : `Search results for "${searchParams.search || searchParams.username || searchParams.email}"`
                                }
                                {pagination.total > 0 && ` - ${pagination.total} result(s) found`}
                            </span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-xl text-gray-600">Loading users...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        {isAuthenticated && (
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAuthenticated ? 5 : 4} className="px-6 py-12 text-center">
                                                <div className="text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-lg font-medium">No users found</p>
                                                    <p className="text-sm">Try adjusting your search criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-lg">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-lg font-semibold text-gray-900">{user.username}</div>
                                                            <div className="text-sm text-gray-500">ID: {user._id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-lg text-gray-900">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-lg text-gray-900">
                                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(user.createdAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </td>
                                                {isAuthenticated && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {canEditUser(user) && (
                                                            <div className="flex justify-end space-x-3">
                                                                <button 
                                                                    onClick={() => handleEdit(user)}
                                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(user._id)}
                                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            disabled={pagination.page === 1}
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        
                                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </span>
                                        
                                        <button 
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal for Create/Edit */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingUser ? 'Edit User' : 'Create User'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username:</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password:</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                )}
                                
                                <div className="flex space-x-4 pt-4">
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200"
                                    >
                                        {editingUser ? 'Update' : 'Create'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPage;