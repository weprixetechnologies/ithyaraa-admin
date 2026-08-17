import React, { useState, useEffect } from 'react';

const GenerateVariations = ({ attributes = [], setProducts, products, defaultVariation }) => {
    const [variations, setVariations] = useState(defaultVariation ? defaultVariation : []);

    useEffect(() => {
        setProducts(prev => ({
            ...prev,
            productVariations: variations,
        }));
    }, [variations]);

    useEffect(() => {
        console.log('variation', defaultVariation);
        // Only update if defaultVariation is provided and different from current
        if (defaultVariation && Array.isArray(defaultVariation) && defaultVariation.length > 0) {
            // Preserve existing variations if they have the same structure
            setVariations(prev => {
                // If we have existing variations with IDs, try to merge
                if (prev && prev.length > 0 && prev.some(v => v.variationID)) {
                    const existingMap = new Map();
                    prev.forEach(v => {
                        if (v.variationID) existingMap.set(v.variationID, v);
                        if (v.variationSlug) existingMap.set(v.variationSlug, v);
                    });

                    // Merge: use existing data if available, otherwise use defaultVariation
                    return defaultVariation.map(v => {
                        const existing = existingMap.get(v.variationID) || existingMap.get(v.variationSlug);
                        if (existing) {
                            // Preserve existing data, only update if new data has values
                            return {
                                ...existing,
                                ...v,
                                variationID: existing.variationID || v.variationID,
                                variationSlug: existing.variationSlug || v.variationSlug,
                                // Only update if new value is provided
                                variationStock: v.variationStock !== undefined && v.variationStock !== '' ? v.variationStock : existing.variationStock,
                                variationPrice: v.variationPrice !== undefined && v.variationPrice !== '' ? v.variationPrice : existing.variationPrice,
                                variationSalePrice: v.variationSalePrice !== undefined && v.variationSalePrice !== '' ? v.variationSalePrice : existing.variationSalePrice,
                            };
                        }
                        return v;
                    });
                }
                return defaultVariation;
            });
        } else if (!defaultVariation || (Array.isArray(defaultVariation) && defaultVariation.length === 0)) {
            // Only clear if explicitly empty
            setVariations([]);
        }
    }, [defaultVariation])

    const generateCombinations = () => {
        if (!attributes?.length) return;

        const attrValues = attributes?.map(attr => attr.values || []);
        const attrNames = attributes?.map(attr => attr.name);

        if (attrValues.some(values => values?.length === 0)) {
            alert("Each attribute must have at least one value.");
            return;
        }

        const cartesian = (arr) =>
            arr.reduce((acc, curr) => acc.flatMap(d => curr?.map(e => [...d, e])), [[]]);

        const combos = cartesian(attrValues);

        // Create a map of existing variations by their slug for matching
        const existingVariationsMap = new Map();
        variations.forEach(v => {
            if (v.variationSlug) {
                existingVariationsMap.set(v.variationSlug, v);
            }
        });

        const formatted = combos?.map((combo) => {
            const variationValues = combo?.map((val, index) => ({
                [attrNames[index]]: val,
            }));
            console.log(variationValues);

            const slug = combo.join('_').toLowerCase();

            // Check if a variation with this slug already exists
            const existingVariation = existingVariationsMap.get(slug);

            if (existingVariation) {
                // Preserve existing variationID and other fields, but update variationValues
                return {
                    ...existingVariation,
                    variationValues, // Update variationValues to match new combo
                    variationName: slug, // Update name to match slug
                };
            } else {
                // Create new variation
                const id = `VARI${slug.replace(/_/g, '')}vvid`;
                return {
                    variationID: id,
                    variationSlug: slug,
                    variationName: slug,
                    variationValues,
                    variationStock: '',
                    variationPrice: '',
                    variationSalePrice: ''
                };
            }
        });

        setVariations(formatted);
    };

    const handleChange = (index, field, value) => {
        setVariations(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const applyBulkValue = (fieldName) => {
        const value = prompt(`Enter bulk value for ${fieldName}`);
        if (value === null) return;

        setVariations(prev =>
            prev?.map(variation => ({
                ...variation,
                [fieldName]: value
            }))
        );
    };

    const removeVariation = (index) => {
        setVariations(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    return (
        <div className="space-y-4">
            <button
                onClick={generateCombinations}
                className="h-[30px] text-xs text-primary px-3 bg-white border border-primary rounded-lg w-full"
            >
                Generate Variations
            </button>

            {variations?.length > 0 && (
                <>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => applyBulkValue('variationStock')}
                            className="h-[30px] text-xs text-primary px-3 bg-white border border-primary rounded-lg w-full"
                        >
                            Add Bulk Stock
                        </button>
                        <button
                            onClick={() => applyBulkValue('variationPrice')}
                            className="h-[30px] text-xs text-primary px-3 bg-white border border-primary rounded-lg w-full"
                        >
                            Add Bulk Price
                        </button>
                        <button
                            onClick={() => applyBulkValue('variationSalePrice')}
                            className="h-[30px] text-xs text-primary px-3 bg-white border border-primary rounded-lg w-full"
                        >
                            Add Bulk Sale Price
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                        {variations?.map((variation, index) => (
                            <div key={index} className="bg-gray-100 text-sm rounded-md px-4 py-3 space-y-3">
                                <div className="flex flex-wrap gap-2 justify-between items-center">
                                    <div className="flex flex-wrap gap-2">
                                        {variation?.variationValues?.map((pair, i) => {
                                            const [key, val] = Object.entries(pair)[0];
                                            return (
                                                <span key={i} className="bg-dark-text text-white px-3 py-1 rounded-lg">
                                                    {key}: {val}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => removeVariation(index)}
                                        className="text-xs text-red-600 underline ml-4"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col">
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            className="text-xs px-2 py-1 border rounded w-full"
                                            value={variation.variationStock}
                                            onChange={(e) => handleChange(index, 'variationStock', e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                            Current Stock: {variation.variationStock || '0'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            className="text-xs px-2 py-1 border rounded w-full"
                                            value={variation.variationPrice}
                                            onChange={(e) => handleChange(index, 'variationPrice', e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                            Current Price: ₹{variation.variationPrice || '0'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col">
                                        <input
                                            type="number"
                                            placeholder="Sale Price"
                                            className="text-xs px-2 py-1 border rounded w-full"
                                            value={variation.variationSalePrice}
                                            onChange={(e) => handleChange(index, 'variationSalePrice', e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                            Current Sale Price: ₹{variation.variationSalePrice || '0'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default GenerateVariations;
