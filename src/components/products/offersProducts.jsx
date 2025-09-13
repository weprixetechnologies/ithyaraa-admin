import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import InputUi from '../ui/inputui';

const OfferProducts = ({ setProducts, products }) => {
    const [offerName, setOfferName] = useState('');
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Fetch offers based on input
    const fetchOffers = useCallback(async (name) => {
        try {
            const response = await axiosInstance.get('/offer/search-by-name', {
                params: { name: name.trim() }
            });

            if (response?.data?.result) {
                const formatted = response.data.result?.map((o, i) => ({
                    id: o.offerID?.toString() || `offer${i}`,
                    offername: o.offerName || 'Unnamed Offer'
                }));
                setOffers(formatted);
            }
        } catch (error) {
            console.error('Failed to fetch offers:', error);
        }
    }, []);

    // Initialize from current product's applied offer (for edit screen)
    useEffect(() => {
        const currentOfferIdRaw = products?.offerID ?? products?.offerId;
        const currentOfferName = products?.offerName ?? products?.offer?.offerName;

        const currentOfferId = currentOfferIdRaw?.toString?.();
        const isValidOfferId = (val) => {
            if (val === undefined || val === null) return false;
            const s = String(val).trim().toLowerCase();
            return s !== '' && s !== 'undefined' && s !== 'null' && s !== '0';
        };

        if (isValidOfferId(currentOfferId) || (currentOfferName && currentOfferName.trim() !== '')) {
            setSelectedOffer({
                id: isValidOfferId(currentOfferId) ? currentOfferId : '',
                offername: currentOfferName || 'Unnamed Offer',
            });
        } else {
            setSelectedOffer(null);
        }
    }, [products?.offerID, products?.offerId, products?.offerName]);

    // Debounce offerName input
    useEffect(() => {
        if (!offerName.trim()) {
            setOffers([]);
            // Do not auto-clear the applied offer when simply emptying the search input
            return;
        }

        const delay = setTimeout(() => {
            fetchOffers(offerName);
        }, 400);

        return () => clearTimeout(delay);
    }, [offerName, fetchOffers, setProducts]);

    const handleOfferSelect = (offerId) => {
        const offer = offers.find(o => o.id === offerId);
        if (offer) {
            setSelectedOffer(offer);
            setProducts(prev => ({
                ...prev,
                offerID: offer.id,
                offerName: offer.offername,
            }));
        }
    };

    const handleRemoveOffer = () => {
        setSelectedOffer(null);
        setOfferName('');
        setProducts(prev => ({
            ...prev,
            offerID: '',
            offerName: '',
        }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setOfferName(value);
    };

    return (
        <div className="flex flex-col gap-3">
            {selectedOffer && (
                <div className="w-full py-5 px-5 bg-secondary-text rounded-lg text-white flex items-center justify-between gap-4">
                    <div>
                        <p>Offer ID : <b>{selectedOffer?.id}</b></p>
                        <p>Offer Name : <b>{selectedOffer?.offername}</b></p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveOffer}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                        Remove offer
                    </button>
                </div>
            )}


            <InputUi
                label="Search Offer"
                placeholder="Type to filter offers..."
                value={offerName}
                datafunction={handleSearchChange}
            />

            <Select
                onValueChange={handleOfferSelect}
                value={selectedOffer?.id || ''}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an Offer" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60 overflow-auto">
                    <SelectGroup>
                        <SelectLabel>Matching Offers</SelectLabel>
                        {offers?.length > 0 ? (
                            offers?.map((offer) => (
                                <SelectItem key={offer.id} value={offer.id}>
                                    {offer.offername}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500">
                                No matching offers found.
                            </div>
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default OfferProducts;
