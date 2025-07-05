import React, { useState, useEffect } from 'react';
import InputCustomLabelled from '../ui/customLabelledField';
import SelectCustomLabelled from '../ui/customSelect';
import './productcomponent.css';

const ProductAttributes = ({ options, getData, prefillData = [] }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [inputAttributeNew, setInputAttributeNew] = useState('');
    const [attributeValues, setAttributeValues] = useState({});
    const [newValues, setNewValues] = useState({});

    useEffect(() => {
        if (prefillData.length > 0) {
            const prefilled = {};
            prefillData.forEach(({ value, innerValues }) => {
                prefilled[value] = innerValues;
            });
            setAttributeValues(prefilled);
        }
        // ✅ Empty dependency array ensures this runs only on first mount
    }, []);


    const useExistingAttribute = () => {
        if (!selectedCategory) return;
        const selectedOption = options.find(opt => opt.value === selectedCategory);
        if (!selectedOption || attributeValues[selectedOption.value]) return;

        setAttributeValues(prev => ({
            ...prev,
            [selectedOption.value]: selectedOption.innerValues || []
        }));
        setSelectedCategory('');
    };

    const createNewAttribute = () => {
        const key = inputAttributeNew.toLowerCase().trim();
        if (!key || attributeValues[key]) return;
        setAttributeValues(prev => ({ ...prev, [key]: [] }));
        setInputAttributeNew('');
    };

    const addNewValue = (attribute) => {
        const val = (newValues[attribute] || '').trim();
        if (!val) return;

        setAttributeValues(prev => ({
            ...prev,
            [attribute]: [...(prev[attribute] || []), val]
        }));
        setNewValues(prev => ({ ...prev, [attribute]: '' }));
    };

    const removeValue = (attribute, valueToRemove) => {
        setAttributeValues(prev => ({
            ...prev,
            [attribute]: prev[attribute].filter(v => v !== valueToRemove)
        }));
    };

    const handleNewValueChange = (attr, value) => {
        setNewValues(prev => ({ ...prev, [attr]: value }));
    };

    const handleSaveAttributes = () => {
        const formattedAttributes = options
            .filter(opt => attributeValues.hasOwnProperty(opt.value))
            .map(opt => ({
                label: opt.label,
                value: opt.value,
                innerValues: attributeValues[opt.value]
            }));

        const customAttributes = Object.entries(attributeValues)
            .filter(([key]) => !options.find(opt => opt.value === key))
            .map(([key, values]) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value: key,
                innerValues: values
            }));

        const finalAttributes = [...formattedAttributes, ...customAttributes];
        getData(finalAttributes);
    };

    const handleLoadtoServer = () => {
        console.log('🔁 Final Attributes to Load:', attributeValues);
    };

    return (
        <div className="product-data">
            {/* Attribute creation section */}
            <div className="attributes--create-ex">
                <div className="input-wrapper-ace">
                    <InputCustomLabelled
                        value={inputAttributeNew}
                        isLabel={false}
                        inputFunction={setInputAttributeNew}
                        placeholder={'Enter New Attribute Name'}
                    />
                    <SelectCustomLabelled
                        isLabel={false}
                        htmlFor="category"
                        value={selectedCategory}
                        selectFunction={setSelectedCategory}
                        options={options}
                        selectClasses="custom-select"
                        height={40}
                        width={100}
                    />
                </div>
                <button className="attr-ace-button" onClick={useExistingAttribute}>Use Existing</button>
                <button className="attr-ace-button" onClick={createNewAttribute}>Create New</button>
            </div>

            {/* Attributes and values */}
            <div className="attributes-productdata-container">
                {Object.entries(attributeValues)?.map(([attribute, values]) => (
                    <div className="cnt6e" key={attribute}>
                        <div className="attributes-container">
                            <p>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</p>
                            <section className="attributes-container-child-4-attr">
                                <div className="attr-cc4a">
                                    {values?.map((val, i) => (
                                        <span key={i} onClick={() => removeValue(attribute, val)}>{val}</span>
                                    ))}
                                </div>
                                <div className="attributes-add--value">
                                    <div className="grow-aav">
                                        <InputCustomLabelled
                                            inputFunction={(val) => handleNewValueChange(attribute, val)}
                                            value={newValues[attribute] || ''}
                                            placeholder={'Enter Attribute Value'}
                                            isLabel={false}
                                        />
                                    </div>
                                    <button className="attr-aav" onClick={() => addNewValue(attribute)}>
                                        Add Value
                                    </button>
                                </div>
                            </section>
                        </div>
                        <hr className="custom-hr" style={{ marginTop: '10px', marginBottom: '10px' }} />
                    </div>
                ))}
            </div>

            {/* Save / Load */}
            <div className="save-attributes-wrap">
                <button className="save-attributes" onClick={handleLoadtoServer}>
                    Load to Server
                </button>
                <button className="save-attributes" onClick={handleSaveAttributes}>
                    Save Attribute
                </button>
            </div>
        </div>
    );
};

export default ProductAttributes;
