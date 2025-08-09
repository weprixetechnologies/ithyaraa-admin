import React, { useEffect, useState, useRef } from 'react';
import { getPaginatedCategories } from '../../lib/api/categoryApi';

const CategoryProduct = ({ setProducts, products, isEditable = false, oldValue = [] }) => {
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState([]);
    const hasSyncedOldValues = useRef(false); // 🧠 prevents infinite loop

    // Fetch all categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes] = await Promise.all([
                    getPaginatedCategories({ limit: '1000' }),
                ]);
                setCategories(catRes.data || []);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };

        fetchData();
    }, []);

    // Sync old values (only once)
    useEffect(() => {
        if (
            isEditable &&
            Array.isArray(oldValue) &&
            categories.length > 0 &&
            !hasSyncedOldValues.current
        ) {
            hasSyncedOldValues.current = true;

            const selectedIDs = oldValue.map(cat => String(cat.categoryID));
            setSelected(selectedIDs);

            const selectedObjects = categories
                .filter(cat => selectedIDs.includes(String(cat.categoryID)))
                .map(cat => ({
                    categoryID: cat.categoryID,
                    categoryName: cat.categoryName,
                }));

            setProducts(prev => ({
                ...prev,
                categories: selectedObjects,
            }));
        }
    }, [oldValue, categories, isEditable, setProducts]);

    const handleCheckboxChange = (id) => {
        const updatedSelected = selected.includes(id)
            ? selected.filter(i => i !== id)
            : [...selected, id];

        setSelected(updatedSelected);

        const selectedObjects = categories
            .filter(cat => updatedSelected.includes(String(cat.categoryID)))
            .map(cat => ({
                categoryID: cat.categoryID,
                categoryName: cat.categoryName,
            }));

        setProducts(prev => ({
            ...prev,
            categories: selectedObjects,
        }));
    };

    return (
        <div className="flex flex-col gap-2">
            {categories.map(cat => (
                <label key={cat.categoryID} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={selected.includes(String(cat.categoryID))}
                        onChange={() => handleCheckboxChange(String(cat.categoryID))}
                    />
                    {cat.categoryName}
                </label>
            ))}
        </div>
    );
};

export default CategoryProduct;
