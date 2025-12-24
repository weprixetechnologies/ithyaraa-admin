import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { MdCheck, MdClose, MdAccountBalance, MdVisibility } from "react-icons/md";
import { RiRefreshLine, RiSearchLine } from "react-icons/ri";
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

const ListAffiliateBankAccounts = () => {
    const [bankAccounts, setBankAccounts] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [error, setError] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // all, pending, approved, rejected
    const [rejectionReason, setRejectionReason] = useState('')
    const [selectedBankAccountID, setSelectedBankAccountID] = useState(null)
    const [showRejectionModal, setShowRejectionModal] = useState(false)
    const [selectedBankAccount, setSelectedBankAccount] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [uidFilter, setUidFilter] = useState('')

    const fetchBankAccounts = useCallback(async () => {
        try {
            setLoadingAPI(true)
            setError('')
            let url = `/affiliate/admin/bank-accounts?page=${currentPage}&limit=10`
            if (filterStatus !== 'all') {
                url += `&status=${filterStatus}`
            }
            if (uidFilter) {
                url += `&uid=${uidFilter}`
            }

            const { data } = await axiosInstance.get(url)
            if (data.success) {
                setBankAccounts(data.data || [])
                setTotalPages(data.totalPages || 1)
                setTotalItems(data.total || 0)
            } else {
                setError('Failed to fetch bank accounts')
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch bank accounts')
            toast.error(err.response?.data?.error || 'Failed to fetch bank accounts')
        } finally {
            setLoadingAPI(false)
        }
    }, [currentPage, filterStatus, uidFilter])

    useEffect(() => {
        fetchBankAccounts()
    }, [fetchBankAccounts])

    const handleApprove = async (bankAccountID) => {
        try {
            const { data } = await axiosInstance.put(`/affiliate/admin/bank-account/${bankAccountID}/approve`)
            if (data.success) {
                toast.success('Bank account approved successfully')
                fetchBankAccounts()
            } else {
                toast.error(data.error || 'Failed to approve bank account')
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to approve bank account')
        }
    }

    const handleReject = async () => {
        if (!selectedBankAccountID) return

        try {
            const { data } = await axiosInstance.put(`/affiliate/admin/bank-account/${selectedBankAccountID}/reject`, {
                rejectionReason
            })
            if (data.success) {
                toast.success('Bank account rejected successfully')
                setShowRejectionModal(false)
                setRejectionReason('')
                setSelectedBankAccountID(null)
                fetchBankAccounts()
            } else {
                toast.error(data.error || 'Failed to reject bank account')
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reject bank account')
        }
    }

    const handleOpenRejectionModal = (bankAccountID) => {
        setSelectedBankAccountID(bankAccountID)
        setShowRejectionModal(true)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const handleSearch = () => {
        setCurrentPage(1)
        fetchBankAccounts()
    }

    const handleClearSearch = () => {
        setUidFilter('')
        setCurrentPage(1)
        fetchBankAccounts()
    }

    const handleViewDetails = (account) => {
        setSelectedBankAccount(account)
        setShowDetailsModal(true)
    }

    return (
        <Layout active={'admin-affiliate-bank-accounts'} title={'Affiliate Bank Accounts'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold">Affiliate Bank Accounts</h1>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            All ({totalItems})
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterStatus('approved')}
                            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setFilterStatus('rejected')}
                            className={`px-4 py-2 rounded-lg transition ${filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4 flex gap-2">
                    <div className="flex-1 max-w-md">
                        <InputUi
                            type="text"
                            placeholder="Search by User ID or Email..."
                            value={uidFilter}
                            onChange={(e) => setUidFilter(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <RiSearchLine />
                        Search
                    </Button>
                    {uidFilter && (
                        <Button
                            onClick={handleClearSearch}
                            variant="outline"
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        onClick={fetchBankAccounts}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RiRefreshLine />
                        Refresh
                    </Button>
                </div>
            </Container>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">ID</TableHead>
                            <TableHead className="text-center">User</TableHead>
                            <TableHead className="text-center">Account Holder</TableHead>
                            <TableHead className="text-center">Account Number</TableHead>
                            <TableHead className="text-center">IFSC</TableHead>
                            <TableHead className="text-center">Bank Name</TableHead>
                            <TableHead className="text-center">Account Type</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Default</TableHead>
                            <TableHead className="text-center">Date</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">
                        {loadingAPI && bankAccounts?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11} className='rounded-[10px]'>
                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {bankAccounts?.length > 0 && !loadingAPI &&
                            bankAccounts.map((account) => (
                                <TableRow
                                    key={account.bankAccountID}
                                    className="rounded-full bg-white shadow-lg shadow-cyan-500/50"
                                >
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        {account.bankAccountID}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col">
                                            <p className="font-medium">{account.userName || 'N/A'}</p>
                                            <p className="text-xs text-gray-600">{account.userEmail || account.uid}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        {account.accountHolderName}
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-mono text-sm">
                                        ****{account.accountNumber?.slice(-4) || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-mono">
                                        {account.ifscCode}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div>
                                            <p className="font-medium">{account.bankName}</p>
                                            {account.branchName && (
                                                <p className="text-xs text-gray-600">{account.branchName}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
                                            {account.accountType || 'savings'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(account.status)}`}>
                                            {account.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        {account.isDefault ? (
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                Default
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center py-5 text-xs">
                                        {formatDate(account.createdAt)}
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <button
                                            className='bg-blue-600 cursor border-none text-white px-3 py-2 rounded-lg flex-center hover:bg-blue-700 transition flex items-center gap-2'
                                            onClick={() => handleViewDetails(account)}
                                            title="View Details"
                                        >
                                            <MdVisibility style={{ width: '16px', height: '16px' }} />
                                            <span className="text-sm">View</span>
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }

                        {!loadingAPI && bankAccounts?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Bank Accounts Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            Previous
                        </Button>
                        <span className="px-4 py-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </Container>

            {/* Details Modal */}
            {showDetailsModal && selectedBankAccount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Bank Account Details</h2>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false)
                                    setSelectedBankAccount(null)
                                }}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <MdClose size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBankAccount.status)}`}>
                                    {selectedBankAccount.status?.toUpperCase()}
                                </span>
                                {selectedBankAccount.isDefault && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        Default Account
                                    </span>
                                )}
                            </div>

                            {/* User Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">User Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">User ID</p>
                                        <p className="font-medium">{selectedBankAccount.uid}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">User Name</p>
                                        <p className="font-medium">{selectedBankAccount.userName || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedBankAccount.userEmail || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Holder Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Account Holder Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Account Holder Name</p>
                                        <p className="font-medium">{selectedBankAccount.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Account Type</p>
                                        <p className="font-medium capitalize">{selectedBankAccount.accountType || 'Savings'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Bank Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Bank Name</p>
                                        <p className="font-medium">{selectedBankAccount.bankName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Branch Name</p>
                                        <p className="font-medium">{selectedBankAccount.branchName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Account Number</p>
                                        <p className="font-medium font-mono">{selectedBankAccount.accountNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">IFSC Code</p>
                                        <p className="font-medium font-mono">{selectedBankAccount.ifscCode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {(selectedBankAccount.panNumber || selectedBankAccount.gstin || selectedBankAccount.address) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Additional Information</h3>
                                    <div className="space-y-3">
                                        {selectedBankAccount.panNumber && (
                                            <div>
                                                <p className="text-sm text-gray-600">PAN Number</p>
                                                <p className="font-medium font-mono">{selectedBankAccount.panNumber}</p>
                                            </div>
                                        )}
                                        {selectedBankAccount.gstin && (
                                            <div>
                                                <p className="text-sm text-gray-600">GSTIN</p>
                                                <p className="font-medium font-mono">{selectedBankAccount.gstin}</p>
                                            </div>
                                        )}
                                        {selectedBankAccount.address && (
                                            <div>
                                                <p className="text-sm text-gray-600">Address</p>
                                                <p className="font-medium">{selectedBankAccount.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Timestamps</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Submitted On</p>
                                        <p className="font-medium">{formatDate(selectedBankAccount.createdAt)}</p>
                                    </div>
                                    {selectedBankAccount.approvedAt && (
                                        <div>
                                            <p className="text-sm text-gray-600">Approved On</p>
                                            <p className="font-medium">{formatDate(selectedBankAccount.approvedAt)}</p>
                                        </div>
                                    )}
                                    {selectedBankAccount.rejectedAt && (
                                        <div>
                                            <p className="text-sm text-gray-600">Rejected On</p>
                                            <p className="font-medium">{formatDate(selectedBankAccount.rejectedAt)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600">Last Updated</p>
                                        <p className="font-medium">{formatDate(selectedBankAccount.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {selectedBankAccount.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-red-800">Rejection Reason</h3>
                                    <p className="text-red-700">{selectedBankAccount.rejectionReason}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedBankAccount.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedBankAccount.bankAccountID)
                                            setShowDetailsModal(false)
                                        }}
                                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                        <MdCheck size={20} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false)
                                            handleOpenRejectionModal(selectedBankAccount.bankAccountID)
                                        }}
                                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    >
                                        <MdClose size={20} />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Reject Bank Account</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Please provide a reason for rejecting this bank account request.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                rows={4}
                                placeholder="Enter reason for rejection (e.g., Invalid IFSC code, Account details mismatch, etc.)"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false)
                                    setRejectionReason('')
                                    setSelectedBankAccountID(null)
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default ListAffiliateBankAccounts

