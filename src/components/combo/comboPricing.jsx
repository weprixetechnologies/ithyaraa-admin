import React, { useState, useEffect } from 'react';
import InputCustomLabelled from '../ui/customLabelledField';
import SelectCustomLabelled from '../ui/customSelect';
import Container from '../ui/container'; // assuming you have a Container component

const ComboPricing = ({ onChange }) => {
    const [regularPrice, setRegularPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [discountFlat, setDiscountFlat] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');
    const [discountType, setDiscountType] = useState('');

    // Reset when regular price is cleared
    useEffect(() => {
        if (regularPrice === '') {
            setSalePrice('');
            setDiscountFlat('');
            setDiscountPercent('');
            setDiscountType('');
        }
    }, [regularPrice]);

    // Recalculate discount values when regular or sale price changes
    useEffect(() => {
        const r = parseFloat(regularPrice);
        const s = parseFloat(salePrice);

        if (!isNaN(r) && !isNaN(s)) {
            const flat = r - s;
            const percent = (flat / r) * 100;

            setDiscountFlat(flat.toFixed(2));
            setDiscountPercent(percent.toFixed(2));

            if (!discountType) {
                setDiscountType('flat_discount');
            }
        }
    }, [regularPrice, salePrice]);

    // Send all values to parent whenever they change
    useEffect(() => {
        if (onChange) {
            onChange({
                regularPrice,
                salePrice,
                discountFlat,
                discountPercent,
                discountType
            });
        }
    }, [regularPrice, salePrice, discountFlat, discountPercent, discountType]);

    // Reusable setter wrapper
    const handleInputChange = (setter) => (data) => {
        setter(data);
    };

    const updateSalePrice = (sale) => {
        setSalePrice(sale);
        setDiscountType('flat_discount'); // assume user wants flat_discount when typing sale price manually
    };

    const updateFlatDiscount = (flat) => {
        setDiscountFlat(flat);

        const r = parseFloat(regularPrice);
        const f = parseFloat(flat);

        if (!isNaN(r) && !isNaN(f)) {
            const s = r - f;
            const percent = (f / r) * 100;

            setSalePrice(s.toFixed(2));
            setDiscountPercent(percent.toFixed(2));
        }
    };

    const updatePercentDiscount = (percent) => {
        setDiscountPercent(percent);

        const r = parseFloat(regularPrice);
        const p = parseFloat(percent);

        if (!isNaN(r) && !isNaN(p)) {
            const flat = (r * p) / 100;
            const s = r - flat;

            setSalePrice(s.toFixed(2));
            setDiscountFlat(flat.toFixed(2));
        }
    };

    return (
        <Container gap="10" title="Product Pricing">
            <section className="pp-acpw" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <InputCustomLabelled
                    label="Regular Pricing"
                    placeholder="Enter Your Regular Price"
                    value={regularPrice}
                    type='number' inputFunction={handleInputChange(setRegularPrice)}
                />
                <InputCustomLabelled
                    label="Sale Pricing"
                    placeholder="Enter Your Sale Price (Auto Adjusting)"
                    value={salePrice}
                    type='number' inputFunction={updateSalePrice}
                />
            </section>
            <section className="pp-acpw" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <SelectCustomLabelled
                    label="Discount Type"
                    value={discountType}
                    selectFunction={handleInputChange(setDiscountType)}
                    options={[
                        { value: 'flat_discount', label: 'Flat Discount' },
                        { value: 'percentage_discount', label: 'Percentage Discount' },
                    ]}
                />
                <InputCustomLabelled
                    label="Flat Discount"
                    placeholder="Enter flat amount"
                    value={discountFlat}
                    type='number' inputFunction={updateFlatDiscount}
                />
                <InputCustomLabelled
                    label="Percentage"
                    placeholder="Enter Your Percentage Discount"
                    value={discountPercent}
                    type='number' inputFunction={updatePercentDiscount}
                />
            </section>
        </Container>
    );
};

export default ComboPricing;
