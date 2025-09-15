import React from 'react';
import { useAuth } from '../context/auth.context';

const UserModal = ({ showModal, editingUser, formData, setFormData, onSubmit, onClose }) => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';
    
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 lg:p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                    {editingUser ? 'Edit User' : 'Create User'}
                </h3>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username:</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    )}

                    {/* Role Selection - For Admin */}
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role:</label>
                            <select
                                value={formData.role || 'user'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="user">👤 User</option>
                                <option value="admin">👑 Admin</option>
                            </select>
                        </div>
                    )}

                    {/* User Status - For Admin */}
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status:</label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.isActive === true}
                                        onChange={() => setFormData({ ...formData, isActive: true })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.isActive === false}
                                        onChange={() => setFormData({ ...formData, isActive: false })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Inactive</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    {isAdmin && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone:</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;