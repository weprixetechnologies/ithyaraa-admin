import React, { useState, useEffect } from 'react';
import InputCustomLabelled from '../ui/customLabelledField';

const ProductCategories = ({
    categoryList = [],
    onCategoryChange,
    prefillSelected = []
}) => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [localCategoryList, setLocalCategoryList] = useState([]);

    // ⏬ Load initial categories and selections
    useEffect(() => {
        setLocalCategoryList(categoryList);
        setSelectedCategories(prefillSelected);
    }, []);

    const handleCheckboxChange = (categoryId) => {
        const updated = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(updated);
        onCategoryChange?.(updated);
    };

    const handleAddNewCategory = () => {
        const name = newCategoryName.trim();
        if (!name) return alert("Please enter a valid name");

        const newId = `${name}_${Date.now()}`;

        const newCategory = {
            _id: newId,
            c_name: name,
            c_label: name,
            c_imgurl: '',
            product_ids: []
        };

        setLocalCategoryList(prev => [...prev, newCategory]);

        const updatedSelected = [...selectedCategories, newId];
        setSelectedCategories(updatedSelected);
        onCategoryChange?.(updatedSelected);

        setNewCategoryName('');
    };

    return (
        <div className="product-categories-container">
            <div className="category-checkbox-list">
                {localCategoryList.map((cat, i) => {
                    const id = cat._id || cat.c_name || `cat-${i}`;
                    return (
                        <label key={id} className="category-item">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(id)}
                                onChange={() => handleCheckboxChange(id)}
                            />
                            <span>{cat.c_label}</span>
                        </label>
                    );
                })}
            </div>

            <div className="add-category-section">
                <div className="input-grow">
                    <InputCustomLabelled
                        placeholder="New category name"
                        value={newCategoryName}
                        inputFunction={setNewCategoryName}
                        isLabel={false}
                    />
                </div>
                <button
                    className="save-attributes btn-add-cat"
                    onClick={handleAddNewCategory}
                >
                    Add Category
                </button>
            </div>
        </div>
    );
};

export default ProductCategories;
