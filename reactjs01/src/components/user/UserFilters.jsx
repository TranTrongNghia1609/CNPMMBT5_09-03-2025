import React from 'react';

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

const UserFilters = ({ activeFilter, onFilterClick, hasSearchParams, onClearFilters }) => {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
            <div className="flex flex-wrap gap-3">
                <FilterButton
                    type="recent"
                    label="Recent Users"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    isActive={activeFilter === 'recent'}
                    onClick={onFilterClick}
                />
                <FilterButton
                    type="today"
                    label="Today"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    isActive={activeFilter === 'today'}
                    onClick={onFilterClick}
                />
                <FilterButton
                    type="thisweek"
                    label="This Week"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    isActive={activeFilter === 'thisweek'}
                    onClick={onFilterClick}
                />
                <FilterButton
                    type="thismonth"
                    label="This Month"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    isActive={activeFilter === 'thismonth'}
                    onClick={onFilterClick}
                />
                
                {(activeFilter || hasSearchParams()) && (
                    <button
                        onClick={onClearFilters}
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
    );
};

export default UserFilters;