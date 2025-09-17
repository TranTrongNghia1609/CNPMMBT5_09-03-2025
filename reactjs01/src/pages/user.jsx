import React, { useState, useEffect } from 'react';
import { 
    getAllUsersAPI, 
    deleteUserAPI, 
    createUserAPI, 
    updateUserAPI, 
    updateUserByAdminAPI,
    searchUsersAPI, 
    getUserSuggestionsAPI, 
    filterUsersAPI,
    toggleUserStatusAPI,
    changeUserRoleAPI,
    advancedSearchUsersAPI
} from '../components/util/api';
import { useAuth } from '../components/context/auth.context';
import FuzzySearch from 'fuzzy-search';

// Import components
import UserFilters from '../components/user/UserFilters';
import UserSearch from '../components/user/UserSearch';
import UserTable from '../components/user/UserTable';
import UserModal from '../components/user/UserModal';
import Pagination from '../components/user/Pagination';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Store original users for fuzzy search
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
    const [activeFilter, setActiveFilter] = useState(null);
    const [useFuzzySearch, setUseFuzzySearch] = useState(false);
    const [fuzzyResults, setFuzzyResults] = useState([]);
    const { user: currentUser, isAuthenticated } = useAuth();
    const [query, setQuery] = useState("");

    const normalizeUser = (u) => ({
        _id: u._id || u.id || u.userId || '',
        username: u.username || u.userName || u.name || 'Unknown',
        email: u.email || u.mail || '',
        role: u.role || 'user',
        isActive: u.isActive !== false,
        createdAt: u.createdAt || u.created_at || u.dateCreated || new Date().toISOString()
    });

    // ✅ Hàm fetch users cơ bản
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsersAPI({
                page: pagination.page,
                limit: pagination.limit
            });

            let userData = [];
            if (response.data.users) {
                userData = response.data.users;
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total,
                    totalPages: response.data.totalPages
                }));
            } else {
                userData = response.data;
                setPagination(prev => ({
                    ...prev,
                    total: userData.length,
                    totalPages: Math.ceil(userData.length / prev.limit)
                }));
            }
            
            // Normalize users
            const normalizedUsers = userData.map(normalizeUser);
            setUsers(normalizedUsers);
            setAllUsers(normalizedUsers);
            
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Hàm filter riêng biệt
    const fetchFilteredUsers = async (filterType) => {
        setLoading(true);
        try {
            console.log('Fetching filtered users with filterType:', filterType);
            
            const response = await filterUsersAPI(filterType, {
                page: pagination.page,
                limit: pagination.limit
            });

            console.log('Filter API Response:', response);

            let userData = [];
            let totalCount = 0;
            let totalPages = 1;

            // Xử lý response structure từ filter API
            if (response.data.data) {
                userData = response.data.data;
                totalCount = response.data.pagination?.totalUsers || userData.length;
                totalPages = response.data.pagination?.totalPages || 1;
            } else if (response.data.users) {
                userData = response.data.users;
                totalCount = response.data.total || userData.length;
                totalPages = response.data.totalPages || 1;
            } else if (Array.isArray(response.data)) {
                userData = response.data;
                totalCount = userData.length;
                totalPages = 1;
            }

            const normalizedUsers = userData.map(normalizeUser);
            setUsers(normalizedUsers);
            setAllUsers(normalizedUsers); // Store for fuzzy search
            
            setPagination(prev => ({
                ...prev,
                total: totalCount,
                totalPages: totalPages
            }));

        } catch (error) {
            setError('Failed to fetch filtered users');
            console.error('Filter users error:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fuzzy Search Handler
    const handleFuzzySearch = (searchQuery) => {
        if (!searchQuery.trim()) {
            // Reset về tất cả users khi search empty
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
            setFuzzyResults([]);
            return;
        }

        const searcher = new FuzzySearch(allUsers, ["username", "email"], { 
            caseSensitive: false,
            sort: true
        });
        const results = searcher.search(searchQuery);
        
        setFuzzyResults(results);
        
        // Apply pagination to fuzzy results
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedResults = results.slice(startIndex, endIndex);
        
        setUsers(paginatedResults);
        setPagination(prev => ({
            ...prev,
            total: results.length,
            totalPages: Math.ceil(results.length / prev.limit)
        }));
    };

    // ✅ Search handler
    const handleSearchChange = (value) => {
        setQuery(value);
        
        if (useFuzzySearch) {
            handleFuzzySearch(value);
        } else {
            if (!value.trim()) {
                // Reset về data gốc
                if (activeFilter) {
                    fetchFilteredUsers(activeFilter);
                } else {
                    fetchUsers();
                }
            }
        }
        
        // Reset to page 1 when searching
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // ✅ Toggle Fuzzy Search
    const toggleFuzzySearch = () => {
        setUseFuzzySearch(prev => {
            const newValue = !prev;
            
            if (newValue && query) {
                // If enabling fuzzy search and there's a query, apply fuzzy search
                handleFuzzySearch(query);
            } else if (!newValue) {
                // If disabling fuzzy search, reset to original data
                if (activeFilter) {
                    fetchFilteredUsers(activeFilter);
                } else {
                    fetchUsers();
                }
                setFuzzyResults([]);
            }
            
            return newValue;
        });
    };

    // ✅ Filter handlers
    const handleFilterClick = (filterType) => {
        setActiveFilter(filterType);
        setQuery(''); // Clear fuzzy search
        setFuzzyResults([]);
        setPagination(prev => ({ ...prev, page: 1 }));
        
        // Fetch filtered data
        fetchFilteredUsers(filterType);
    };

    const clearFilters = () => {
        setActiveFilter(null);
        setQuery(''); // Clear fuzzy search
        setFuzzyResults([]);
        setPagination(prev => ({ ...prev, page: 1 }));
        
        // Fetch all users
        fetchUsers();
    };

    // ✅ useEffect hooks
    useEffect(() => {
        if (isAuthenticated) {
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Handle pagination
    useEffect(() => {
        if (useFuzzySearch && fuzzyResults.length > 0) {
            // Handle fuzzy search pagination
            const startIndex = (pagination.page - 1) * pagination.limit;
            const endIndex = startIndex + pagination.limit;
            const paginatedResults = fuzzyResults.slice(startIndex, endIndex);
            setUsers(paginatedResults);
        } else{
            // Handle regular pagination
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
        }
    }, [pagination.page, pagination.limit]);

    // Helper functions
    const hasSearchParams = () => {
        return query.trim() || activeFilter;
    };

    const canEditUser = (user) => {
        // Admin có thể edit tất cả user
        if (isAuthenticated && currentUser && currentUser.role === 'admin') {
            return true;
        }
        // User thường chỉ có thể edit chính mình
        return isAuthenticated && currentUser && currentUser._id === user._id;
    };

    // ✅ CRUD handlers - keeping existing code
    const handleCreate = () => {
        setEditingUser(null);
        
        if (currentUser?.role === 'admin') {
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'user',
                isActive: true,
                phone: ''
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: ''
            });
        }
        
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        
        if (currentUser?.role === 'admin') {
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isActive: user.isActive !== false,
                phone: user.phone || '',
                password: ''
            });
        } else {
            setFormData({
                username: user.username,
                email: user.email,
                password: ''
            });
        }
        
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await deleteUserAPI(userId);
            // Refresh current view
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingUser) {
                if (currentUser?.role === 'admin') {
                    await updateUserByAdminAPI(editingUser._id, formData);
                } else {
                    await updateUserAPI(editingUser._id, {
                        username: formData.username,
                        email: formData.email
                    });
                }
            } else {
                await createUserAPI(formData);
            }
            
            setShowModal(false);
            // Refresh current view
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
        } catch (error) {
            console.error('Submit error:', error);
            setError(error.response?.data?.message || 'Operation failed');
        }
    };

    // Admin Functions
    const handleToggleUserStatus = async (userId, newStatus) => {
        if (!isAuthenticated || currentUser?.role !== 'admin') {
            setError('You do not have permission to perform this action');
            return;
        }

        try {
            await toggleUserStatusAPI(userId, newStatus);
            // Refresh current view
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            setError(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleChangeUserRole = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        try {
            await changeUserRoleAPI(userId, newRole);
            // Refresh current view
            if (activeFilter) {
                fetchFilteredUsers(activeFilter);
            } else {
                fetchUsers();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to change user role');
        }
    };

    // Pagination handler
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="w-full">
            <div className="w-full px-6 lg:px-12 xl:px-16 py-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">User Management</h1>
                            <p className="text-lg lg:text-xl text-gray-600">Manage users, search and filter data</p>
                        </div>
                        {isAuthenticated && (
                            <button
                                onClick={handleCreate}
                                className="mt-6 lg:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 lg:px-8 py-3 rounded-xl font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                    <UserFilters
                        activeFilter={activeFilter}
                        onFilterClick={handleFilterClick}
                        hasSearchParams={hasSearchParams}
                        onClearFilters={clearFilters}
                    />

                    {/* Fuzzy Search Toggle */}
                    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useFuzzySearch}
                                    onChange={toggleFuzzySearch}
                                    className="sr-only"
                                />
                                <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                    useFuzzySearch ? 'bg-blue-600' : 'bg-gray-300'
                                }`}>
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                                        useFuzzySearch ? 'transform translate-x-6' : ''
                                    }`}></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Fuzzy Search
                                </span>
                            </label>
                            {useFuzzySearch && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Smart Search Enabled
                                </span>
                            )}
                        </div>
                        {useFuzzySearch && fuzzyResults.length > 0 && query && (
                            <span className="text-sm text-gray-600">
                                Fuzzy results: {fuzzyResults.length} matches
                            </span>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={useFuzzySearch ? "Tìm kiếm ..." : "Tìm kiếm..."}
                            value={query}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={`w-full text-black border rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                useFuzzySearch 
                                    ? 'focus:ring-blue-400 border-blue-300 bg-blue-50' 
                                    : 'focus:ring-gray-400 border-gray-300'
                            }`}
                        />
                        {useFuzzySearch && (
                            <div className="absolute right-3 top-3">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 lg:p-6 mb-8 rounded-lg">
                        <div className="flex">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 text-base lg:text-lg">{error}</span>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                {hasSearchParams() && (
                    <div className={`border-l-4 p-4 mb-6 rounded-lg ${
                        useFuzzySearch && fuzzyResults.length > 0 
                            ? 'bg-green-50 border-green-400' 
                            : 'bg-blue-50 border-blue-400'
                    }`}>
                        <div className="flex items-center">
                            <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${
                                useFuzzySearch && fuzzyResults.length > 0 
                                    ? 'text-green-400' 
                                    : 'text-blue-400'
                            }`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <span className={
                                useFuzzySearch && fuzzyResults.length > 0 
                                    ? 'text-green-700' 
                                    : 'text-blue-700'
                            }>
                                {useFuzzySearch && fuzzyResults.length > 0
                                    ? `Fuzzy search results for "${query}" - ${fuzzyResults.length} smart matches found`
                                    : activeFilter
                                        ? `Showing ${activeFilter} users - ${pagination.total} result(s) found`
                                        : query
                                            ? `Search results for "${query}" - ${pagination.total} result(s) found`
                                            : `${pagination.total} result(s) found`
                                }
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading or Table */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-xl text-gray-600">Loading users...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <UserTable
                            users={users}
                            isAuthenticated={isAuthenticated}
                            canEditUser={canEditUser}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleUserStatus}
                            onChangeRole={handleChangeUserRole}
                        />

                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                {/* Modal */}
                <UserModal
                    showModal={showModal}
                    editingUser={editingUser}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onClose={() => setShowModal(false)}
                />
            </div>
        </div>
    );
};

export default UserPage;