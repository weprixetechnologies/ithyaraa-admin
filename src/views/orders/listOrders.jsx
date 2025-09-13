import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/container'
import { MdEdit } from "react-icons/md";
import { IoMdEye } from 'react-icons/io';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { getAllOrders } from '@/lib/api/ordersApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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


const ListOrders = () => {
    const [orderList, setOrderList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        paymentStatus: 'all',
        page: 1,
        limit: 10
    })
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
    })

    const fetchOrders = useCallback(async () => {
        try {
            setLoadingAPI(true)
            // Convert "all" values to empty strings for the API
            const apiFilters = {
                ...filters,
                status: filters.status === 'all' ? '' : filters.status,
                paymentStatus: filters.paymentStatus === 'all' ? '' : filters.paymentStatus
            }
            const response = await getAllOrders(apiFilters)
            if (response.success) {
                setOrderList(response.data)
                setPagination(response.pagination)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoadingAPI(false)
        }
    }, [filters])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

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
        fetchOrders()
    }

    const handlePageChange = (page) => {
        setFilters(prev => ({
            ...prev,
            page
        }))
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
            case 'Preparing': return 'bg-yellow-100 text-yellow-800'
            case 'Shipped': return 'bg-blue-100 text-blue-800'
            case 'Delivered': return 'bg-green-100 text-green-800'
            case 'Cancelled': return 'bg-red-100 text-red-800'
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

    const navigate = useNavigate()

    return (
        <Layout active={'admin-orders-list'} title={'Orders List'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="flex flex-col gap-4">
                    {/* Search and Filters */}
                    <div className="flex w-full items-center gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow w-full">
                            <InputUi
                                placeholder={'Search Order ID / Name / Email'}
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Order Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Preparing">Preparing</SelectItem>
                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.paymentStatus} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment</SelectItem>
                                    <SelectItem value="successful">Successful</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                            <button
                                onClick={handleSearch}
                                className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded text-[12px] hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span>Total Orders: {pagination.totalOrders}</span>
                        <span>Page: {pagination.currentPage} of {pagination.totalPages}</span>
                    </div>
                </div>
            </Container>
            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2 ">
                    <TableHeader>
                        <TableRow className=" text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">ORDER ID</TableHead>
                            <TableHead className="text-left pl-10">User Data</TableHead>
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Payment</TableHead>
                            <TableHead className="text-center">Ordered On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">
                        {loadingAPI && orderList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className='rounded-[10px]'>
                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {orderList?.length > 0 && !loadingAPI &&
                            orderList?.map((order, index) => (
                                <TableRow key={index} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        #{order.orderID}
                                    </TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            <img
                                                src='https://picsum.photos/400/300?random=1'
                                                className="h-[35px] w-[35px] rounded-full"
                                                alt="User"
                                            />
                                            <div className="flex flex-col justify-start items-start text-right">
                                                <p className='text-right font-medium'>{order.username || 'N/A'}</p>
                                                <p className='font-light text-secondary-text max-w-[350px] truncate overflow-hidden whitespace-nowrap hover:text-dark-secondary-text cursor-pointer'>
                                                    {order.emailID || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                            {order.itemCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-medium">
                                        {formatPrice(order.total)}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">{order.paymentMode}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5 text-sm">
                                        {formatDate(order.createdAt)}
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button
                                                className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700'
                                                onClick={() => navigate(`/orders/details/${order.orderID}`)}
                                                title="Edit Order"
                                            >
                                                <MdEdit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700'
                                                onClick={() => navigate(`/orders/details/${order.orderID}`)}
                                                title="View Details"
                                            >
                                                <IoMdEye style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {!loadingAPI && orderList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Orders Found
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

export default ListOrders