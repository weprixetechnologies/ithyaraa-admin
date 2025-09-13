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
                // Accept multiple response shapes: {data: [...]}, {result: [...]}, or array
                const incoming = Array.isArray(catRes)
                    ? catRes
                    : (catRes?.data || catRes?.result || []);
                setCategories(incoming || []);
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

            // Support both ID arrays and object arrays
            const selectedIDs = oldValue
                .map(item => {
                    if (item && typeof item === 'object') {
                        return String(item.categoryID ?? item.categoryId ?? item.id ?? item.value);
                    }
                    return String(item);
                })
                .filter(Boolean);

            setSelected(selectedIDs);

            const selectedObjects = categories
                .filter(cat => selectedIDs.includes(String(cat.categoryID ?? cat.categoryId ?? cat.id)))
                .map(cat => ({
                    categoryID: cat.categoryID ?? cat.categoryId ?? cat.id,
                    categoryName: cat.categoryName ?? cat.name,
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
            .filter(cat => updatedSelected.includes(String(cat.categoryID ?? cat.categoryId ?? cat.id)))
            .map(cat => ({
                categoryID: cat.categoryID ?? cat.categoryId ?? cat.id,
                categoryName: cat.categoryName ?? cat.name,
            }));

        setProducts(prev => ({
            ...prev,
            categories: selectedObjects,
        }));
    };

    return (
        <div className="flex flex-col gap-2">
            {categories.map(cat => (
                <label key={cat.categoryID ?? cat.categoryId ?? cat.id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={selected.includes(String(cat.categoryID ? String(cat.categoryID) : String(cat.categoryId ?? cat.id)))}
                        onChange={() => handleCheckboxChange(String(cat.categoryID ?? cat.categoryId ?? cat.id))}
                    />
                    {cat.categoryName ?? cat.name}
                </label>
            ))}
        </div>
    );
};

export default CategoryProduct;
