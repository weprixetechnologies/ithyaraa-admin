import React from 'react';
import InputUi from '../ui/inputui';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Pricing = ({ setProducts, products }) => {
    const { regularPrice = '', salePrice = '', discountValue = '', discountType = '' } = products;

    // Utility function to update state
    const setField = (name, value) => {
        setProducts(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 👉 1. Handle sale price input
    const handleSalePriceChange = (e) => {
        const value = e.target.value;
        setField('salePrice', value);

        if (regularPrice && value) {
            const reg = parseFloat(regularPrice);
            const sale = parseFloat(value);
            if (!isNaN(reg) && !isNaN(sale) && reg > 0 && sale <= reg) {
                const percent = (((reg - sale) / reg) * 100).toFixed(2);
                setField('discountType', 'percentage');
                setField('discountValue', percent);
            }
        }
    };

    // 👉 2. Handle discount value input
    const handleDiscountValueChange = (e) => {
        const value = e.target.value;
        setField('discountValue', value);

        const reg = parseFloat(regularPrice);
        const disc = parseFloat(value);
        if (!isNaN(reg) && !isNaN(disc)) {
            if (discountType === 'percentage') {
                const sale = (reg - (reg * (disc / 100))).toFixed(2);
                setField('salePrice', sale);
            } else if (discountType === 'flat') {
                const sale = (reg - disc).toFixed(2);
                setField('salePrice', sale);
            }
        }
    };

    // 👉 3. Handle discount type change
    const handleDiscountTypeChange = (val) => {
        setField('discountType', val);

        const reg = parseFloat(regularPrice);
        const disc = parseFloat(discountValue);
        if (!isNaN(reg) && !isNaN(disc)) {
            if (val === 'percentage') {
                const sale = (reg - (reg * (disc / 100))).toFixed(2);
                setField('salePrice', sale);
            } else if (val === 'flat') {
                const sale = (reg - disc).toFixed(2);
                setField('salePrice', sale);
            }
        }
    };

    return (
        <div className="pricing grid gap-4">
            <div className="grid gap-3 grid-cols-2">
                <InputUi
                    label="Regular Price"
                    name="regularPrice"
                    value={regularPrice}
                    datafunction={(e) => setField('regularPrice', e.target.value)}
                />
                <InputUi
                    label="Sale Price"
                    name="salePrice"
                    value={salePrice}
                    datafunction={handleSalePriceChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
                <Select
                    onValueChange={handleDiscountTypeChange}
                    value={discountType}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Discount Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectGroup>
                            <SelectLabel>Discount Type</SelectLabel>
                            <SelectItem value="flat">Flat Discount</SelectItem>
                            <SelectItem value="percentage">Percentage Discount</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <InputUi
                    label="Discount Value"
                    name="discountValue"
                    value={discountValue}
                    datafunction={handleDiscountValueChange}
                />
            </div>
        </div>
    );
};

export default Pricing;
