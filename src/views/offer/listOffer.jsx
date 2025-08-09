import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import { MdEdit } from 'react-icons/md';
import { IoMdEye } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { getPaginatedOffers, getOfferCount } from '../../lib/api/offerApi';

const ListOffers = () => {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
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
            const response = await getPaginatedOffers({
                page,
                limit,
                filters
            });

            console.log(response);

            const offersArray = Array.isArray(response?.data?.data) ? response.data.data : [];
            setOffers(offersArray);
        } catch (error) {
            console.error('Error fetching offers:', error);
            setOffers([]);
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = async () => {
        setPage(1);
        await fetchOfferCount();
        await fetchOffers();
    };

    useEffect(() => {
        fetchOffers();
        fetchOfferCount()
    }, [page]);

    return (
        <Layout title="Offer List" active="admin-offers-list">
            <Container containerclass="bg-transparent">

                {/* 🔍 Filters */}
                <div className="flex gap-4 mb-4 items-center">
                    <InputUi placeholder="Enter Offer ID" datafunction={(e) => handleChange(e, 'offerID')} />
                    <InputUi placeholder="Enter Offer Name" datafunction={(e) => handleChange(e, 'offerName')} />
                    <InputUi placeholder="Enter Offer Type" datafunction={(e) => handleChange(e, 'offerType')} />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                        Search
                    </button>
                </div>

                {/* 📦 Offer Table */}
                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] capitalize">
                            <TableHead className="pl-5">ID</TableHead>
                            <TableHead>Offer Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Buy Count</TableHead>
                            <TableHead className="text-center">Get Count</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-5">Loading offers...</TableCell>
                            </TableRow>
                        ) : offers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-5">No offers found.</TableCell>
                            </TableRow>
                        ) : (
                            offers.map((offer) => (
                                <TableRow className="bg-white" key={offer.offerID}>
                                    <TableCell className="rounded-l-lg pl-5">{offer.offerID}</TableCell>
                                    <TableCell>{offer.offerName}</TableCell>
                                    <TableCell>{offer.offerType}</TableCell>
                                    <TableCell className="text-center">{offer.buyCount}</TableCell>
                                    <TableCell className="text-center">{offer.getCount}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button className="bg-green-600 text-white p-2 rounded-full" onClick={() => navigate(`/offers/edit/${offer.offerID}`)}>
                                                <MdEdit size={16} />
                                            </button>
                                            <button className="bg-blue-600 text-white p-2 rounded-full" onClick={() => navigate(`/offer/details/${offer.offerID}`)}>
                                                <IoMdEye size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* 🔄 Pagination */}
                <div className="flex justify-center mt-6 gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </Container>
        </Layout>
    );
};

export default ListOffers;
