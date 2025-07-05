import React, { useState } from 'react';
import InputCustomLabelled from '../ui/customLabelledField';
// import './productcategories.css'; // create this file for new styles

const ProductCategories = ({ categoryList = [], onCategoryChange }) => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryLabel, setNewCategoryLabel] = useState('');

    const handleCheckboxChange = (categoryId) => {
        setSelectedCategories((prev) => {
            const updated = prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId];

            onCategoryChange?.(updated);
            return updated;
        });
    };

    const handleAddNewCategory = () => {
        if (!newCategoryName.trim()) {
            alert('Please enter category name');
            return;
        }

        const newId = `${newCategoryName}_${Date.now()}`;
        const newCategory = {
            c_name: newCategoryName,
            c_label: newCategoryLabel || newCategoryName,
            c_imgurl: '',
            product_ids: [],
            _id: newId
        };

        categoryList.push(newCategory);
        setSelectedCategories(prev => [...prev, newId]);
        onCategoryChange?.([...selectedCategories, newId]);

        setNewCategoryName('');
        setNewCategoryLabel('');
    };

    return (
        <div className="product-categories-container">
            {/* <h3 className="section-title">Choose Categories</h3> */}

            <div className="category-checkbox-list">
                {categoryList.map((category, index) => {
                    const id = category._id || category.c_name || `cat-${index}`;
                    return (
                        <label key={id} className="category-item">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(id)}
                                onChange={() => handleCheckboxChange(id)}
                            />
                            <span>{category.c_label}</span>
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
