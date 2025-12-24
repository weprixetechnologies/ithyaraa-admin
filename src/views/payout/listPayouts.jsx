import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';
import { Button } from '../../components/ui/button';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
    RiCheckLine,
    RiCloseLine,
    RiEyeLine,
    RiMoneyDollarCircleLine,
    RiUserLine,
    RiCalendarLine,
    RiRefreshLine,
    RiSearchLine,
    RiDownloadLine
} from 'react-icons/ri';
import Layout from 'src/layout';

const ListPayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchPayouts = async (page = 1, search = '', status = 'all') => {
        try {
            setLoading(true);
            setRefreshing(true);

            let url = `/affiliate/payout-requests?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (status !== 'all') url += `&status=${status}`;

            console.log('Fetching payouts with URL:', url);
            console.log('Search params:', { page, search, status });

            const response = await axiosInstance.get(url);

            if (response.data?.success) {
                setPayouts(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast.error('Failed to fetch payout requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPayouts(currentPage, '', statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    useEffect(() => {
        if (statusFilter !== 'all') {
            setCurrentPage(1);
            fetchPayouts(1, searchTerm, statusFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleSearch = () => {
        console.log('Search triggered with:', { searchTerm, statusFilter });
        setCurrentPage(1);
        fetchPayouts(1, searchTerm, statusFilter);
    };

    const handleRefresh = () => {
        fetchPayouts(currentPage, searchTerm, statusFilter);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchPayouts(1, '', statusFilter);
    };

    const handleApprove = async (payoutId) => {
        try {
            const response = await axiosInstance.put(`/affiliate/approve-payout/${payoutId}`);

            if (response.data?.success) {
                // toast.success('Payout approved successfully');
                fetchPayouts(currentPage);
            } else {
                toast.error(response.data?.error || 'Failed to approve payout');
            }
        } catch (error) {
            console.error('Error approving payout:', error);
            toast.error('Failed to approve payout');
        }
    };

    const handleReject = async (payoutId) => {
        try {
            const response = await axiosInstance.put(`/affiliate/reject-payout/${payoutId}`);

            if (response.data?.success) {
                // toast.success('Payout rejected successfully');
                fetchPayouts(currentPage);
            } else {
                toast.error(response.data?.error || 'Failed to reject payout');
            }
        } catch (error) {
            console.error('Error rejecting payout:', error);
            toast.error('Failed to reject payout');
        }
    };

    const handleViewDetails = (payout) => {
        setSelectedPayout(payout);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200',
                text: 'Pending',
                icon: '⏳'
            },
            failed: {
                color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200',
                text: 'Failed',
                icon: '❌'
            },
            approved: {
                color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200',
                text: 'Approved',
                icon: '✅'
            },
            rejected: {
                color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200',
                text: 'Rejected',
                icon: '❌'
            },
            completed: {
                color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200',
                text: 'Completed',
                icon: '🎉'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${config.color}`}>
                <span>{config.icon}</span>
                {config.text}
            </span>
        );
    };

    return (
        <Layout title="Payout Requests" active="admin-payout-list">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <Container>
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl text-left font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                    Payout Management
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    Manage affiliate payout requests and approvals
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    variant="outline"
                                    className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700"
                                >
                                    <RiRefreshLine className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                    <RiDownloadLine className="w-4 h-4" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <RiMoneyDollarCircleLine className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {payouts.filter(p => p.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-100 rounded-full">
                                    <RiCalendarLine className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {payouts.filter(p => p.status === 'approved').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <RiCheckLine className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        ₹{payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <RiMoneyDollarCircleLine className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by transaction ID, user name, or email..."
                                    value={searchTerm}
                                    onChange={handleSearchInputChange}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <RiCloseLine className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                </select>

                                <Button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Searching...
                                        </div>
                                    ) : (
                                        'Search'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Payout Requests</h3>
                                <div className="text-sm text-gray-500">
                                    Showing {payouts.length} of {totalItems} requests
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Transaction ID
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            User Details
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Amount
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Request Date
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                                    <p className="text-gray-500 text-lg">Loading payout requests...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : payouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <RiMoneyDollarCircleLine className="w-16 h-16 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-lg font-medium">No payout requests found</p>
                                                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payouts.map((payout, index) => (
                                            <TableRow
                                                key={payout.txnID}
                                                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                                                                <span className="text-white font-bold text-sm">
                                                                    {payout.txnID?.slice(-2) || 'ID'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-mono font-medium text-gray-900">
                                                                {payout.txnID}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                                                <RiUserLine className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {payout.userName || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {payout.userEmail || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        ₹{Number(payout.amount).toLocaleString('en-IN')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    {getStatusBadge(payout.status)}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(payout.createdOn).toLocaleDateString('en-IN')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(payout.createdOn).toLocaleTimeString('en-IN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(payout)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                                        >
                                                            <RiEyeLine className="w-4 h-4" />
                                                            View
                                                        </Button>

                                                        {payout.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleApprove(payout.txnID)}
                                                                    className="flex items-center gap-1.5 px-3 py-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                                                >
                                                                    <RiCheckLine className="w-4 h-4" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleReject(payout.txnID)}
                                                                    className="flex items-center gap-1.5 px-3 py-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                                                >
                                                                    <RiCloseLine className="w-4 h-4" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                                        <span className="font-semibold">{totalPages}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1 || loading}
                                            variant="outline"
                                            size="sm"
                                            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                                if (pageNum > totalPages) return null;

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        className={`w-10 h-10 ${currentPage === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'hover:bg-blue-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages || loading}
                                            variant="outline"
                                            size="sm"
                                            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>

                {/* Payout Details Modal */}
                {showModal && selectedPayout && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-300 scale-100">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                            <RiMoneyDollarCircleLine className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Payout Details</h3>
                                            <p className="text-blue-100 text-sm">Transaction Information</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                                    >
                                        <RiCloseLine size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Transaction ID */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Transaction ID</label>
                                    <p className="text-lg font-mono text-gray-900 bg-white px-3 py-2 rounded-lg border">
                                        {selectedPayout.txnID}
                                    </p>
                                </div>

                                {/* User Information */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <label className="text-sm font-semibold text-gray-700 mb-3 block">User Information</label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                            <RiUserLine className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">{selectedPayout.userName || 'N/A'}</p>
                                            <p className="text-sm text-gray-600">{selectedPayout.userEmail || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Amount</label>
                                    <p className="text-3xl font-bold text-green-700">
                                        ₹{Number(selectedPayout.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Status</label>
                                    {getStatusBadge(selectedPayout.status)}
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Request Date</label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedPayout.createdOn).toLocaleDateString('en-IN')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(selectedPayout.createdOn).toLocaleTimeString('en-IN')}
                                        </p>
                                    </div>

                                    {selectedPayout.updatedOn && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Last Updated</label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(selectedPayout.updatedOn).toLocaleDateString('en-IN')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(selectedPayout.updatedOn).toLocaleTimeString('en-IN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3"
                                    >
                                        Close
                                    </Button>

                                    {selectedPayout.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    handleApprove(selectedPayout.txnID);
                                                    setShowModal(false);
                                                }}
                                                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                            >
                                                <RiCheckLine className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleReject(selectedPayout.txnID);
                                                    setShowModal(false);
                                                }}
                                                variant="outline"
                                                className="flex-1 py-3 text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                <RiCloseLine className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ListPayouts;
