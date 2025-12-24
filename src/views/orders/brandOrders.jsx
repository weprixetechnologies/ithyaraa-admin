import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/container'
import { IoMdEye } from 'react-icons/io';
import { RiShoppingCart2Line, RiSearchLine, RiStoreLine, RiInboxLine } from 'react-icons/ri';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom';
import { searchBrands, getBrandOrders } from '@/lib/api/brandOrdersApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const BrandOrders = () => {
    const navigate = useNavigate()

    const [orderList, setOrderList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(false)
    const [brandSearchText, setBrandSearchText] = useState('')
    const [brandSearchResults, setBrandSearchResults] = useState([])
    const [selectedBrand, setSelectedBrand] = useState(null)
    const [showBrandDropdown, setShowBrandDropdown] = useState(false)
    const [searching, setSearching] = useState(false)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
    })
    const [expandedOrders, setExpandedOrders] = useState(new Set())

    // Search brands
    const handleBrandSearch = useCallback(async (searchText) => {
        const trimmedText = searchText?.trim() || ''

        if (trimmedText.length < 2) {
            setBrandSearchResults([])
            setShowBrandDropdown(false)
            setSearching(false)
            return
        }

        try {
            setSearching(true)
            console.log('Searching for brands with:', trimmedText)
            const response = await searchBrands(trimmedText)
            console.log('Search response:', response)

            if (response && response.success) {
                const results = response.data || []
                setBrandSearchResults(results)
                setShowBrandDropdown(results.length > 0)
                console.log('Found brands:', results.length)
            } else {
                console.warn('Unexpected response format:', response)
                setBrandSearchResults([])
                setShowBrandDropdown(false)
            }
        } catch (error) {
            console.error('Error searching brands:', error)
            console.error('Error details:', error.response?.data || error.message)
            toast.error(error.response?.data?.message || 'Failed to search brands')
            setBrandSearchResults([])
            setShowBrandDropdown(false)
        } finally {
            setSearching(false)
        }
    }, [])

    // Debounce brand search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (brandSearchText) {
                handleBrandSearch(brandSearchText)
            } else {
                setBrandSearchResults([])
                setShowBrandDropdown(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [brandSearchText, handleBrandSearch])

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        if (!selectedBrand) {
            setOrderList([])
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalOrders: 0,
                hasNext: false,
                hasPrev: false
            })
            return
        }

        try {
            setLoadingAPI(true)
            const params = {
                brandID: selectedBrand.brandID,
                page: pagination.currentPage,
                limit: 10
            }

            if (fromDate) params.fromDate = fromDate
            if (toDate) params.toDate = toDate

            const response = await getBrandOrders(params)
            if (response.success) {
                setOrderList(response.data || [])
                setPagination(response.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalOrders: 0,
                    hasNext: false,
                    hasPrev: false
                })
            }
        } catch (error) {
            console.error('Error fetching brand orders:', error)
            toast.error(error.response?.data?.message || 'Failed to fetch orders')
            setOrderList([])
        } finally {
            setLoadingAPI(false)
        }
    }, [selectedBrand, fromDate, toDate, pagination.currentPage])

    useEffect(() => {
        if (selectedBrand) {
            fetchOrders()
        }
    }, [selectedBrand, fromDate, toDate, pagination.currentPage, fetchOrders])

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand)
        setBrandSearchText(brand.name)
        setBrandSearchResults([])
        setShowBrandDropdown(false)
        setPagination(prev => ({ ...prev, currentPage: 1 }))
    }

    const handleSearch = () => {
        if (!selectedBrand) {
            toast.error('Please select a brand first')
            return
        }
        setPagination(prev => ({ ...prev, currentPage: 1 }))
        fetchOrders()
    }

    // Check if search button should be enabled
    const isSearchEnabled = selectedBrand && brandSearchText.trim().length >= 2

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }))
    }

    const toggleOrderExpansion = (orderID) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(orderID)) {
                newSet.delete(orderID)
            } else {
                newSet.add(orderID)
            }
            return newSet
        })
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
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'preparing': return 'bg-yellow-100 text-yellow-800'
            case 'shipped': return 'bg-blue-100 text-blue-800'
            case 'shipping': return 'bg-blue-100 text-blue-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'returned': return 'bg-orange-100 text-orange-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
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

    return (
        <Layout active="admin-brand-orders" title={'Brand Orders'}>
            <Container containerclass={'bg-transaparent'}>
                {/* Search Section - Card Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Brand Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search Brand by Name..."
                                    value={brandSearchText}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setBrandSearchText(value)
                                        if (!value) {
                                            setSelectedBrand(null)
                                            setOrderList([])
                                            setShowBrandDropdown(false)
                                            setBrandSearchResults([])
                                        }
                                    }}
                                    onFocus={() => {
                                        if (brandSearchResults.length > 0) {
                                            setShowBrandDropdown(true)
                                        }
                                    }}
                                    onBlur={() => {
                                        // Delay hiding dropdown to allow click events
                                        setTimeout(() => setShowBrandDropdown(false), 200)
                                    }}
                                    className="w-full p-2 rounded-[10px] border border-grey text-xs tracking-wideset h-[35px]"
                                />
                                {searching && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                                        Searching...
                                    </div>
                                )}
                                {showBrandDropdown && brandSearchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {brandSearchResults.map((brand, index) => (
                                            <div
                                                key={brand.brandID || index}
                                                onMouseDown={(e) => {
                                                    // Prevent blur event from firing
                                                    e.preventDefault()
                                                }}
                                                onClick={() => handleBrandSelect(brand)}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                            >
                                                <div className="font-medium">{brand.name}</div>
                                                {brand.emailID && (
                                                    <div className="text-sm text-gray-500">{brand.emailID}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showBrandDropdown && !searching && brandSearchResults.length === 0 && brandSearchText.trim().length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                                        No brands found
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Search by registered brand name</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={!isSearchEnabled}
                                className="shrink-0 px-6 py-2 bg-blue-600 text-white rounded text-[12px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-[35px]"
                            >
                                Search
                            </button>
                        </div>

                        {/* Selected Brand Info */}
                        {selectedBrand && (
                            <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                                <span className="font-medium">Selected Brand:</span> <span className="text-blue-600">{selectedBrand.name}</span>
                            </div>
                        )}

                        {/* Stats */}
                        {selectedBrand && (
                            <div className="flex gap-4 text-sm text-gray-600 pt-2 border-t border-gray-200">
                                <span className="font-medium">Total Orders: <span className="text-gray-900">{pagination.totalOrders}</span></span>
                                <span className="font-medium">Page: <span className="text-gray-900">{pagination.currentPage} of {pagination.totalPages}</span></span>
                            </div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Initial Empty State - Before Brand Search */}
            {!selectedBrand && (
                <Container containerclass="bg-transparent">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="max-w-md w-full text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <RiSearchLine className="text-gray-400" size={40} />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Search a Brand to View Orders
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Enter a brand name above to view brand-wise orders and revenue.
                            </p>
                        </div>
                    </div>
                </Container>
            )}

            {/* Orders Table - Only show when brand is selected */}
            {selectedBrand && (
                <Container containerclass="bg-transparent">
                    <Table className="border-separate border-spacing-y-2">
                        <TableHeader>
                            <TableRow className="text-unique text-[16px] uppercase">
                                <TableHead className="pl-5">ORDER ID</TableHead>
                                <TableHead className="text-left pl-10">Customer</TableHead>
                                <TableHead className="text-center">Items</TableHead>
                                <TableHead className="text-center">Brand Amount</TableHead>
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
                                orderList?.map((order, index) => {
                                    const isExpanded = expandedOrders.has(order.orderID)
                                    return (
                                        <React.Fragment key={index}>
                                            <TableRow className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                                <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                                    #{order.orderID}
                                                </TableCell>
                                                <TableCell className="text-center py-5 pl-10">
                                                    <div className="flex gap-2 justify-start items-center">
                                                        <div className="flex flex-col justify-start items-start text-right">
                                                            <p className='text-right font-medium'>{order.customerName || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-5">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                        {order.itemCount}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-5 font-medium">
                                                    {formatPrice(order.brandOrderAmount)}
                                                </TableCell>
                                                <TableCell className="text-center py-5">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                        {order.orderStatus || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">{order.paymentMode || 'N/A'}</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                            {order.paymentStatus || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-5 text-sm">
                                                    {formatDate(order.orderDate)}
                                                </TableCell>
                                                <TableCell className="rounded-r-[10px] text-center pr-5">
                                                    <div className="flex-center gap-2">
                                                        <button
                                                            className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700'
                                                            onClick={() => toggleOrderExpansion(order.orderID)}
                                                            title={isExpanded ? "Hide Items" : "Show Items"}
                                                        >
                                                            <IoMdEye style={{ width: '16px', height: '16px' }} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && order.items && order.items.length > 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="bg-gray-50">
                                                        <div className="p-4">
                                                            <h4 className="font-semibold mb-3">Order Items (Brand Only)</h4>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="border-b">
                                                                            <th className="text-left p-2">Product</th>
                                                                            <th className="text-left p-2">Variation</th>
                                                                            <th className="text-center p-2">Quantity</th>
                                                                            <th className="text-right p-2">Unit Price</th>
                                                                            <th className="text-right p-2">Line Total</th>
                                                                            <th className="text-center p-2">Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {order.items.map((item, itemIndex) => (
                                                                            <tr key={itemIndex} className="border-b">
                                                                                <td className="p-2">{item.name}</td>
                                                                                <td className="p-2">{item.variationName || 'N/A'}</td>
                                                                                <td className="text-center p-2">{item.quantity}</td>
                                                                                <td className="text-right p-2">{formatPrice(item.unitPriceAfter)}</td>
                                                                                <td className="text-right p-2 font-medium">{formatPrice(item.lineTotalAfter)}</td>
                                                                                <td className="text-center p-2">
                                                                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.itemStatus)}`}>
                                                                                        {item.itemStatus || 'N/A'}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot>
                                                                        <tr className="font-semibold">
                                                                            <td colSpan={4} className="text-right p-2">Total:</td>
                                                                            <td className="text-right p-2">{formatPrice(order.brandOrderAmount)}</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    )
                                })
                            }
                            {!loadingAPI && orderList?.length === 0 && selectedBrand && (
                                <TableRow>
                                    <TableCell colSpan={8} className="px-6 py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <RiInboxLine className="text-gray-400" size={32} />
                                            </div>
                                            <p className="text-gray-500 text-lg font-medium mb-1">No orders found for this brand</p>
                                            <p className="text-gray-400 text-sm">
                                                {fromDate || toDate
                                                    ? "Try changing the date range or search another brand."
                                                    : "This brand has no orders yet."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Container>
            )}

            {/* Pagination */}
            {selectedBrand && !loadingAPI && pagination.totalPages > 1 && (
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

export default BrandOrders

