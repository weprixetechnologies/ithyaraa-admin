import React, { useState } from 'react';
import SelectCustomLabelledSearchable from '../ui/customSelectSearchable';

const productData = [
    {
        productId: "P001",
        productName: "ITYARAA Exclusive 1Exclusive 1Exclusive 1",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-1-1/300/200", imgAlt: "Featured Image 1-1" },
            { imgUrl: "https://picsum.photos/seed/featured-1-2/300/200", imgAlt: "Featured Image 1-2" },
        ],
        productVariationID: "VVi3241",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-1-1/300/200", imgAlt: "Gallery Image 1-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-1-2/300/200", imgAlt: "Gallery Image 1-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-1-3/300/200", imgAlt: "Gallery Image 1-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-1-4/300/200", imgAlt: "Gallery Image 1-4" },
        ],
    },
    {
        productId: "P002",
        productName: "ITYARAA Exclusive 2",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-2-1/300/200", imgAlt: "Featured Image 2-1" },
            { imgUrl: "https://picsum.photos/seed/featured-2-2/300/200", imgAlt: "Featured Image 2-2" },
        ],
        productVariationID: "VVi7284",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-2-1/300/200", imgAlt: "Gallery Image 2-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-2-2/300/200", imgAlt: "Gallery Image 2-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-2-3/300/200", imgAlt: "Gallery Image 2-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-2-4/300/200", imgAlt: "Gallery Image 2-4" },
        ],
    },
    {
        productId: "P003",
        productName: "ITYARAA Exclusive 3",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-3-1/300/200", imgAlt: "Featured Image 3-1" },
            { imgUrl: "https://picsum.photos/seed/featured-3-2/300/200", imgAlt: "Featured Image 3-2" },
        ],
        productVariationID: "VVi8512",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-3-1/300/200", imgAlt: "Gallery Image 3-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-3-2/300/200", imgAlt: "Gallery Image 3-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-3-3/300/200", imgAlt: "Gallery Image 3-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-3-4/300/200", imgAlt: "Gallery Image 3-4" },
        ],
    },
    {
        productId: "P004",
        productName: "ITYARAA Exclusive 4",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-4-1/300/200", imgAlt: "Featured Image 4-1" },
            { imgUrl: "https://picsum.photos/seed/featured-4-2/300/200", imgAlt: "Featured Image 4-2" },
        ],
        productVariationID: "VVi9733",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-4-1/300/200", imgAlt: "Gallery Image 4-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-4-2/300/200", imgAlt: "Gallery Image 4-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-4-3/300/200", imgAlt: "Gallery Image 4-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-4-4/300/200", imgAlt: "Gallery Image 4-4" },
        ],
    },
];

const categoryData = [
    {
        categoryName: 'Oversized T-Shirts',
        categoryID: 'ots_13',
    },
    {
        categoryName: 'Graphic T-Shirts',
        categoryID: 'gts_14',
    },
    {
        categoryName: 'Plain T-Shirts',
        categoryID: 'pts_15',
    },
    {
        categoryName: 'Hoodies & Sweatshirts',
        categoryID: 'hs_16',
    },
    {
        categoryName: 'Joggers & Track Pants',
        categoryID: 'jtp_17',
    },
    {
        categoryName: 'Shorts',
        categoryID: 'sh_18',
    },
    {
        categoryName: 'Casual Shirts',
        categoryID: 'cs_19',
    },
    {
        categoryName: 'Denim Jeans',
        categoryID: 'dj_20',
    },
    {
        categoryName: 'Caps & Hats',
        categoryID: 'cap_21',
    },
    {
        categoryName: 'Biker Accessories',
        categoryID: 'ba_22',
    }
];

const ComboConditions = () => {
    const [options] = useState([
        { value: 'include_product', label: 'Include Product' },
        { value: 'include_category', label: 'Include Category' }
    ]);

    const [includeType, setIncludeType] = useState('');
    const [data, setData] = useState([]);
    const [selectedData, setSelectedData] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    const formatOptions = (items) => {
        return items.map(item => {
            if (item.categoryName) {
                return { label: item.categoryName, value: item.categoryID, ...item };
            } else if (item.productName) {
                return { label: item.productName, value: item.productId, ...item };
            }
            return null;
        }).filter(Boolean);
    };

    const selectFunctionType = (e) => {
        setIncludeType(e);

        if (e === 'include_product') {
            setData(formatOptions(productData));
            console.log(formatOptions(productData));

        } else if (e === 'include_category') {
            setData(formatOptions(categoryData));
        } else {
            setData([]);
        }

        // setSelectedData('');
        setSelectedProducts([]);
    };

    const selectiveUnitsFunction = (selectedValue) => {
        if (!selectedValue) return;

        // Find the full object from `data`
        const fullObj = data.find(item => item.value === selectedValue);

        if (!fullObj) return; // If not found, exit

        // Check if it's already selected
        const alreadyExists = selectedProducts.some(item => item.value === fullObj.value);

        if (!alreadyExists) {
            console.log(fullObj);

            setSelectedProducts(prev => [...prev, fullObj]);
        }

        setSelectedData('');
    };

    return (
        <div>
            {/* Dropdown 1: Choose Type */}
            <SelectCustomLabelledSearchable
                options={options}
                value={includeType}
                selectFunction={selectFunctionType}
            />

            {/* Dropdown 2: Choose One (single-select but store in array) */}
            {data.length > 0 && (
                <SelectCustomLabelledSearchable
                    options={data}
                    value={selectedData}
                    selectFunction={selectiveUnitsFunction}
                />
            )}
            {/* Display selected items */}
            {selectedProducts?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Selected Items:</h4>
                    {selectedProducts.map((item, index) => (
                        <section
                            className="productArraymap--selected"
                            key={index}
                            style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
                        >
                            {item.productFeaturedImage?.[0]?.imgUrl && (
                                <img
                                    src={item.productFeaturedImage[0].imgUrl}
                                    alt="thumb"
                                    style={{ height: '40px', width: '40px', marginRight: '10px' }}
                                />
                            )}
                            <p style={{ marginRight: '10px' }}>{item.label}</p>
                            {/* <button
                                onClick={() => removeSelectedProduct(item)}
                                className="remove-icon--selected-pam"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: '#f00'
                                }}
                            >
                                <RxCross2 />
                            </button> */}
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComboConditions;