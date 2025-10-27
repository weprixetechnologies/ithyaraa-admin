import React, { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Layout from 'src/layout';
import { getFilteredCoupons, getCouponCount } from '../../lib/api/couponsApi';
import {
    RiSearchLine,
    RiRefreshLine,
    RiAddLine,
    RiCouponLine,
    RiUserLine,
    RiPercentLine,
    RiCloseLine,
    RiEditLine,
    RiEyeLine
} from 'react-icons/ri';

const ListCoupons = () => {
    const [filters, setFilters] = useState({
        couponCode: '',
        assignedUser: '',
        discountType: '',
        discountValue: '',
    });

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10;

    const totalPages = Math.ceil(totalCount / limit);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const fetchCoupons = async (overrideFilters = filters, pageToFetch = page) => {
        try {
            setLoading(true);
            setRefreshing(true);
            const data = await getFilteredCoupons({ ...overrideFilters, page: pageToFetch, limit });

            if (data.success) {
                setCoupons(data.data);
            } else {
                setCoupons([]);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setCoupons([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchCount = async (overrideFilters = filters) => {
        try {
            const data = await getCouponCount(overrideFilters);
            if (data.success) {
                setTotalCount(data.total);
            } else {
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching count:', error);
            setTotalCount(0);
        }
    };

    const handleSearch = async () => {
        setPage(1);
        await fetchCount(filters);
        await fetchCoupons(filters, 1);
    };

    const handleRefresh = async () => {
        await fetchCount(filters);
        await fetchCoupons(filters, page);
    };

    const handleClearFilters = () => {
        setFilters({
            couponCode: '',
            assignedUser: '',
            discountType: '',
            discountValue: '',
        });
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || loading) return;
        setPage(newPage);
        fetchCoupons(filters, newPage);
    };

    useEffect(() => {
        fetchCount(filters);
        fetchCoupons(filters, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Layout active={'admin-coupons-list'} title={'All Coupons - Super Admin'}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
                <Container>
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-red-900 bg-clip-text text-transparent">
                                    Coupon Management
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    Manage discount coupons and promotional codes
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    variant="outline"
                                    className="flex items-center gap-2 hover:bg-orange-50 border-orange-200 text-orange-700"
                                >
                                    <RiRefreshLine className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                                    <RiAddLine className="w-4 h-4" />
                                    Add Coupon
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <RiCouponLine className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Percentage Coupons</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {coupons.filter(c => c.discountType === 'percentage').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <RiPercentLine className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Flat Rate Coupons</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {coupons.filter(c => c.discountType === 'flat').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <RiCouponLine className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Assigned Coupons</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {coupons.filter(c => c.assignedUser).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <RiUserLine className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="relative">
                                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <InputUi
                                    label="Coupon Code"
                                    value={filters.couponCode}
                                    datafunction={(val) => handleFilterChange('couponCode', val.target.value)}
                                    placeholder="Enter coupon code"
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative">
                                <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <InputUi
                                    label="Assigned User"
                                    value={filters.assignedUser}
                                    datafunction={(val) => handleFilterChange('assignedUser', val.target.value)}
                                    placeholder="Enter user"
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Discount Type</label>
                                <select
                                    className="border border-gray-200 px-3 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    value={filters.discountType}
                                    onChange={(e) => handleFilterChange('discountType', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="flat">Flat</option>
                                </select>
                            </div>
                            <div className="relative">
                                <RiPercentLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <InputUi
                                    label="Discount Value"
                                    type="number"
                                    value={filters.discountValue}
                                    datafunction={(val) => handleFilterChange('discountValue', val.target.value)}
                                    placeholder="Enter value"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
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
                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="px-6 py-3 text-gray-600 border-gray-200 hover:bg-gray-50"
                            >
                                <RiCloseLine className="w-4 h-4 mr-2" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                    {/* Main Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Coupons</h3>
                                <div className="text-sm text-gray-500">
                                    Showing {coupons.length} of {totalCount} coupons
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-orange-50 border-b border-gray-200">
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Coupon ID
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Coupon Code
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Assigned User
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Usage
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Limit
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Value
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Type
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
                                                    <p className="text-gray-500 text-lg">Loading coupons...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : coupons.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <RiCouponLine className="w-16 h-16 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-lg font-medium">No coupons found</p>
                                                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        coupons.map((coupon, idx) => (
                                            <TableRow
                                                key={coupon.couponID}
                                                className={`hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                                                                <span className="text-white font-bold text-sm">
                                                                    {typeof coupon.couponID === 'string' ? coupon.couponID.slice(-2) : String(coupon.couponID || '').slice(-2) || 'ID'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-mono font-medium text-gray-900">
                                                                {coupon.couponID || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {coupon.couponCode || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {coupon.assignedUser ? (
                                                            <>
                                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-3">
                                                                    <RiUserLine className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {coupon.assignedUser}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Unassigned</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {coupon.couponUsage || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm text-gray-900">
                                                        {coupon.couponLimit || '∞'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {coupon.discountValue}
                                                        {coupon.discountType === 'percentage' ? '%' : '₹'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${coupon.discountType === 'percentage'
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                                        }`}>
                                                        <span>{coupon.discountType === 'percentage' ? '%' : '₹'}</span>
                                                        {coupon.discountType}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`http://192.168.1.12:3000/coupons/edit/${coupon.couponID}`, '_blank')}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                                        >
                                                            <RiEditLine className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`http://192.168.1.12:3000/coupons/details/${coupon.couponID}`, '_blank')}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                                        >
                                                            <RiEyeLine className="w-4 h-4" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>



                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page <span className="font-semibold">{page}</span> of{' '}
                                    <span className="font-semibold">{totalPages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1 || loading}
                                        variant="outline"
                                        size="sm"
                                        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const pageButtons = [];
                                            const maxPagesToShow = 5;
                                            let startPage = Math.max(1, page - 2);
                                            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                                            if (endPage - startPage < maxPagesToShow - 1) {
                                                startPage = Math.max(1, endPage - maxPagesToShow + 1);
                                            }

                                            for (let i = startPage; i <= endPage; i++) {
                                                pageButtons.push(
                                                    <Button
                                                        key={i}
                                                        onClick={() => handlePageChange(i)}
                                                        variant={page === i ? "default" : "outline"}
                                                        size="sm"
                                                        className={`w-10 h-10 ${page === i
                                                            ? 'bg-orange-600 text-white'
                                                            : 'hover:bg-orange-50'
                                                            }`}
                                                        disabled={loading}
                                                    >
                                                        {i}
                                                    </Button>
                                                );
                                            }
                                            return pageButtons;
                                        })()}
                                    </div>

                                    <Button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages || loading}
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
                </Container>
            </div>
        </Layout>
    );
};

export default ListCoupons;
