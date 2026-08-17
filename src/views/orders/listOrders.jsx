import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/container'
import { 
    MdEdit, MdSearch, MdFilterList, MdCheckCircle, MdPending, MdLocalShipping, MdClose
} from "react-icons/md";
import { IoMdEye } from 'react-icons/io';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate, useLocation } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { getAllOrders } from '@/lib/api/ordersApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ListOrders = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const getInitialStatus = () => {
        const searchParams = new URLSearchParams(location.search)
        const statusParam = searchParams.get('status')
        if (statusParam) {
            const statusMap = {
                'pending': 'pending',
                'preparing': 'Preparing',
                'shipping': 'Shipped',
                'delivered': 'Delivered',
                'returned': 'Returned'
            }
            return statusMap[statusParam] || 'all'
        }
        return 'all'
    }

    const [orderList, setOrderList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [filters, setFilters] = useState({
        search: '',
        status: getInitialStatus(),
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

    useEffect(() => {
        const newStatus = getInitialStatus()
        setFilters(prev => ({ ...prev, status: newStatus, page: 1 }))
    }, [location.search])

    const fetchOrders = useCallback(async () => {
        try {
            setLoadingAPI(true)
            let statusFilter = filters.status === 'all' ? '' : filters.status
            if (statusFilter) {
                const statusNormalize = {
                    'pending': 'pending',
                    'preparing': 'Preparing',
                    'shipping': 'Shipped',
                    'delivered': 'Delivered',
                    'returned': 'Returned',
                    'cancelled': 'Cancelled'
                }
                statusFilter = statusNormalize[statusFilter.toLowerCase()] || statusFilter
            }

            const response = await getAllOrders({
                ...filters,
                status: statusFilter,
                paymentStatus: filters.paymentStatus === 'all' ? '' : filters.paymentStatus
            })
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
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }))
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price || 0)
    }

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <Layout active="admin-orders-list" title="Orders Management">
            {/* Header Summary */}
            <Container containerclass="bg-white border-b border-gray-200 py-6 mb-0 rounded-none shadow-none">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Registry</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and track your customer fulfillment lifecycle.</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Volume</p>
                            <p className="text-xl font-bold text-gray-900">{pagination.totalOrders}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div className="text-center">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</p>
                            <p className="text-xl font-bold text-gray-900">{orderList.filter(o => o.orderStatus === 'pending').length}</p>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Filter Bar */}
            <Container containerclass="bg-gray-50/50 border-b border-gray-200 py-4 mb-0 rounded-none shadow-none">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[300px]">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            className="w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Search by Order ID, Name or Email..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    
                    <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger className="w-[160px] h-9 text-xs bg-white shadow-sm border-gray-300">
                            <SelectValue placeholder="Manifest Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="Preparing">Preparing</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.paymentStatus} onValueChange={(v) => handleFilterChange('paymentStatus', v)}>
                        <SelectTrigger className="w-[160px] h-9 text-xs bg-white shadow-sm border-gray-300">
                            <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Payment: All</SelectItem>
                            <SelectItem value="successful">Successful</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    <button 
                        onClick={fetchOrders}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-50 transition shadow-sm"
                    >
                        Apply Filters
                    </button>
                </div>
            </Container>

            {/* Table Area */}
            <Container containerclass="p-0 border-none rounded-none shadow-none">
                <Table className="bg-white">
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[120px] font-bold text-gray-600 text-xs">ORDER ID</TableHead>
                            <TableHead className="font-bold text-gray-600 text-xs">CUSTOMER</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 text-xs">UNITS</TableHead>
                            <TableHead className="text-right font-bold text-gray-600 text-xs">AMOUNT</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 text-xs">STATUS</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 text-xs">PAYMENT</TableHead>
                            <TableHead className="text-center font-bold text-gray-600 text-xs">DATE</TableHead>
                            <TableHead className="text-right font-bold text-gray-600 text-xs pr-6">TOOLS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingAPI ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-20 text-center text-gray-400 italic">Retrieving order data...</TableCell>
                            </TableRow>
                        ) : orderList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-20 text-center text-gray-400">No matching orders found.</TableCell>
                            </TableRow>
                        ) : (
                            orderList.map((order, idx) => (
                                <TableRow key={idx} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                                    <TableCell className="font-medium text-gray-900 py-4">#{order.orderID}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{order.username || 'N/A'}</span>
                                            <span className="text-xs text-gray-500 lowercase mt-0.5">{order.emailID || 'no email'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                                            {order.itemCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-gray-900">
                                        {formatPrice(order.total)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border ${getStatusStyles(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{order.paymentMode}</span>
                                            <span className={`text-[10px] ${order.paymentStatus === 'successful' ? 'text-emerald-600 font-bold' : 'text-amber-600'}`}>{order.paymentStatus}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/orders/details/${order.orderID}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 rounded-md transition-colors"
                                            >
                                                <IoMdEye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/orders/details/${order.orderID}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 rounded-md transition-colors"
                                            >
                                                <MdEdit size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Professional Pagination */}
                {!loadingAPI && pagination.totalPages > 1 && (
                    <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Showing page {pagination.currentPage} of {pagination.totalPages}</p>
                        <div className="flex gap-1">
                            <button 
                                disabled={!pagination.hasPrev}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button 
                                disabled={!pagination.hasNext}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Container>
        </Layout>
    )
}

export default ListOrders