import React, { useState, useEffect } from 'react';
import DataTable from '../../components/ui/dataTable';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const CategoryTable = ({ data = [], isLoading, onEdit, onDelete }) => {
    const [searchName, setSearchName] = useState('');
    const [searchID, setSearchID] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    // Columns
    const columns = [
        { label: 'CATEGORY', value: 'category' },
        { label: 'CATEGORY ID', value: 'id' }
    ];

    // 🔍 Filter data
    useEffect(() => {
        const lowerName = searchName.toLowerCase();
        const lowerID = searchID.toLowerCase();

        const result = data.filter((cat) => {
            const matchesName = cat.name.toLowerCase().includes(lowerName);
            const matchesID = cat.id.toLowerCase().includes(lowerID);
            return matchesName && matchesID;
        });

        const formatted = result.map(cat => ({
            ...cat,
            category: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={cat.image}
                        alt={cat.name}
                        style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <span>{cat.name}</span>
                </div>
            ),
            category_tooltip: cat.name
        }));

        setFilteredData(formatted);
    }, [searchName, searchID, data]);

    const handleEdit = (cat) => {
        if (onEdit) onEdit(cat);
    };

    const handleDelete = (cat) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${cat.name}"?`);
        if (confirmDelete && onDelete) {
            onDelete(cat);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', width: '100%' }}>
                <input
                    type="text"
                    placeholder="Search Category Name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        width: '40%',
                    }}
                />
                <input
                    type="text"
                    placeholder="Search Category ID"
                    value={searchID}
                    onChange={(e) => setSearchID(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        width: '40%',
                    }}
                />
                <div style={{ width: '20%' }} />
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                defaultEntries={10}
                isLoading={isLoading}
                searchQuery=""
                searchColumn=""

                actions={(row) => (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <FiEdit
                            style={{ cursor: 'pointer', color: 'blue' }}
                            onClick={() => handleEdit(row)}
                        />
                        <FiTrash2
                            style={{ cursor: 'pointer', color: 'red' }}
                            onClick={() => handleDelete(row)}
                        />
                    </div>
                )}
            />
        </div>
    );
};

export default CategoryTable;
