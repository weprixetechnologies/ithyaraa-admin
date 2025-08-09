import React, { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Layout from 'src/layout';
import { getFilteredCoupons, getCouponCount } from '../../lib/api/couponsApi';

const ListCoupons = () => {
    const [filters, setFilters] = useState({
        couponCode: '',
        assignedUser: '',
        discountType: '',
        discountValue: '',
    });

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
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

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || loading) return;
        setPage(newPage);
        fetchCoupons(filters, newPage);
    };

    useEffect(() => {
        fetchCount(filters);
        fetchCoupons(filters, 1);
    }, []);

    return (
        <Layout active={'admin-coupons-list'} title={'All Coupons - Super Admin'}>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <InputUi
                    label="Coupon Code"
                    value={filters.couponCode}
                    datafunction={(val) => handleFilterChange('couponCode', val.target.value)}
                    placeholder="Enter coupon code"
                />
                <InputUi
                    label="Assigned User"
                    value={filters.assignedUser}
                    datafunction={(val) => handleFilterChange('assignedUser', val.target.value)}
                    placeholder="Enter user"
                />
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Discount Type</label>
                    <select
                        className="border px-2 py-1 rounded bg-white text-black"
                        value={filters.discountType}
                        onChange={(e) => handleFilterChange('discountType', e.target.value)}
                    >
                        <option value="">Select Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                    </select>
                </div>
                <InputUi
                    label="Discount Value"
                    type="number"
                    value={filters.discountValue}
                    datafunction={(val) => handleFilterChange('discountValue', val.target.value)}
                    placeholder="Enter value"
                />
            </div>

            {/* Search Button */}
            <div className="mb-4">
                <button
                    onClick={handleSearch}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            <Container containerclass="bg-transparent">
                {/* Filters */}

                {/* Table */}
                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-primary-dark">
                            <TableHead className="pl-4">Coupon ID</TableHead>
                            <TableHead>Coupon Code</TableHead>
                            <TableHead>Assigned User</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Limit</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.length > 0 ? (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.couponID} className="bg-white">
                                    <TableCell className="pl-4 py-4 rounded-l-lg">{coupon.couponID}</TableCell>
                                    <TableCell className="py-4">{coupon.couponCode}</TableCell>
                                    <TableCell className="py-4">{coupon.assignedUser || '-'}</TableCell>
                                    <TableCell className="py-4">{coupon.couponUsage}</TableCell>
                                    <TableCell className="py-4">{coupon.couponLimit || 'Infinite'}</TableCell>
                                    <TableCell className="py-4">{coupon.discountValue}</TableCell>
                                    <TableCell className="py-4 rounded-r-lg">{coupon.discountType}</TableCell>
                                    <TableCell className="text-primary">
                                        <a href={`http://localhost:3000/coupons/edit/${coupon.couponID}`}>EDIT</a>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    {loading ? 'Loading...' : 'No coupons found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>



                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2 items-center text-sm">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                            className={`px-3 py-1 rounded border ${page === 1 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                                }`}
                        >
                            Prev
                        </button>

                        {/* Dynamic Page Numbers */}
                        {(() => {
                            const pageButtons = [];
                            const maxPagesToShow = 3;
                            let startPage = Math.max(1, page - 1);
                            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                            if (endPage - startPage < maxPagesToShow - 1) {
                                startPage = Math.max(1, endPage - maxPagesToShow + 1);
                            }

                            if (startPage > 1) {
                                pageButtons.push(
                                    <button
                                        key="start-ellipsis"
                                        disabled
                                        className="px-2 py-1 text-gray-400"
                                    >
                                        ...
                                    </button>
                                );
                            }

                            for (let i = startPage; i <= endPage; i++) {
                                pageButtons.push(
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={`px-3 py-1 rounded border ${page === i ? 'bg-black text-white' : 'hover:bg-gray-100'
                                            }`}
                                        disabled={loading}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            if (endPage < totalPages) {
                                pageButtons.push(
                                    <button
                                        key="end-ellipsis"
                                        disabled
                                        className="px-2 py-1 text-gray-400"
                                    >
                                        ...
                                    </button>
                                );
                            }

                            return pageButtons;
                        })()}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages || loading}
                            className={`px-3 py-1 rounded border ${page === totalPages || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}



            </Container>

        </Layout>
    );
};

export default ListCoupons;
