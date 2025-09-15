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
    changeUserRoleAPI
} from '../components/util/api';
import { useAuth } from '../components/context/auth.context';

// Import components
import UserFilters from '../components/user/UserFilters';
import UserSearch from '../components/user/UserSearch';
import UserTable from '../components/user/UserTable';
import UserModal from '../components/user/UserModal';
import Pagination from '../components/user/Pagination';

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

    const normalizeUser = (u) => ({
        _id: u._id || u.id || u.userId || '',
        username: u.username || u.userName || u.name || 'Unknown',
        email: u.email || u.mail || '',
        role: u.role || 'user',
        isActive: u.isActive !== false,
        createdAt: u.createdAt || u.created_at || u.dateCreated || new Date().toISOString()
    });
    // Fetch users function
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
            } else if (searchParams.search) {
                // Global search - sử dụng search API đơn giản
                response = await searchUsersAPI({
                    query: searchParams.search,
                    page: pagination.page,
                    limit: pagination.limit
                });
            } else if (searchParams.username || searchParams.email || searchParams.createdFrom || searchParams.createdTo) {
                // Advanced search - sử dụng advanced search API
                response = await advancedSearchUsersAPI({
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

            // Xử lý nhiều format response khác nhau
            let userData = [];
            if (response.data.users) {
                userData = response.data.users;
            } else if (response.data.data) {
                userData = response.data.data;
            } else if (Array.isArray(response.data)) {
                userData = response.data;
            } else {
                userData = [];
            }
            
            const normalizedUsers = Array.isArray(userData) ? userData.map(normalizeUser) : [];
            
            setUsers(normalizedUsers);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || normalizedUsers.length,
                totalPages: response.data.totalPages || Math.ceil((response.data.total || normalizedUsers.length) / prev.limit)
            }));
         } catch (error) {
            setError('Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect hooks
    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, activeFilter, isAuthenticated]);

    // Debounce search để tránh gọi API quá nhiều
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchParams.search || searchParams.username || searchParams.email) {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchParams.search, searchParams.username, searchParams.email]);

    // Helper functions
    const hasSearchParams = () => {
        return Object.values(searchParams).some(value =>
            value && value !== 'createdAt' && value !== 'desc'
        );
    };

    const canEditUser = (user) => {
        // Admin có thể edit tất cả user
        if (isAuthenticated && currentUser && currentUser.role === 'admin') {
            return true;
        }
        // User thường chỉ có thể edit chính mình
        return isAuthenticated && currentUser && currentUser._id === user._id;
    };

    // Search handlers
    const handleSearchChange = (field, value) => {
        if (field === 'triggerSearch') {
            // Kích hoạt tìm kiếm thủ công
            fetchUsers();
            return;
        }
        
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
            console.log("Raw suggestion response:", response.data);
            
            // Kiểm tra nhiều cấu trúc dữ liệu có thể
            let suggestionsData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    suggestionsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    suggestionsData = response.data.data;
                } else if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
                    suggestionsData = response.data.suggestions;
                }
            }
            
            console.log("Processed suggestions:", suggestionsData);
            setSuggestions(suggestionsData);
            setSuggestionField(field);
            setShowSuggestions(suggestionsData.length > 0);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionSelect = (field, suggestion) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: suggestion
        }));
        setShowSuggestions(false);
        setSuggestions([]);
        setSuggestionField('');
        // Gọi fetchUsers để cập nhật kết quả
        fetchUsers();
    };

    // Filter handlers
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

    // CRUD handlers
    const handleCreate = () => {
        setEditingUser(null);
        
        // Nếu là admin, cho phép tạo với đầy đủ thông tin
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
            // User thường chỉ có thể tạo với thông tin cơ bản
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
        
        // Nếu là admin, cho phép chỉnh sửa tất cả thông tin
        if (currentUser?.role === 'admin') {
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role || 'user',
                isActive: user.isActive !== false,
                phone: user.phone || '',
                password: '' // Không hiển thị password cũ
            });
        } else {
            // User thường chỉ có thể chỉnh sửa thông tin cơ bản
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
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingUser) {
                if (currentUser?.role === 'admin') {
                    // Nếu là admin, sử dụng API cập nhật đầy đủ
                    await updateUserByAdminAPI(editingUser._id, formData);
                } else {
                    // Nếu là user thường, chỉ cập nhật thông tin cơ bản
                    await updateUserAPI(editingUser._id, {
                        username: formData.username,
                        email: formData.email
                    });
                }
            } else {
                await createUserAPI(formData);
            }
            
            setShowModal(false);
            fetchUsers();
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
            fetchUsers();
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
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to change user role');
        }
    };

    // Pagination handler
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };
    

     return (
        // Remove bg-gray-50 min-h-screen since it's now in App.jsx
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

                    <UserSearch
                        searchParams={searchParams}
                        onSearchChange={handleSearchChange}
                        showAdvancedSearch={showAdvancedSearch}
                        setShowAdvancedSearch={setShowAdvancedSearch}
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        suggestionField={suggestionField}
                        onSuggestionSelect={handleSuggestionSelect}
                        onSuggestions={handleSuggestions}
                    />
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
                {(activeFilter || hasSearchParams()) && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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