import React, { useState, useEffect } from 'react';
import './productcomponent.css';
import InputCustomLabelled from '../ui/customLabelledField';

const ProductVariation = ({ attributes, sendVariations, variations = [] }) => {
    const [generatedVariations, setGeneratedVariations] = useState([]);
    const [openIndexes, setOpenIndexes] = useState({}); // key: index, value: true/false

    // 🟡 Sync with parent when variations prop changes
    useEffect(() => {
        if (variations?.length > 0) {
            setGeneratedVariations(variations);
        }
    }, [variations]);

    const generateVariations = () => {
        if (!attributes || attributes?.length === 0) {
            alert('Enter or Save Attributes');
            return;
        }

        const valuesArray = attributes?.map(attr => attr.innerValues || []);

        const getCombinations = (arrays) => {
            if (arrays?.length === 0) return [[]];
            const [first, ...rest] = arrays;
            const restCombinations = getCombinations(rest);
            return first.flatMap(v =>
                restCombinations?.map(r => [v, ...r])
            );
        };

        const combinations = getCombinations(valuesArray);

        const newVariations = combinations?.map(combo => ({
            v1: combo[0] || '',
            v2: combo[1] || '',
            v3: combo[2] || '',
            v4: combo[3] || '',
            vCount: combo.filter(Boolean)?.length,
            v_id: combo.filter(Boolean).join('_'),
            variation_id: '',
            stock: 0,
            regularPrice: 0,
            salePrice: 0
        }));

        setGeneratedVariations(newVariations);
        sendVariations(newVariations);
        setOpenIndexes({}); // close all accordions
    };

    const toggleAccordion = (index) => {
        setOpenIndexes(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const updateVariationField = (index, field, value) => {
        setGeneratedVariations(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };

            // ✅ Send updated variations to parent
            sendVariations(updated);

            return updated;
        });
    };

    const handleUpdateAll = () => {
        console.log('📦 Final Updated Variations:', generatedVariations);
        setOpenIndexes({}); // close all accordions
    };

    return (
        <div>
            <div className="productvariation-wrapper">
                {generatedVariations?.map((variation, index) => (
                    <section key={variation.v_id + index}>
                        <div
                            className="values-wrapper"
                            onClick={() => toggleAccordion(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span>{variation.v_id}</span>
                            {[variation.v1, variation.v2, variation.v3, variation.v4]
                                .filter(Boolean)
                                ?.map((val, i) => (
                                    <p key={i}>{val}</p>
                                ))}
                        </div>

                        {openIndexes[index] && (
                            <div className="variation-data">
                                <p><b>Current Stock:</b> {variation.stock}</p>
                                <div className='update-pvv'>
                                    <p><b>Update Stock:</b></p>
                                    <div className="grow-icl--pvv">
                                        <InputCustomLabelled
                                            value={variation.stock}
                                            inputFunction={val => updateVariationField(index, 'stock', val)}
                                            height={40}
                                            isLabel={false}
                                            placeholder="Enter Stock"
                                        />
                                    </div>
                                </div>

                                <p><b>Regular Price:</b> {variation.regularPrice}</p>
                                <div className='update-pvv'>
                                    <p><b>Update Regular Price:</b></p>
                                    <div className="grow-icl--pvv">
                                        <InputCustomLabelled
                                            value={variation.regularPrice}
                                            inputFunction={val => updateVariationField(index, 'regularPrice', val)}
                                            height={40}
                                            isLabel={false}
                                            placeholder="Enter Regular Price"
                                        />
                                    </div>
                                </div>

                                <p><b>Sale Price:</b> {variation.salePrice}</p>
                                <div className='update-pvv'>
                                    <p><b>Update Sale Price:</b></p>
                                    <div className="grow-icl--pvv">
                                        <InputCustomLabelled
                                            value={variation.salePrice}
                                            inputFunction={val => updateVariationField(index, 'salePrice', val)}
                                            height={40}
                                            isLabel={false}
                                            placeholder="Enter Sale Price"
                                        />
                                    </div>
                                </div>

                                <p><b>Variation Values:</b> {[variation.v1, variation.v2, variation.v3, variation.v4].filter(Boolean).join(' | ')}</p>
                                <p><b>VID:</b> {variation.v_id}</p>

                                <p><b>Variation ID:</b> {variation.variation_id || '(not set)'}</p>
                                <div className='update-pvv'>
                                    <p><b>Update Variation ID:</b></p>
                                    <div className="grow-icl--pvv">
                                        <InputCustomLabelled
                                            value={variation.variation_id}
                                            inputFunction={val => updateVariationField(index, 'variation_id', val)}
                                            height={40}
                                            isLabel={false}
                                            placeholder="Enter Variation ID"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <hr className='custom-hr' style={{ marginTop: '10px' }} />
                    </section>
                ))}
            </div>

            <div className="save-attributes-wrap" style={{ marginTop: '10px' }}>
                <button className="save-attributes" onClick={generateVariations}>
                    Generate Variations
                </button>

                {generatedVariations?.length > 0 && (
                    <button className="save-attributes" onClick={handleUpdateAll}>
                        Update Variations
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductVariation;
