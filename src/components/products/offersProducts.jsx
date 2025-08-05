import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

const OfferProducts = ({ setProducts }) => {
    const [offerName, setOfferName] = useState('');
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Fetch offers based on input
    const fetchOffers = useCallback(async (name) => {
        try {
            const response = await axios.get('http://localhost:3300/api/offer/search-by-name', {
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

    // Debounce offerName input
    useEffect(() => {
        if (!offerName.trim()) {
            setOffers([]);
            setSelectedOffer(null); // Reset selected offer
            setProducts(prev => ({
                ...prev,
                offerID: '',
                offerName: '',
            }));
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
                offerId: offer.id,
                offerName: offer.offername,
            }));
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setOfferName(value);
    };

    return (
        <div className="flex flex-col gap-3">
            {
                selectedOffer && <div className="w-full py-5 px-5 bg-secondary-text rounded-lg text-white">
                    <p>Offer ID : <b>{selectedOffer?.id}</b></p>
                    <p>Offer Name : <b>{selectedOffer?.offername}</b></p>
                </div>
            }


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
