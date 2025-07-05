/* eslint-disable */

import React, { useState, useEffect } from 'react';
import InputCustomLabelled from '../ui/customLabelledField';
import SelectCustomLabelled from '../ui/customSelect';

const ProductOffer = ({ offers = [] }) => {
    const [offerId, setOfferId] = useState('');
    const [selectedOffer, setSelectedOffer] = useState('');

    // When selectedOffer changes, update offerId to match
    useEffect(() => {
        if (selectedOffer) {
            setOfferId(selectedOffer);
        }
    }, [selectedOffer]);

    const handleConfirm = () => {
        console.log('Confirmed Offer ID:', offerId);
        console.log('Selected Offer:', selectedOffer);
        // Add logic here to pass to parent or update Firestore
    };

    return (
        <div className="product-offer-section">
            <InputCustomLabelled
                label="Product Offer ID"
                placeholder="Enter Product Offer ID"
                value={offerId}
                inputFunction={setOfferId}
            />
            <SelectCustomLabelled
                label="Select Offer"
                options={offers}
                value={selectedOffer}
                selectFunction={setSelectedOffer}  // 👈 This is key
                placeholder="Choose an offer"
            />


            <div className="save-attributes-wrap" style={{ marginTop: '10px' }}>


                <button className="save-attributes" >
                    Set Offer
                </button>
            </div>
        </div>
    );
};

export default ProductOffer;
