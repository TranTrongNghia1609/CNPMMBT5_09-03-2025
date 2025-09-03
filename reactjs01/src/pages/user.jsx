import { useEffect, useState } from 'react';
import { callFetchUsers } from '../components/util/api';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        total: 0,
        limit: 10
    });

    const fetchUsers = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
        const response = await callFetchUsers(page, limit);
        console.log('API response:', response); 
        
        // Response đã là dữ liệu rồi, không cần .data
        const data = response; // Thay vì response.data
        console.log('Response data:', data);
        
        if (data && data.users && Array.isArray(data.users)) {
            // Có phân trang
            setUsers(data.users);
            setPagination({
                currentPage: data.page,
                totalPages: data.totalPages,
                total: data.total,
                limit: data.limit
            });
        } else if (Array.isArray(data)) {
            // Trả về mảng trực tiếp
            setUsers(data);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                total: data.length,
                limit: data.length
            });
        } else {
            console.warn('Unexpected data format:', data);
            setUsers([]);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setPagination({
            currentPage: 1,
            totalPages: 0,
            total: 0,
            limit: 5
        });
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchUsers(newPage, pagination.limit);
        }
    };

    const handleLimitChange = (newLimit) => {
        fetchUsers(1, newLimit);
    };

    const renderPagination = () => {
        if (!pagination.totalPages || pagination.totalPages <= 1) return null;

        const pages = [];
        const { currentPage, totalPages } = pagination;

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
                Previous
            </button>
        );

        // Page numbers
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded ${
                        i === currentPage 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
                Next
            </button>
        );

        return pages;
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>
            
            {/* Controls */}
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <label className="mr-2">Items per page:</label>
                    <select 
                        value={pagination.limit} 
                        onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                        className="border rounded px-2 py-1"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div className="text-sm text-gray-600">
                    Total: {pagination.total} users
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p>Loading...</p>
                </div>
            )}

            {/* Users Table */}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                                            Edit
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No users found
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center">
                    <div className="flex items-center">
                        {renderPagination()}
                    </div>
                    <div className="ml-4 text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;