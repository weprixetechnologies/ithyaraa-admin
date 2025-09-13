import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';
import { Button } from '../../components/ui/button';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { RiCheckLine, RiCloseLine, RiEyeLine } from 'react-icons/ri';
import Layout from 'src/layout';

const ListPayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchPayouts = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/affiliate/payout-requests?page=${page}&limit=10`);

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
        }
    };

    useEffect(() => {
        fetchPayouts(currentPage);
    }, [currentPage]);

    const handleApprove = async (payoutId) => {
        try {
            const response = await axiosInstance.put(`/affiliate/approve-payout/${payoutId}`);

            if (response.data?.success) {
                toast.success('Payout approved successfully');
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
                toast.success('Payout rejected successfully');
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
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Failed' },
            completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <Layout title="Payout Requests" active="admin-payout-list">
            <Container>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Payout Requests</h1>
                    <p className="text-gray-600 mt-1">
                        Manage affiliate payout requests and approvals
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="mb-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Total: {totalItems} payout requests
                            </div>
                        </div>

                        <Table className="border-separate border-spacing-y-2">
                            <TableHeader>
                                <TableRow className="text-unique text-[16px] capitalize">
                                    <TableHead className="pl-5">Transaction ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-center">Amount</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Request Date</TableHead>
                                    <TableHead className="pr-5 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : payouts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No payout requests found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payouts.map((payout) => (
                                        <TableRow className="bg-white" key={payout.txnID}>
                                            <TableCell className="rounded-l-lg pl-5">
                                                <span className="font-mono text-sm">{payout.txnID}</span>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div>
                                                    <div className="font-medium">{payout.userName || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{payout.userEmail || 'N/A'}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-medium">₹{Number(payout.amount).toLocaleString('en-IN')}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(payout.status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm">
                                                    {new Date(payout.createdOn).toLocaleDateString('en-IN')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="rounded-r-[10px] text-center pr-5">
                                                <div className="flex-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(payout)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <RiEyeLine size={14} />
                                                        View
                                                    </Button>

                                                    {payout.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleApprove(payout.txnID)}
                                                                className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                                                            >
                                                                <RiCheckLine size={14} />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleReject(payout.txnID)}
                                                                className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                                                            >
                                                                <RiCloseLine size={14} />
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

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 gap-4">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payout Details Modal */}
                {showModal && selectedPayout && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">Payout Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <RiCloseLine size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedPayout.txnID}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">User</label>
                                    <p className="text-sm text-gray-900">{selectedPayout.userName || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{selectedPayout.userEmail || 'N/A'}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Amount</label>
                                    <p className="text-sm text-gray-900 font-medium">
                                        ₹{Number(selectedPayout.amount).toLocaleString('en-IN')}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        {getStatusBadge(selectedPayout.status)}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Request Date</label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedPayout.createdOn).toLocaleString('en-IN')}
                                    </p>
                                </div>

                                {selectedPayout.updatedOn && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedPayout.updatedOn).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
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
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleReject(selectedPayout.txnID);
                                                setShowModal(false);
                                            }}
                                            variant="outline"
                                            className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </Layout>
    );
};

export default ListPayouts;
