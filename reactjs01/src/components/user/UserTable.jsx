import React from 'react';
import { useAuth } from '../context/auth.context';

const UserTable = ({ users, isAuthenticated, canEditUser, onEdit, onDelete, onToggleStatus, onChangeRole }) => {
    console.log('UserTable received users:', users); // Debug log
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    if (!Array.isArray(users) || users.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-purple-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6a2 2 0 00-2 2v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3a2 2 0 00-2-2H4" />
                    </svg>
                    <h3 className="text-lg font-medium text-purple-900 mb-2">No users found</h3>
                    <p className="text-purple-600">Try adjusting your search or filter criteria</p>
                </div>
            </div>
        );
    }

    const getRoleBadge = (role) => {
        const isAdminRole = role === 'admin';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isAdminRole 
                    ? 'bg-purple-200 text-purple-900' 
                    : 'bg-lavender-100 text-purple-800'
            }`}>
                {isAdminRole ? '👑 Admin' : '👤 User'}
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return (
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive 
                    ? 'bg-green-200 text-green-900' 
                    : 'bg-red-200 text-red-900'
            }`}>
                {isActive ? '✅ Active' : '❌ Inactive'}
            </span>
        );
    };

    return (
        <div className="overflow-x-auto bg-gradient-to-br from-purple-50 to-lavender-50 rounded-lg">
            <table className="min-w-full divide-y divide-purple-200">
                <thead className="bg-gradient-to-r from-purple-100 to-lavender-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                            Created
                        </th>
                        {isAuthenticated && (
                            <th className="px-6 py-3 text-right text-xs font-medium text-purple-700 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purple-100">
                    {users.map((user, index) => (
                        <tr key={user._id} className={`transition-colors ${
                            index % 2 === 0 
                                ? 'bg-white hover:bg-purple-50' 
                                : 'bg-purple-25 hover:bg-purple-75'
                        } ${user.isActive === false ? 'opacity-60' : ''}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-lavender-500 flex items-center justify-center shadow-md">
                                            <span className="text-sm font-medium text-white">
                                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-purple-900">
                                            {user.username || 'Unknown'}
                                        </div>
                                        <div className="text-sm text-purple-600">
                                            ID: {user._id}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-purple-800">{user.email || 'No email'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(user.isActive !== false)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-purple-800">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                </div>
                            </td>
                            {isAuthenticated && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2 flex-wrap">
                                        {/* Admin Controls */}
                                        {isAdmin && user._id !== currentUser._id && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        if (isAdmin) {
                                                            onToggleStatus && onToggleStatus(user._id, !user.isActive);
                                                        }
                                                    }}
                                                    className={`inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md shadow-sm ${
                                                        user.isActive 
                                                            ? 'text-red-700 bg-red-100 hover:bg-red-200 border-red-200' 
                                                            : 'text-green-700 bg-green-100 hover:bg-green-200 border-green-200'
                                                    } transition-all duration-200 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!isAdmin ? 'Admin permission required' : (user.isActive ? 'Deactivate User' : 'Activate User')}
                                                    disabled={!isAdmin}
                                                >
                                                    {user.isActive ? '🚫' : '✅'}
                                                </button>
                                                
                                                <select
                                                    value={user.role || 'user'}
                                                    onChange={(e) => onChangeRole && onChangeRole(user._id, e.target.value)}
                                                    className="text-xs border border-purple-300 rounded-md px-2 py-1 bg-white text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-sm"
                                                    title="Change Role"
                                                >
                                                    <option value="user">👤 User</option>
                                                    <option value="admin">👑 Admin</option>
                                                </select>
                                            </>
                                        )}
                                        
                                        {/* Edit Button */}
                                        {canEditUser(user) && (
                                            <button
                                                onClick={() => onEdit(user)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-sm"
                                                title="Edit User"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                        )}
                                        
                                        {/* Delete Button */}
                                        {isAdmin && user._id !== currentUser._id && (
                                            <button
                                                onClick={() => onDelete(user._id)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                                                title="Delete User"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;