import React from 'react';

const UserSearch = ({ 
    searchParams, 
    onSearchChange, 
    showAdvancedSearch, 
    setShowAdvancedSearch,
    suggestions,
    showSuggestions,
    suggestionField,
    onSuggestionSelect,
    onSuggestions
}) => {
    return (
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
                            onChange={(e) => onSearchChange('search', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Advanced Search Toggle */}
                <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Username Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                placeholder="Search by username..."
                                value={searchParams.username}
                                onChange={(e) => {
                                    onSearchChange('username', e.target.value);
                                    onSuggestions('username', e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        {/* Email Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchParams.email}
                                onChange={(e) => {
                                    onSearchChange('email', e.target.value);
                                    onSuggestions('email', e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select
                                value={searchParams.sortBy}
                                onChange={(e) => onSearchChange('sortBy', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="createdAt">Created Date</option>
                                <option value="username">Username</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserSearch;