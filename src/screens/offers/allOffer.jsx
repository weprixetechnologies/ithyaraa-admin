import React, { useEffect, useState } from 'react';
import './offer.css';
import Layout from '../../layout';
import DataTable from '../../components/ui/dataTable';
import { useNavigate } from 'react-router-dom';

const offerData = [
    {
        offerId: 'OFF001',
        offerName: 'Buy 2 Get 1 Free - Stationery Special',
        offerBanner: 'https://picsum.photos/seed/stationery/200/100',
        offerLogic: 'Buy 2 products and get 1 free',
        offerSlug: 'buy-2-get-1-free-stationery',
        buyProducts: 'stationery',
        buyAt: '',
        buyNumber: '2',
        getNumbers: '1',
        promotionType: 'buyXgetY'
    },
    {
        offerId: 'OFF002',
        offerName: 'Notebooks @ ₹49 Each - Limited Time',
        offerBanner: 'https://picsum.photos/seed/notebooks/200/100',
        offerLogic: 'Buy up to 5 notebooks at ₹49 each',
        offerSlug: 'notebooks-at-49-each',
        buyProducts: 'notebooks',
        buyAt: '49',
        buyNumber: '5',
        getNumbers: '',
        promotionType: 'buyXgetFixed'
    },
    {
        offerId: 'OFF003',
        offerName: 'Get 2 Markers Free with Every 3 Pens',
        offerBanner: 'https://picsum.photos/seed/pens/200/100',
        offerLogic: 'Buy 3 pens and get 2 markers free',
        offerSlug: 'buy-3-pens-get-2-markers',
        buyProducts: 'pens',
        buyAt: '',
        buyNumber: '3',
        getNumbers: '2',
        promotionType: 'buyXgetY'
    },
    {
        offerId: 'OFF004',
        offerName: 'Color Pencils @ ₹99 for 3 Packs',
        offerBanner: 'https://picsum.photos/seed/colorpencils/200/100',
        offerLogic: 'Buy 3 color pencil packs at ₹99 each',
        offerSlug: 'color-pencils-99-for-3',
        buyProducts: 'color-pencils',
        buyAt: '99',
        buyNumber: '3',
        getNumbers: '',
        promotionType: 'buyXgetFixed'
    },
    {
        offerId: 'OFF005',
        offerName: 'Buy 4 Folders, Get 2 Free',
        offerBanner: 'https://picsum.photos/seed/folders/200/100',
        offerLogic: 'Buy 4 folders and get 2 more free',
        offerSlug: 'buy-4-get-2-folders-free',
        buyProducts: 'folders',
        buyAt: '',
        buyNumber: '4',
        getNumbers: '2',
        promotionType: 'buyXgetY'
    }
];

const AllOffer = () => {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchColumn, setSearchColumn] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const navigate = useNavigate()

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const enhanced = offerData.map((offer) => ({
                ...offer,
                offerBanner: (
                    <img
                        src={offer.offerBanner}
                        alt="Banner"
                        className="offer-table-banner-img"
                    />
                )
            }));
            setOffers(enhanced);
            setIsLoading(false);
        }, 500);
    }, []);

    const removeOffer = (row) => {
        const newOffersList = offers.filter((i) => i.offerId !== row.offerId)
        setOffers(newOffersList)
        console.log(row.offerId);
        console.log(newOffersList);


    }

    const columns = [
        { label: 'Banner', value: 'offerBanner' },
        { label: 'Offer ID', value: 'offerId' },
        { label: 'Offer Name', value: 'offerName' },
        { label: 'Type', value: 'promotionType' },
        { label: 'Logic', value: 'offerLogic' },
        {
            label: 'Buy',
            value: 'buyNumber',
            cellStyle: { textAlign: 'center' } // 👈 Center this column
        },
        {
            label: 'Get',
            value: 'getNumbers',
            cellStyle: { textAlign: 'center' } // 👈 Center this column
        },
        { label: 'Buy At', value: 'buyAt' }
    ];

    const filteredOffers = offers.filter((offer) =>
        typeFilter ? offer.promotionType === typeFilter : true
    );

    return (
        <Layout active={'admin-7b'} title={'All Offers'}>
            <div className="all-offer-section-wrapper">
                {/* 🔍 Filters */}
                <div className="offer-filter-bar">
                    <select
                        className="offer-filter-select"
                        value={searchColumn}
                        onChange={(e) => setSearchColumn(e.target.value)}
                    >
                        <option value="">Search Column</option>
                        <option value="offerName">Offer Name</option>
                        <option value="offerId">Offer ID</option>
                    </select>

                    <input
                        className="offer-filter-input"
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <select
                        className="offer-filter-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="buyXgetY">Buy X Get Y Free</option>
                        <option value="buyXgetFixed">Buy X at Fixed Price</option>
                    </select>
                </div>

                {/* 📋 Table */}
                <DataTable
                    columns={columns}
                    data={filteredOffers}
                    searchQuery={searchQuery}
                    searchColumn={searchColumn}
                    defaultEntries={5}
                    textDisplayMode='double-line'
                    isLoading={isLoading}
                    actions={(row) => (
                        <div className="offer-action-buttons">
                            <button className="offer-edit-btn" onClick={() => navigate(`edit/${row.offerId}`)}>Edit</button>
                            <button className="offer-delete-btn" onClick={() => removeOffer(row)}>Delete</button>
                        </div>
                    )}
                />
            </div>
        </Layout >
    );
};

export default AllOffer;
