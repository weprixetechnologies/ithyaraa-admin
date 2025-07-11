import React, { useState, useMemo } from 'react';
import './productSearch.css';
import sampleproduct from './sample_products_100_with_image.json';
const ProductSearchSpecial = ({ onSelectionUpdate, selectedProducts }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const uniqueCategories = [...new Set(sampleproduct.map(p => p.categoryName))];

    const handleAdd = (product) => {
        const isAlreadySelected = selectedProducts.find(p => p.productId === product.productId);
        let updatedList;

        if (isAlreadySelected) {
            updatedList = selectedProducts.filter(p => p.productId !== product.productId);
        } else {
            updatedList = [...selectedProducts, product];
        }

        onSelectionUpdate && onSelectionUpdate(updatedList);
    };

    const handleSelectAllCategory = (selectedCategory) => {
        const productsInCategory = filteredProducts.filter(p => p.categoryName === selectedCategory);

        const allSelected = productsInCategory.every(p =>
            selectedProducts.find(sel => sel.productId === p.productId)
        );

        let updatedList;

        if (allSelected) {
            // Remove all in category
            updatedList = selectedProducts.filter(sel => sel.categoryName !== selectedCategory);
        } else {
            const newItems = productsInCategory.filter(p =>
                !selectedProducts.some(sel => sel.productId === p.productId)
            );
            updatedList = [...selectedProducts, ...newItems];
        }

        onSelectionUpdate && onSelectionUpdate(updatedList);
    };

    const filteredProducts = useMemo(() => {
        return sampleproduct.filter(p => {
            const matchesSearch = p.productName.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category ? p.categoryName === category : true;
            const matchesMin = minPrice ? p.regularPrice >= parseFloat(minPrice) : true;
            const matchesMax = maxPrice ? p.regularPrice <= parseFloat(maxPrice) : true;
            return matchesSearch && matchesCategory && matchesMin && matchesMax;
        });
    }, [search, category, minPrice, maxPrice]);

    return (
        <div className="product-search-wrapper">
            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                />

                {category && (
                    <button
                        className="select-all-btn"
                        onClick={() => handleSelectAllCategory(category)}
                    >
                        {
                            filteredProducts.every(p => selectedProducts.some(s => s.productId === p.productId))
                                ? 'Clear All in Category'
                                : 'Select All in Category'
                        }
                    </button>
                )}
            </div>

            {/* Products */}
            <div className="productwrapper-01">
                {filteredProducts.map((i, index) => (
                    <div key={index} className="product-item-wrapper">
                        <div className="product-item">
                            <div className={`image-container ${selectedProducts.find(p => p.productId === i.productId) ? 'selected' : ''}`}>
                                <img src={i.featuredImage.imgUrl} alt={i.imgAlt} className="product-image" />
                                <button className="add-btn" onClick={() => handleAdd(i)}>
                                    {selectedProducts.find(p => p.productId === i.productId) ? 'Remove' : 'Add to List'}
                                </button>
                                {selectedProducts.find(p => p.productId === i.productId) && (
                                    <div className="tick-overlay">✓</div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'end' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <p className="pname">{i.productName}</p>
                                    <p className="psku">{i.categoryName}</p>
                                </div>
                                <p style={{ textAlign: 'right', fontSize: '18px' }}>$ {i.regularPrice}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSearchSpecial;
