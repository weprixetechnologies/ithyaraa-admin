import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { getPaginatedOffers, getOfferCount, deleteOffer } from '../../lib/api/offerApi';
import {
    RiSearchLine,
    RiRefreshLine,
    RiAddLine,
    RiGiftLine,
    RiPercentLine,
    RiCloseLine,
    RiEditLine,
    RiEyeLine,
    RiDeleteBinLine
} from 'react-icons/ri';
import { toast } from 'react-toastify';

const ListOffers = () => {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState({
        offerID: '',
        offerName: '',
        offerType: ''
    });

    const limit = 10;

    const handleChange = (e, name) => {
        setFilters({ ...filters, [name]: e.target.value });
    };

    const fetchOfferCount = async () => {
        try {
            const { total } = await getOfferCount(filters);
            setTotalPages(Math.ceil(total / limit));
            console.log(total);
            console.log(Math.ceil(total / limit));

        } catch (error) {
            console.error('Error counting offers:', error);
        }
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);
            setRefreshing(true);
            console.log('Fetching offers with params:', { page, limit, filters });

            const response = await getPaginatedOffers({
                page,
                limit,
                filters
            });

            console.log('API Response:', response);
            console.log('Response data:', response?.data);
            console.log('Response data.data:', response?.data?.data);
            console.log('Is array?', Array.isArray(response?.data?.data));

            const offersArray = Array.isArray(response?.data) ? response.data : [];
            console.log('Final offers array:', offersArray);
            setOffers(offersArray);
        } catch (error) {
            console.error('Error fetching offers:', error);
            console.error('Error response:', error.response?.data);
            setOffers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const handleSearch = async () => {
        setPage(1);
        await fetchOfferCount();
        await fetchOffers();
    };

    const handleRefresh = async () => {
        await fetchOfferCount();
        await fetchOffers();
    };

    const handleClearFilters = () => {
        setFilters({
            offerID: '',
            offerName: '',
            offerType: ''
        });
        setPage(1);
    };

    const handleDeleteOffer = async (offerID, offerName) => {
        if (!window.confirm(`Are you sure you want to delete the offer "${offerName || offerID}"? This will also remove the offer from all associated products. This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await deleteOffer(offerID);
            if (response.success) {
                toast.success('Offer deleted successfully');
                // Refresh the offers list
                await fetchOfferCount();
                await fetchOffers();
            } else {
                toast.error(response.message || 'Failed to delete offer');
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            toast.error(error.response?.data?.message || 'Failed to delete offer');
        }
    };

    useEffect(() => {
        fetchOffers();
        fetchOfferCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <Layout title="Offer List" active="admin-offers-list">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
                <Container>
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                                    Offer Management
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    Manage promotional offers and special deals
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    variant="outline"
                                    className="flex items-center gap-2 hover:bg-emerald-50 border-emerald-200 text-emerald-700"
                                >
                                    <RiRefreshLine className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                    <RiAddLine className="w-4 h-4" />
                                    Add Offer
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Offers</p>
                                    <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                                </div>
                                <div className="p-3 bg-emerald-100 rounded-full">
                                    <RiGiftLine className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Buy X Get Y</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {offers.filter(o => o.offerType === 'buy_x_get_y').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <RiGiftLine className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Buy X At X</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {offers.filter(o => o.offerType === 'buy_x_at_x').length}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <RiPercentLine className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Offers</p>
                                    <p className="text-2xl font-bold text-teal-600">
                                        {offers.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-teal-100 rounded-full">
                                    <RiGiftLine className="w-6 h-6 text-teal-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="relative">
                                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <InputUi
                                    placeholder="Enter Offer ID"
                                    datafunction={(e) => handleChange(e, 'offerID')}
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative">
                                <RiGiftLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <InputUi
                                    placeholder="Enter Offer Name"
                                    datafunction={(e) => handleChange(e, 'offerName')}
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative">
                                <RiPercentLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <InputUi
                                    placeholder="Enter Offer Type"
                                    datafunction={(e) => handleChange(e, 'offerType')}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
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
                                <h3 className="text-lg font-semibold text-gray-900">Offers</h3>
                                <div className="text-sm text-gray-500">
                                    Showing {offers.length} offers
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-emerald-50 border-b border-gray-200">
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Offer ID
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Offer Name
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Type
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Buy Count
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Get Count
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
                                                    <p className="text-gray-500 text-lg">Loading offers...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : offers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <RiGiftLine className="w-16 h-16 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-lg font-medium">No offers found</p>
                                                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        offers.map((offer, idx) => (
                                            <TableRow
                                                key={offer.offerID}
                                                className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                                                <span className="text-white font-bold text-sm">
                                                                    {typeof offer.offerID === 'string' ? offer.offerID.slice(-2) : String(offer.offerID || '').slice(-2) || 'ID'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-mono font-medium text-gray-900">
                                                                {offer.offerID || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {offer.offerName || 'Unnamed Offer'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${offer.offerType === 'buy_x_get_y'
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                                        }`}>
                                                        <span>{offer.offerType === 'buy_x_get_y' ? '🎁' : '💰'}</span>
                                                        {offer.offerType ? offer.offerType.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {offer.buyCount}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {offer.getCount}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/offers/edit/${offer.offerID}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                                        >
                                                            <RiEditLine className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/offer/details/${offer.offerID}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                                        >
                                                            <RiEyeLine className="w-4 h-4" />
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteOffer(offer.offerID, offer.offerName)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                                        >
                                                            <RiDeleteBinLine className="w-4 h-4" />
                                                            Delete
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
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1 || loading}
                                        variant="outline"
                                        size="sm"
                                        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                            if (pageNum > totalPages) return null;

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    variant={page === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    className={`w-10 h-10 ${page === pageNum
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'hover:bg-emerald-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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

export default ListOffers;
