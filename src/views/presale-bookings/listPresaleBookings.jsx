import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/container'
import { MdEdit } from "react-icons/md";
import { IoMdEye } from 'react-icons/io';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate, useParams } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { getAllPresaleBookings, bulkRecheckPresalePaymentStatus } from '@/lib/api/presaleBookingsApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiSearch, FiFilter, FiShoppingCart, FiCreditCard, FiDollarSign, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Simple Pagination Component
const SimplePagination = ({ currentPage, totalPages, onPageChange, hasNext, hasPrev }) => {
    const pages = []
    const maxVisiblePages = 5

    // Calculate which pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrev}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                Previous
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm border rounded ${page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                Next
            </button>
        </div>
    )
}

const ListPresaleBookings = () => {
    const { viewType = 'all' } = useParams() // Get view type from URL: all, pending, processing, delivered
    const navigate = useNavigate()

    // Determine initial status filter based on view type
    const getInitialStatus = () => {
        switch (viewType) {
            case 'pending':
                return 'pending'
            case 'processing':
                return 'processing' // Special value we'll handle in API call
            case 'delivered':
                return 'delivered'
            default:
                return 'all'
        }
    }

    const [bookingList, setBookingList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [selectedBookings, setSelectedBookings] = useState([])
    const [bulkRechecking, setBulkRechecking] = useState(false)
    const [recheckProgress, setRecheckProgress] = useState({ current: 0, total: 0 })
    const [filters, setFilters] = useState({
        search: '',
        status: getInitialStatus(),
        paymentStatus: 'all',
        page: 1,
        limit: 10
    })

    // Update filters when viewType changes
    useEffect(() => {
        const newStatus = getInitialStatus()
        setFilters(prev => ({
            ...prev,
            status: newStatus,
            page: 1 // Reset to first page when view type changes
        }))
    }, [viewType])
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBookings: 0,
        hasNext: false,
        hasPrev: false
    })
    const [overallStats, setOverallStats] = useState({
        totalOrders: 0,
        codOrders: 0,
        prepaidOrders: 0,
        paidOrders: 0,
        pendingPaymentOrders: 0,
        totalRevenue: 0
    })

    // Fetch overall stats for "All Orders" page
    const fetchOverallStats = useCallback(async () => {
        if (viewType !== 'all') return

        try {
            // Fetch all bookings without pagination to calculate stats
            const response = await getAllPresaleBookings({
                page: 1,
                limit: 10000, // Large limit to get all
                status: '',
                paymentStatus: '',
                search: ''
            })

            if (response.success && response.data) {
                const stats = {
                    totalOrders: response.pagination?.totalBookings || response.data.length,
                    codOrders: 0,
                    prepaidOrders: 0,
                    paidOrders: 0,
                    pendingPaymentOrders: 0,
                    totalRevenue: 0
                }

                response.data.forEach(booking => {
                    const paymentMode = (booking.paymentMode || '').toUpperCase()
                    if (paymentMode === 'COD') {
                        stats.codOrders++
                    } else if (paymentMode === 'PREPAID' || paymentMode === 'PHONEPE') {
                        stats.prepaidOrders++
                    }

                    const paymentStatus = (booking.paymentStatus || '').toLowerCase()
                    if (paymentStatus === 'successful') {
                        stats.paidOrders++
                    } else if (paymentStatus === 'pending') {
                        stats.pendingPaymentOrders++
                    }

                    if (paymentStatus === 'successful' || paymentMode === 'COD') {
                        stats.totalRevenue += parseFloat(booking.total || 0)
                    }
                })

                setOverallStats(stats)
            }
        } catch (error) {
            console.error('Error fetching overall stats:', error)
        }
    }, [viewType])

    const fetchBookings = useCallback(async () => {
        try {
            setLoadingAPI(true)
            // Handle processing status (accepted, packed, shipped)
            let statusFilter = filters.status
            if (statusFilter === 'processing') {
                // For processing, we'll filter on the frontend since API might not support multiple statuses
                statusFilter = ''
            } else if (statusFilter === 'all') {
                statusFilter = ''
            }

            // Convert "all" values to empty strings for the API
            const apiFilters = {
                ...filters,
                status: statusFilter,
                paymentStatus: filters.paymentStatus === 'all' ? '' : filters.paymentStatus
            }
            const response = await getAllPresaleBookings(apiFilters)
            if (response.success) {
                let filteredData = response.data

                // Filter for processing status on frontend if needed
                if (filters.status === 'processing') {
                    filteredData = response.data.filter(booking =>
                        ['accepted', 'packed', 'shipped'].includes(booking.orderStatus?.toLowerCase())
                    )
                }

                setBookingList(filteredData)
                // Update pagination - for processing, we might need to recalculate
                if (filters.status === 'processing') {
                    setPagination({
                        ...response.pagination,
                        totalBookings: filteredData.length
                    })
                } else {
                    setPagination(response.pagination)
                }
            }
        } catch (error) {
            console.error('Error fetching presale bookings:', error)
        } finally {
            setLoadingAPI(false)
        }
    }, [filters])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    // Fetch overall stats when on "All Orders" page
    useEffect(() => {
        if (viewType === 'all') {
            fetchOverallStats()
        }
    }, [viewType, fetchOverallStats])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }))
    }

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            page: 1
        }))
        fetchBookings()
    }

    const handlePageChange = (page) => {
        setFilters(prev => ({
            ...prev,
            page
        }))
    }

    const toggleSelectAll = () => {
        if (selectedBookings.length === bookingList.length) {
            setSelectedBookings([])
        } else {
            setSelectedBookings(bookingList.map(booking => booking.preBookingID))
        }
    }

    const toggleSelectOne = (preBookingID) => {
        setSelectedBookings(prev =>
            prev.includes(preBookingID)
                ? prev.filter(id => id !== preBookingID)
                : [...prev, preBookingID]
        )
    }

    const handleBulkRecheckPaymentStatus = async () => {
        // Filter to only include PREPAID/PHONEPE orders (not COD)
        const eligibleBookings = bookingList.filter(booking => {
            const paymentMode = (booking.paymentMode || '').toUpperCase()
            return (paymentMode === 'PREPAID' || paymentMode === 'PHONEPE') &&
                selectedBookings.includes(booking.preBookingID)
        })

        if (eligibleBookings.length === 0) {
            toast.warning('Please select at least one PREPAID or PHONEPE order to recheck payment status')
            return
        }

        if (!window.confirm(`Re-check payment status for ${eligibleBookings.length} order(s)?`)) {
            return
        }

        setBulkRechecking(true)
        setRecheckProgress({ current: 0, total: eligibleBookings.length })

        try {
            // Get preBookingIDs from eligible bookings
            const preBookingIDs = eligibleBookings.map(booking => booking.preBookingID)

            // Call bulk recheck API
            const response = await bulkRecheckPresalePaymentStatus(preBookingIDs)

            if (response.success) {
                const { summary } = response
                const summaryMessage = `Payment status check completed! Total: ${summary.total}, Successful: ${summary.successful}, Updated: ${summary.updated}, Failed: ${summary.failed}`
                toast.success(summaryMessage, { autoClose: 5000 })

                // Refresh the booking list
                await fetchBookings()
                if (viewType === 'all') {
                    await fetchOverallStats()
                }
            } else {
                toast.error(response.message || 'Failed to recheck payment status')
            }

            setSelectedBookings([])
        } catch (error) {
            console.error('Error in bulk recheck:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Error during bulk payment status check'
            toast.error(errorMessage)
        } finally {
            setBulkRechecking(false)
            setRecheckProgress({ current: 0, total: 0 })
        }
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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price || 0)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'accepted': return 'bg-blue-100 text-blue-800'
            case 'packed': return 'bg-purple-100 text-purple-800'
            case 'shipped': return 'bg-blue-100 text-blue-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'returned': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'successful': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'refunded': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Get page title based on view type
    const getPageTitle = () => {
        switch (viewType) {
            case 'pending':
                return 'Pending Pre-Booking Orders'
            case 'processing':
                return 'Processing Pre-Booking Orders'
            case 'delivered':
                return 'Delivered Pre-Booking Orders'
            default:
                return 'All Pre-Booking Orders'
        }
    }

    // Get active menu ID based on view type
    const getActiveMenuId = () => {
        switch (viewType) {
            case 'pending':
                return 'admin-prebooking-pending'
            case 'processing':
                return 'admin-prebooking-processing'
            case 'delivered':
                return 'admin-prebooking-delivered'
            default:
                return 'admin-prebooking-all'
        }
    }

    // Use overall stats for "All Orders" page, otherwise calculate from current page
    const stats = viewType === 'all' ? overallStats : {
        totalOrders: pagination.totalBookings || 0,
        codOrders: bookingList.filter(b => (b.paymentMode || '').toUpperCase() === 'COD').length,
        prepaidOrders: bookingList.filter(b => ['PREPAID', 'PHONEPE'].includes((b.paymentMode || '').toUpperCase())).length,
        paidOrders: bookingList.filter(b => (b.paymentStatus || '').toLowerCase() === 'successful').length,
        pendingPaymentOrders: bookingList.filter(b => (b.paymentStatus || '').toLowerCase() === 'pending').length,
        totalRevenue: bookingList.reduce((sum, b) => {
            const paymentStatus = (b.paymentStatus || '').toLowerCase()
            const paymentMode = (b.paymentMode || '').toUpperCase()
            if (paymentStatus === 'successful' || paymentMode === 'COD') {
                return sum + parseFloat(b.total || 0)
            }
            return sum
        }, 0)
    }

    return (
        <Layout active={getActiveMenuId()} title={getPageTitle()}>
            <Container containerclass={'bg-transaparent'}>
                <div className="flex flex-col gap-6">
                    {/* Modern Search and Filters Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FiFilter className="text-gray-600 text-xl" />
                            <h3 className="text-lg font-semibold text-gray-800">Filters & Search</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Search PreBooking ID / Name / Email"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                />
                            </div>

                            {/* Order Status Filter */}
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger className="h-[42px] bg-white border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Order Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all" className="bg-white hover:bg-gray-50">All Status</SelectItem>
                                    <SelectItem value="pending" className="bg-white hover:bg-gray-50">Pending</SelectItem>
                                    <SelectItem value="accepted" className="bg-white hover:bg-gray-50">Accepted</SelectItem>
                                    <SelectItem value="packed" className="bg-white hover:bg-gray-50">Packed</SelectItem>
                                    <SelectItem value="shipped" className="bg-white hover:bg-gray-50">Shipped</SelectItem>
                                    <SelectItem value="delivered" className="bg-white hover:bg-gray-50">Delivered</SelectItem>
                                    <SelectItem value="cancelled" className="bg-white hover:bg-gray-50">Cancelled</SelectItem>
                                    <SelectItem value="returned" className="bg-white hover:bg-gray-50">Returned</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Payment Status Filter */}
                            <Select value={filters.paymentStatus} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                                <SelectTrigger className="h-[42px] bg-white border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all" className="bg-white hover:bg-gray-50">All Payment</SelectItem>
                                    <SelectItem value="pending" className="bg-white hover:bg-gray-50">Pending</SelectItem>
                                    <SelectItem value="successful" className="bg-white hover:bg-gray-50">Successful</SelectItem>
                                    <SelectItem value="failed" className="bg-white hover:bg-gray-50">Failed</SelectItem>
                                    <SelectItem value="refunded" className="bg-white hover:bg-gray-50">Refunded</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="h-[42px] px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                                <FiSearch className="text-base" />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards - Only show on All Orders page */}
                    {viewType === 'all' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                            {/* Total Orders */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium mb-1">Total Orders</p>
                                        <p className="text-3xl font-bold text-blue-900">{stats.totalOrders}</p>
                                        <p className="text-xs text-blue-700 mt-1">All pre-booking orders</p>
                                    </div>
                                    <div className="bg-blue-200 rounded-full p-3">
                                        <FiShoppingCart className="text-blue-700 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* COD Orders */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium mb-1">COD Orders</p>
                                        <p className="text-3xl font-bold text-orange-900">{stats.codOrders}</p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            {stats.totalOrders > 0 ? Math.round((stats.codOrders / stats.totalOrders) * 100) : 0}% of total
                                        </p>
                                    </div>
                                    <div className="bg-orange-200 rounded-full p-3">
                                        <FiDollarSign className="text-orange-700 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Prepaid Orders */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium mb-1">Prepaid Orders</p>
                                        <p className="text-3xl font-bold text-purple-900">{stats.prepaidOrders}</p>
                                        <p className="text-xs text-purple-700 mt-1">
                                            {stats.totalOrders > 0 ? Math.round((stats.prepaidOrders / stats.totalOrders) * 100) : 0}% of total
                                        </p>
                                    </div>
                                    <div className="bg-purple-200 rounded-full p-3">
                                        <FiCreditCard className="text-purple-700 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Paid Orders */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium mb-1">Paid Orders</p>
                                        <p className="text-3xl font-bold text-green-900">{stats.paidOrders}</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            {stats.totalOrders > 0 ? Math.round((stats.paidOrders / stats.totalOrders) * 100) : 0}% paid
                                        </p>
                                    </div>
                                    <div className="bg-green-200 rounded-full p-3">
                                        <FiCheckCircle className="text-green-700 text-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Stats Row - Only for All Orders */}
                    {viewType === 'all' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Pending Payment */}
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-yellow-600 font-medium mb-1">Pending Payment</p>
                                        <p className="text-3xl font-bold text-yellow-900">{stats.pendingPaymentOrders}</p>
                                        <p className="text-xs text-yellow-700 mt-1">Awaiting payment</p>
                                    </div>
                                    <div className="bg-yellow-200 rounded-full p-3">
                                        <FiDollarSign className="text-yellow-700 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Total Revenue */}
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-indigo-600 font-medium mb-1">Total Revenue</p>
                                        <p className="text-2xl font-bold text-indigo-900">{formatPrice(stats.totalRevenue)}</p>
                                        <p className="text-xs text-indigo-700 mt-1">Paid + COD orders</p>
                                    </div>
                                    <div className="bg-indigo-200 rounded-full p-3">
                                        <FiDollarSign className="text-indigo-700 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Pagination Info */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium mb-1">Page Info</p>
                                        <p className="text-2xl font-bold text-gray-900">{pagination.currentPage} / {pagination.totalPages}</p>
                                        <p className="text-xs text-gray-700 mt-1">{pagination.totalBookings} total records</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full p-3">
                                        <FiFilter className="text-gray-700 text-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Simple Stats for other views */}
                    {viewType !== 'all' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Total {viewType} Orders</p>
                                        <p className="text-2xl font-bold text-blue-900 mt-1">{pagination.totalBookings}</p>
                                    </div>
                                    <div className="bg-blue-200 rounded-full p-3">
                                        <FiShoppingCart className="text-blue-700 text-xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Current Page</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.currentPage} / {pagination.totalPages}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full p-3">
                                        <FiFilter className="text-gray-700 text-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bulk Actions Bar */}
                    {selectedBookings.length > 0 && (
                        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 px-5 py-3 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                    <FiRefreshCw className="text-blue-600" size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedBookings.length} order{selectedBookings.length > 1 ? 's' : ''} selected
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {bookingList.filter(b => {
                                            const pm = (b.paymentMode || '').toUpperCase()
                                            return (pm === 'PREPAID' || pm === 'PHONEPE') && selectedBookings.includes(b.preBookingID)
                                        }).length} eligible for payment status check
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleBulkRecheckPaymentStatus}
                                disabled={bulkRechecking}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {bulkRechecking ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Checking... ({recheckProgress.current}/{recheckProgress.total})
                                    </>
                                ) : (
                                    <>
                                        <FiRefreshCw size={18} />
                                        Re-Check Payment Status
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </Container>
            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2 ">
                    <TableHeader>
                        <TableRow className=" text-unique text-[16px] uppercase">
                            <TableHead className="pl-5 w-12">
                                <input
                                    type="checkbox"
                                    checked={bookingList.length > 0 && selectedBookings.length === bookingList.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                            </TableHead>
                            <TableHead className="pl-5">PRE-BOOKING ID</TableHead>
                            <TableHead className="text-left pl-10">User Data</TableHead>
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Payment</TableHead>
                            <TableHead className="text-center">Booked On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">
                        {loadingAPI && bookingList?.length === 0 && (
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

                        {bookingList?.length > 0 && !loadingAPI &&
                            bookingList?.map((booking, index) => (
                                <TableRow key={index} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                    <TableCell className="py-5 pl-5">
                                        <input
                                            type="checkbox"
                                            checked={selectedBookings.includes(booking.preBookingID)}
                                            onChange={() => toggleSelectOne(booking.preBookingID)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        />
                                    </TableCell>
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        #{booking.preBookingID}
                                    </TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            <img
                                                src='https://picsum.photos/400/300?random=1'
                                                className="h-[35px] w-[35px] rounded-full"
                                                alt="User"
                                            />
                                            <div className="flex flex-col justify-start items-start text-right">
                                                <p className='text-right font-medium'>{booking.username || 'N/A'}</p>
                                                <p className='font-light text-secondary-text max-w-[350px] truncate overflow-hidden whitespace-nowrap hover:text-dark-secondary-text cursor-pointer'>
                                                    {booking.emailID || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                            {booking.itemCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-medium">
                                        {formatPrice(booking.total)}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.orderStatus)}`}>
                                            {booking.orderStatus || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">{booking.paymentMode}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5 text-sm">
                                        {formatDate(booking.createdAt)}
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button
                                                className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700'
                                                onClick={() => navigate(`/presale-bookings/details/${booking.preBookingID}`)}
                                                title="Edit Booking"
                                            >
                                                <MdEdit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700'
                                                onClick={() => navigate(`/presale-bookings/details/${booking.preBookingID}`)}
                                                title="View Details"
                                            >
                                                <IoMdEye style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {!loadingAPI && bookingList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Presale Bookings Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </Container>

            {/* Pagination */}
            {!loadingAPI && pagination.totalPages > 1 && (
                <Container containerclass="bg-transparent">
                    <SimplePagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        hasNext={pagination.hasNext}
                        hasPrev={pagination.hasPrev}
                    />
                </Container>
            )}
        </Layout>
    )
}

export default ListPresaleBookings

