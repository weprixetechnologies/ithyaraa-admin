import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../layout';
import axiosInstance from '../../lib/axiosInstance';
import { FaStar } from 'react-icons/fa6';

const ListReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        averageRating: 0
    });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [filterStatus]);

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/reviews/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/reviews/admin/all', {
                params: { status: filterStatus }
            });

            // console.log('Reviews response:', response.data);

            if (response.data.success && response.data.data) {
                setReviews(response.data.data);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to fetch reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (reviewID, newStatus) => {
        try {
            await axiosInstance.put(`/reviews/admin/${reviewID}/status`, {
                status: newStatus
            });
            toast.success(`Review ${newStatus} successfully!`);
            fetchReviews();
            fetchStats(); // Refresh stats after status change
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review status');
        }
    };

    const handleDeleteReview = async (reviewID) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            await axiosInstance.delete(`/reviews/admin/${reviewID}`);
            toast.success('Review deleted successfully!');
            fetchReviews();
            fetchStats(); // Refresh stats after deletion
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                        size={16}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <Layout title="All Reviews" active="admin-reviews-list">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading reviews...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="All Reviews" active="admin-reviews-list">
            <div className="p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-600">Total Reviews</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                        <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <h3 className="text-sm font-medium text-gray-600">Approved</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                        <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                        <h3 className="text-sm font-medium text-gray-600">Avg Rating</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0'}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('approved')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Rejected
                    </button>
                </div>

                {/* Reviews Table */}
                <div className="bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.reviewID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {review.productName || review.productID}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{review.username}</div>
                                            <div className="text-sm text-gray-500">{review.emailID}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStars(review.rating)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {review.comment || 'No comment'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex gap-2 justify-center">
                                                {review.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(review.reviewID, 'approved')}
                                                            className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded hover:bg-green-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(review.reviewID, 'rejected')}
                                                            className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteReview(review.reviewID)}
                                                    className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ListReviews;

