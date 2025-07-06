import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import useNavigate
import Layout from '../../layout';
import DataTable from '../../components/ui/dataTable';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const AllProducts = () => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate(); // ✅ initialize navigate

    const products = [
        {
            productid: 'P001',
            name: 'T-shirt',
            type: 'Variable',
            category: 'Apparel',
            editUrl: 'P001'
        },
        {
            productid: 'P002',
            name: 'Helmet',
            type: 'Make-Combo',
            category: 'Accessories',
            editUrl: '/all-products/P002'
        }
    ];

    const column = [
        { label: 'Product ID', value: 'productid' },
        { label: 'Product Name', value: 'name' },
        { label: 'Category Name', value: 'category' },
        { label: 'Product Type', value: 'type' },
    ];

    const handleEdit = (row) => {
        navigate(row.editUrl); // ✅ navigate to the URL from row object
    };

    const handleDelete = (row) => {
        console.log('Delete', row);
    };

    return (
        <Layout active={'ecom-5'} title={'All Products'}>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '8px', width: '300px' }}
                />
            </div>

            <DataTable
                columns={column}
                data={products}
                searchQuery={search}
                searchColumn="name"
                defaultEntries={6}
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
        </Layout>
    );
};

export default AllProducts;
