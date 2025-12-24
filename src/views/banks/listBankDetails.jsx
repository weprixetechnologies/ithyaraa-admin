import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { MdEdit, MdDelete, MdCheck, MdClose } from "react-icons/md";
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

const ListBankDetails = () => {
    const [bankList, setBankList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [error, setError] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // all, pending, active, rejected
    const [rejectionReason, setRejectionReason] = useState('')
    const [selectedBankDetailID, setSelectedBankDetailID] = useState(null)
    const [showRejectionModal, setShowRejectionModal] = useState(false)
    const [processingBankID, setProcessingBankID] = useState(null) // Track which bank detail is being processed

    const fetchBankDetails = useCallback(async () => {
        try {
            setLoadingAPI(true)
            setError('')
            const { data } = await axiosInstance.get('/admin/bank-details')
            if (data.success) {
                let filteredData = data.data

                if (filterStatus !== 'all') {
                    filteredData = data.data.filter(bank => bank.status === filterStatus)
                }

                setBankList(filteredData)
            } else {
                setError('Failed to fetch bank details')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch bank details')
        } finally {
            setLoadingAPI(false)
        }
    }, [filterStatus])

    useEffect(() => {
        fetchBankDetails()
    }, [fetchBankDetails])

    const handleApprove = async (bankDetailID) => {
        if (processingBankID) return; // Prevent multiple simultaneous operations
        
        try {
            setProcessingBankID(bankDetailID)
            const { data } = await axiosInstance.put(`/admin/bank-details/${bankDetailID}/approve`)
            if (data.success) {
                toast.success('Bank details approved successfully')
                fetchBankDetails()
            } else {
                toast.error(data.message || 'Failed to approve bank details')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve bank details')
        } finally {
            setProcessingBankID(null)
        }
    }

    const handleReject = async () => {
        if (!selectedBankDetailID || processingBankID) return

        try {
            setProcessingBankID(selectedBankDetailID)
            const { data } = await axiosInstance.put(`/admin/bank-details/${selectedBankDetailID}/reject`, {
                rejectionReason
            })
            if (data.success) {
                toast.success('Bank details rejected successfully')
                setShowRejectionModal(false)
                setRejectionReason('')
                setSelectedBankDetailID(null)
                fetchBankDetails()
            } else {
                toast.error(data.message || 'Failed to reject bank details')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject bank details')
        } finally {
            setProcessingBankID(null)
        }
    }

    const handleOpenRejectionModal = (bankDetailID) => {
        setSelectedBankDetailID(bankDetailID)
        setShowRejectionModal(true)
    }

    const formatDate = (dateString) => {
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
            case 'active': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Layout active={'admin-bank-details'} title={'Bank Details Management'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Bank Details Management</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-4 py-2 rounded-lg ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilterStatus('rejected')}
                            className={`px-4 py-2 rounded-lg ${filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Rejected
                        </button>
                    </div>
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
                            <TableHead className="text-center">Brand</TableHead>
                            <TableHead className="text-center">Account Holder</TableHead>
                            <TableHead className="text-center">Account Number</TableHead>
                            <TableHead className="text-center">IFSC</TableHead>
                            <TableHead className="text-center">Bank Name</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Date</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">
                        {loadingAPI && bankList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className='rounded-[10px]'>
                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {bankList?.length > 0 && !loadingAPI &&
                            bankList.map((bank) => (
                                <TableRow key={bank.bankDetailID} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        {bank.bankDetailID}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col">
                                            <p className="font-medium">{bank.brandName || 'N/A'}</p>
                                            <p className="text-xs text-gray-600">@{bank.username}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        {bank.accountHolderName}
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-mono">
                                        {bank.accountNumber}
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-mono">
                                        {bank.ifscCode}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        {bank.bankName}
                                        {bank.branchName && <p className="text-xs text-gray-600">{bank.branchName}</p>}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bank.status)}`}>
                                            {bank.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5 text-xs">
                                        {formatDate(bank.createdAt)}
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            {bank.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={`bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700 ${processingBankID === bank.bankDetailID ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleApprove(bank.bankDetailID)}
                                                        disabled={processingBankID === bank.bankDetailID || processingBankID !== null}
                                                        title="Approve"
                                                    >
                                                        <MdCheck style={{ width: '16px', height: '16px' }} />
                                                    </button>
                                                    <button
                                                        className={`bg-red-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-red-700 ${processingBankID === bank.bankDetailID ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleOpenRejectionModal(bank.bankDetailID)}
                                                        disabled={processingBankID === bank.bankDetailID || processingBankID !== null}
                                                        title="Reject"
                                                    >
                                                        <MdClose style={{ width: '16px', height: '16px' }} />
                                                    </button>
                                                </>
                                            )}
                                            {bank.rejectionReason && (
                                                <button
                                                    className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700'
                                                    onClick={() => toast.info(`Rejection Reason: ${bank.rejectionReason}`)}
                                                    title="View Rejection Reason"
                                                >
                                                    <MdEdit style={{ width: '16px', height: '16px' }} />
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }

                        {!loadingAPI && bankList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Bank Details Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Container>

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Reject Bank Details</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="Enter reason for rejection"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false)
                                    setRejectionReason('')
                                    setSelectedBankDetailID(null)
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || processingBankID !== null}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {processingBankID ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default ListBankDetails

