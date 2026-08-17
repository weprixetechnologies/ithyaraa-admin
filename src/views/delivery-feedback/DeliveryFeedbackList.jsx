import React, { useEffect, useState } from 'react';
import { getDeliveryFeedback } from '../../lib/api/feedbackApi';
import { FaStar, FaUser, FaBoxOpen, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';

import Layout from '../../layout';

const DeliveryFeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await getDeliveryFeedback();
            if (res.success) {
                setFeedbacks(res.data);
            } else {
                toast.error('Failed to load feedback');
            }
        } catch (error) {
            console.error('Error fetching delivery feedback:', error);
            toast.error('Error loading feedback');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Layout title="Delivery Feedback" active="admin-delivery-feedback">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Delivery Feedback" active="admin-delivery-feedback">
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Delivery Experience Feedback</h1>
                    <p className="mt-2 text-gray-600">Track how users feel about their delivery and ordering experience.</p>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FaBoxOpen className="mx-auto text-gray-300 text-6xl mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No Feedback Yet</h3>
                        <p className="text-gray-500">Feedback from users will appear here once they rate their delivery experience.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feedbacks.map((item) => (
                            <div key={item.feedbackID} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col">
                                {/* Card Header */}
                                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <FaUser className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{item.userName}</h3>
                                                <p className="text-xs text-gray-500">{item.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                                            <FaStar className="text-yellow-400 mr-1" />
                                            <span className="font-bold text-yellow-700">{item.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <FaCalendarAlt className="mr-1" />
                                        {formatDate(item.createdOn)}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1">
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                            <FaBoxOpen className="mr-1" /> Order #{item.orderID}
                                        </p>
                                        <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-50/50 italic text-gray-700 text-sm">
                                            "{item.comment || 'No comment provided'}"
                                        </div>
                                    </div>

                                    {item.tags && (
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {item.tags.split(',').map((tag, i) => (
                                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    <FaTag className="mr-1 text-[10px]" />
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DeliveryFeedbackList;
