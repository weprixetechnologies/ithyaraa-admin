import React, { useEffect, useState, useCallback } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { IoMdEye } from 'react-icons/io';
import { getAffiliates } from '@/lib/api/affiliatesApi';

const ListAffiliates = () => {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loadingAPI, setLoadingAPI] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalAffiliates: 0,
        hasNext: false,
        hasPrev: false
    });

    const fetchAffiliates = useCallback(async () => {
        try {
            setLoadingAPI(true);
            setError('');
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.status) params.status = filters.status;
            params.page = filters.page;
            params.limit = filters.limit;

            const res = await getAffiliates(params);
            if (res.success) {
                setList(res.data || []);
                setPagination(res.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalAffiliates: 0,
                    hasNext: false,
                    hasPrev: false
                });
            } else {
                setError(res.error || 'Failed to fetch affiliates');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch affiliates');
        } finally {
            setLoadingAPI(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAffiliates();
    }, [fetchAffiliates]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'approved') return 'bg-green-100 text-green-800';
        if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-foreground';
    };

    return (
        <Layout active="admin-affiliates-list" title="List Affiliate Users">
            <Container containerclass="bg-transparent">
                <div className="flex flex-col gap-4">
                    <div className="flex w-full items-center gap-4 flex-wrap">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow w-full">
                            <InputUi
                                placeholder="Search by Name, Email, Phone, or UID"
                                value={filters.search}
                                datafunction={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text h-[35px] my-1"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>
                        <button
                            onClick={() => fetchAffiliates()}
                            className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded text-[12px] hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </Container>

            {error && (
                <div className="mx-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">UID</TableHead>
                            <TableHead className="text-left pl-10">Name</TableHead>
                            <TableHead className="text-left">Phone</TableHead>
                            <TableHead className="text-center">Email</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Balance</TableHead>
                            <TableHead className="text-center">Joined</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                        {loadingAPI && list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="rounded-[10px]">
                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {list.length > 0 && !loadingAPI && list.map((row) => (
                            <TableRow key={row.uid} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">{row.uid}</TableCell>
                                <TableCell className="py-5 pl-10">{row.name || 'N/A'}</TableCell>
                                <TableCell className="py-5">{row.phonenumber || 'N/A'}</TableCell>
                                <TableCell className="text-center py-5 max-w-[200px] truncate">
                                    {row.emailID || 'N/A'}
                                </TableCell>
                                <TableCell className="text-center py-5">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(row.affiliateStatus)}`}>
                                        {row.affiliateStatus || 'N/A'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center py-5 font-medium">
                                    {formatPrice(row.balance)}
                                </TableCell>
                                <TableCell className="text-center py-5 text-sm">{formatDate(row.createdOn)}</TableCell>
                                <TableCell className="rounded-r-[10px] text-center pr-5">
                                    <button
                                        className="bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700"
                                        onClick={() => navigate(`/affiliates/details/${row.uid}`)}
                                        title="View Details"
                                    >
                                        <IoMdEye style={{ width: '16px', height: '16px' }} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!loadingAPI && list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        No affiliate users found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {!loadingAPI && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-2 text-sm">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
                        >
                            Next
                        </button>
                    </div>
                )}

                {!loadingAPI && (
                    <div className="text-center mt-4 text-sm text-secondary-text">
                        Total: {pagination.totalAffiliates} affiliate(s)
                    </div>
                )}
            </Container>
        </Layout>
    );
};

export default ListAffiliates;
