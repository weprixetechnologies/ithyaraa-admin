import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Layout from 'src/layout'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/container'
import { IoMdEye } from 'react-icons/io';
import {
    RiSearchLine,
    RiStoreLine,
    RiInboxLine,
    RiArrowDownSLine,
    RiCloseLine,
    RiCheckLine,
    RiFilterLine,
    RiBuildingLine,
    RiGlobalLine,
    RiCheckboxMultipleLine
} from 'react-icons/ri';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom';
import { getBrandOrders, getAllBrands } from '@/lib/api/brandOrdersApi';
import { toast } from 'react-toastify';

// Simple Pagination Component
const SimplePagination = ({ currentPage, totalPages, onPageChange, hasNext, hasPrev }) => {
    const pages = []
    const maxVisiblePages = 5

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
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
            >
                Previous
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm border rounded ${page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-background'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
            >
                Next
            </button>
        </div>
    )
}

const INHOUSE_BRAND = {
    brandID: 'inhouse',
    uid: 'inhouse',
    name: 'Inhouse (Ithyaraa Direct)',
    username: 'inhouse',
    emailID: 'inhouse@ithyaraa.com',
    isInhouse: true
}

const BrandOrders = () => {
    const navigate = useNavigate()

    const [allBrands, setAllBrands] = useState([])
    const [loadingBrands, setLoadingBrands] = useState(false)
    const [orderList, setOrderList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(false)

    // Preset filter mode: 'except_inhouse' | 'only_inhouse' | 'all' | 'custom'
    const [filterType, setFilterType] = useState('except_inhouse')
    const [selectedBrands, setSelectedBrands] = useState([])

    const [brandSearchText, setBrandSearchText] = useState('')
    const [showBrandDropdown, setShowBrandDropdown] = useState(false)
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
    const dropdownRef = useRef(null)

    // Load all brands on mount
    useEffect(() => {
        const fetchAllBrandsList = async () => {
            try {
                setLoadingBrands(true)
                const res = await getAllBrands()
                const brandList = [INHOUSE_BRAND]
                if (res && res.success && Array.isArray(res.data)) {
                    const normalized = res.data.map(b => ({
                        ...b,
                        brandID: b.brandID || b.uid,
                        uid: b.uid || b.brandID,
                        name: b.name || b.username || 'Unnamed Brand'
                    }))
                    brandList.push(...normalized)
                }
                setAllBrands(brandList)
            } catch (err) {
                console.error('Failed to load brands:', err)
            } finally {
                setLoadingBrands(false)
            }
        }
        fetchAllBrandsList()
    }, [])

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowBrandDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Filter brands based on search text in custom selector
    const filteredBrands = useMemo(() => {
        const trimmed = brandSearchText.trim().toLowerCase()
        if (!trimmed) {
            return allBrands
        }
        return allBrands.filter(brand => {
            const nameMatch = brand.name?.toLowerCase().includes(trimmed)
            const usernameMatch = brand.username?.toLowerCase().includes(trimmed)
            const emailMatch = brand.emailID?.toLowerCase().includes(trimmed)
            return nameMatch || usernameMatch || emailMatch
        })
    }, [allBrands, brandSearchText])

    // Fetch orders
    const fetchOrders = useCallback(async (overrides = {}) => {
        const currentFilter = overrides.filterType || filterType
        const currentBrands = overrides.selectedBrands || selectedBrands
        const currentPage = overrides.page || pagination.currentPage

        if (currentFilter === 'custom' && currentBrands.length === 0) {
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
                filterType: currentFilter,
                page: currentPage,
                limit: 10
            }

            if (currentFilter === 'custom') {
                const brandIDsStr = currentBrands.map(b => b.brandID || b.uid).join(',')
                params.brandIDs = brandIDsStr
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
    }, [filterType, selectedBrands, fromDate, toDate, pagination.currentPage])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleFilterTypeChange = (newType) => {
        setFilterType(newType)
        setPagination(prev => ({ ...prev, currentPage: 1 }))
        fetchOrders({ filterType: newType, page: 1 })
    }

    const toggleBrandSelection = (brand) => {
        const brandID = brand.brandID || brand.uid
        setSelectedBrands(prev => {
            const exists = prev.some(b => (b.brandID || b.uid) === brandID)
            let updated
            if (exists) {
                updated = prev.filter(b => (b.brandID || b.uid) !== brandID)
            } else {
                updated = [...prev, brand]
            }
            if (filterType === 'custom') {
                fetchOrders({ filterType: 'custom', selectedBrands: updated, page: 1 })
            }
            return updated
        })
    }

    const handleSelectAllBrands = () => {
        setSelectedBrands([...allBrands])
        if (filterType === 'custom') {
            fetchOrders({ filterType: 'custom', selectedBrands: allBrands, page: 1 })
        }
    }

    const handleClearAllBrands = () => {
        setSelectedBrands([])
        if (filterType === 'custom') {
            setOrderList([])
        }
    }

    const handleRemoveBrandChip = (brandID) => {
        const updated = selectedBrands.filter(b => (b.brandID || b.uid) !== brandID)
        setSelectedBrands(updated)
        if (filterType === 'custom') {
            fetchOrders({ filterType: 'custom', selectedBrands: updated, page: 1 })
        }
    }

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }))
        fetchOrders({ page: 1 })
    }

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }))
        fetchOrders({ page })
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
            default: return 'bg-gray-100 text-foreground'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'successful': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'refunded': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-foreground'
        }
    }

    return (
        <Layout active="admin-brand-orders" title={'Brand Orders'}>
            <Container containerclass={'bg-transparent'}>
                {/* Search & Filter Options Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col gap-5">

                        {/* Quick Presets Section */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                                Brand Filter Mode
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleFilterTypeChange('except_inhouse')}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                        filterType === 'except_inhouse'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <RiFilterLine size={15} />
                                    All Brands Except Inhouse
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterTypeChange('only_inhouse')}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                        filterType === 'only_inhouse'
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <RiBuildingLine size={15} />
                                    Show Only Inhouse
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterTypeChange('all')}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                        filterType === 'all'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <RiGlobalLine size={15} />
                                    All Orders (Global)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterTypeChange('custom')}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                        filterType === 'custom'
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <RiCheckboxMultipleLine size={15} />
                                    Custom Brand Selection {selectedBrands.length > 0 && `(${selectedBrands.length})`}
                                </button>
                            </div>
                        </div>

                        {/* Multi-Brand Custom Selector (Active when Custom Mode selected) */}
                        {filterType === 'custom' && (
                            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-secondary-text">Select Brands (Multiple Allowed)</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSelectAllBrands}
                                            className="text-[11px] text-blue-600 hover:underline font-medium"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-gray-300 text-xs">|</span>
                                        <button
                                            type="button"
                                            onClick={handleClearAllBrands}
                                            className="text-[11px] text-red-500 hover:underline font-medium"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Brands Chips */}
                                {selectedBrands.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-1">
                                        {selectedBrands.map(b => (
                                            <span
                                                key={b.brandID || b.uid}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    b.isInhouse
                                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}
                                            >
                                                {b.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBrandChip(b.brandID || b.uid)}
                                                    className="hover:text-red-600 rounded-full p-0.5"
                                                >
                                                    <RiCloseLine size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Dropdown Input Container */}
                                <div className="relative" ref={dropdownRef}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            placeholder="Search and select brands..."
                                            value={brandSearchText}
                                            onChange={(e) => {
                                                setBrandSearchText(e.target.value)
                                                setShowBrandDropdown(true)
                                            }}
                                            onFocus={() => setShowBrandDropdown(true)}
                                            className="w-full p-2 pr-10 rounded-[10px] border border-gray-300 text-xs h-[38px] focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowBrandDropdown(prev => !prev)}
                                            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <RiArrowDownSLine size={18} className={`transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Dropdown Menu with Checkboxes */}
                                    {showBrandDropdown && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            {loadingBrands ? (
                                                <div className="p-4 text-center text-gray-500 text-xs">
                                                    Loading brands...
                                                </div>
                                            ) : filteredBrands.length > 0 ? (
                                                filteredBrands.map((brand, index) => {
                                                    const brandID = brand.brandID || brand.uid
                                                    const isChecked = selectedBrands.some(b => (b.brandID || b.uid) === brandID)

                                                    return (
                                                        <div
                                                            key={brandID || index}
                                                            onClick={() => toggleBrandSelection(brand)}
                                                            className={`px-3.5 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between transition-colors ${
                                                                isChecked ? 'bg-blue-50/70' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => {}} // Handled by container onClick
                                                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-xs text-gray-900 flex items-center gap-1.5">
                                                                        {brand.isInhouse ? (
                                                                            <RiBuildingLine className="text-indigo-500" size={14} />
                                                                        ) : (
                                                                            <RiStoreLine className="text-gray-400" size={14} />
                                                                        )}
                                                                        {brand.name}
                                                                    </div>
                                                                    {brand.emailID && (
                                                                        <div className="text-[11px] text-gray-500 pl-5">
                                                                            {brand.emailID}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isChecked && (
                                                                <RiCheckLine className="text-blue-600" size={16} />
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 text-xs">
                                                    No matching brands found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Date Filters & Action Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-end pt-3 border-t border-gray-100">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-secondary-text mb-1.5 block">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs h-[38px]"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-secondary-text mb-1.5 block">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs h-[38px]"
                                />
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {(fromDate || toDate) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFromDate('')
                                            setToDate('')
                                            fetchOrders({ page: 1 })
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 h-[38px] font-medium"
                                    >
                                        Clear Dates
                                    </button>
                                )}
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 h-[38px] font-semibold transition-colors"
                                >
                                    Filter Orders
                                </button>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-4 text-xs text-secondary-text pt-3 border-t border-gray-100 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Mode:</span>
                                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-medium">
                                    {filterType === 'except_inhouse' && 'All Except Inhouse'}
                                    {filterType === 'only_inhouse' && 'Only Inhouse'}
                                    {filterType === 'all' && 'All Brands'}
                                    {filterType === 'custom' && `Custom (${selectedBrands.length} Selected)`}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <span>Total Orders: <strong className="text-gray-900">{pagination.totalOrders}</strong></span>
                                <span>Page <strong className="text-gray-900">{pagination.currentPage}</strong> of <strong className="text-gray-900">{pagination.totalPages}</strong></span>
                            </div>
                        </div>

                    </div>
                </div>
            </Container>

            {/* Custom Mode Empty Selection Notice */}
            {filterType === 'custom' && selectedBrands.length === 0 && (
                <Container containerclass="bg-transparent">
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="max-w-md w-full text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                                    <RiCheckboxMultipleLine className="text-purple-500" size={32} />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Select Brands to View Orders
                            </h3>
                            <p className="text-gray-500 text-xs">
                                Use the dropdown above to choose one or multiple brands for custom filtering.
                            </p>
                        </div>
                    </div>
                </Container>
            )}

            {/* Orders Table */}
            {(filterType !== 'custom' || selectedBrands.length > 0) && (
                <Container containerclass="bg-transparent">
                    <Table className="border-separate border-spacing-y-2">
                        <TableHeader>
                            <TableRow className="text-unique text-[14px] uppercase">
                                <TableHead className="pl-5">ORDER ID</TableHead>
                                <TableHead className="text-left pl-6">Customer</TableHead>
                                <TableHead className="text-left">Brand(s)</TableHead>
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

                            {orderList?.length > 0 && !loadingAPI &&
                                orderList?.map((order, index) => {
                                    const isExpanded = expandedOrders.has(order.orderID)
                                    const brandNames = order.brandNames ? order.brandNames.split(', ') : [order.brandName || 'Inhouse']

                                    return (
                                        <React.Fragment key={index}>
                                            <TableRow className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <TableCell className="rounded-l-[10px] font-bold py-4 pl-5">
                                                    #{order.orderID}
                                                </TableCell>
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-xs text-gray-900">{order.customerName || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {brandNames.map((bn, bIdx) => (
                                                            <span
                                                                key={bIdx}
                                                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                                                    bn === 'Inhouse'
                                                                        ? 'bg-purple-100 text-purple-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                }`}
                                                            >
                                                                {bn}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {order.itemCount}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-4 font-semibold text-xs text-gray-900">
                                                    {formatPrice(order.brandOrderAmount)}
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${getStatusColor(order.orderStatus)}`}>
                                                        {order.orderStatus || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-xs font-medium">{order.paymentMode || 'N/A'}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                            {order.paymentStatus || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-4 text-xs">
                                                    {formatDate(order.orderDate)}
                                                </TableCell>
                                                <TableCell className="rounded-r-[10px] text-center pr-5">
                                                    <div className="flex justify-center items-center">
                                                        <button
                                                            className='bg-blue-600 border-none text-white p-2 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors'
                                                            onClick={() => toggleOrderExpansion(order.orderID)}
                                                            title={isExpanded ? "Hide Items" : "Show Items"}
                                                        >
                                                            <IoMdEye style={{ width: '16px', height: '16px' }} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Order Items */}
                                            {isExpanded && order.items && order.items.length > 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="bg-gray-50/60 p-0">
                                                        <div className="p-4 border-l-4 border-blue-500 my-2">
                                                            <h4 className="font-semibold text-xs text-gray-700 mb-3 flex items-center gap-1.5">
                                                                <RiStoreLine size={16} className="text-blue-600" />
                                                                Order Items Breakdown
                                                            </h4>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="border-b bg-gray-100/70 text-gray-600">
                                                                            <th className="text-left p-2">Product</th>
                                                                            <th className="text-left p-2">Brand</th>
                                                                            <th className="text-left p-2">Variation</th>
                                                                            <th className="text-center p-2">Qty</th>
                                                                            <th className="text-right p-2">Unit Price</th>
                                                                            <th className="text-right p-2">Line Total</th>
                                                                            <th className="text-center p-2">Item Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                                        {order.items.map((item, itemIndex) => (
                                                                            <tr key={itemIndex} className="hover:bg-gray-50">
                                                                                <td className="p-2 font-medium">{item.name}</td>
                                                                                <td className="p-2">
                                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                                                                        (item.brandName || 'Inhouse') === 'Inhouse'
                                                                                            ? 'bg-purple-100 text-purple-800'
                                                                                            : 'bg-blue-100 text-blue-800'
                                                                                    }`}>
                                                                                        {item.brandName || 'Inhouse'}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="p-2 text-gray-500">{item.variationName || 'N/A'}</td>
                                                                                <td className="text-center p-2">{item.quantity}</td>
                                                                                <td className="text-right p-2">{formatPrice(item.unitPriceAfter)}</td>
                                                                                <td className="text-right p-2 font-semibold text-gray-900">{formatPrice(item.lineTotalAfter)}</td>
                                                                                <td className="text-center p-2">
                                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusColor(item.itemStatus)}`}>
                                                                                        {item.itemStatus || 'N/A'}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot>
                                                                        <tr className="font-semibold bg-gray-50">
                                                                            <td colSpan={5} className="text-right p-2 text-gray-700">Total Filtered Amount:</td>
                                                                            <td className="text-right p-2 text-blue-600 font-bold">{formatPrice(order.brandOrderAmount)}</td>
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

                            {!loadingAPI && orderList?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="px-6 py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <RiInboxLine className="text-gray-400" size={32} />
                                            </div>
                                            <p className="text-gray-500 text-base font-medium mb-1">No orders found</p>
                                            <p className="text-gray-400 text-xs">
                                                {fromDate || toDate
                                                    ? "Try expanding the date range or choosing a different brand filter."
                                                    : "No orders match the selected brand criteria."}
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

export default BrandOrders
