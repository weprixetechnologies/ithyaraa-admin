import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layout';
import DataTable from '../../components/ui/dataTable';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

// ✅ Moved users outside the component to avoid re-creating it on every render
const users = [
    {
        uid: 'u123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91-9876543210',
        createdOn: '2024-05-12',
        editUrl: '/u123'
    },
    {
        uid: 'u456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91-9123456789',
        createdOn: '2024-06-01',
        editUrl: '/u456'
    },
    {
        uid: 'u789',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+91-9012345678',
        createdOn: '2024-07-05',
        editUrl: '/u789'
    }
];

const AllUsers = () => {
    const navigate = useNavigate();

    const [searchFields, setSearchFields] = useState({
        uid: '',
        name: '',
        email: '',
        phone: ''
    });

    const [sortByDateAsc, setSortByDateAsc] = useState(true);

    const columns = [
        { label: 'UID', value: 'uid' },
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
        { label: 'Phone Number', value: 'phone' },
        { label: 'Created On', value: 'createdOn' },
    ];

    const filteredUsers = useMemo(() => {
        return users
            .filter(user =>
                user.uid.toLowerCase().includes(searchFields.uid.toLowerCase()) &&
                user.name.toLowerCase().includes(searchFields.name.toLowerCase()) &&
                user.email.toLowerCase().includes(searchFields.email.toLowerCase()) &&
                user.phone.toLowerCase().includes(searchFields.phone.toLowerCase())
            )
            .sort((a, b) => {
                const dateA = new Date(a.createdOn).getTime();
                const dateB = new Date(b.createdOn).getTime();
                return sortByDateAsc ? dateA - dateB : dateB - dateA;
            });
    }, [searchFields, sortByDateAsc]);

    const handleEdit = (row) => {
        navigate(row.editUrl);
    };

    const handleDelete = (row) => {
        console.log('Delete user:', row);
    };

    return (
        <Layout active={'ecom-5'} title={'All Users'}>
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search by UID"
                        value={searchFields.uid}
                        onChange={(e) => setSearchFields({ ...searchFields, uid: e.target.value })}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchFields.name}
                        onChange={(e) => setSearchFields({ ...searchFields, name: e.target.value })}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Email"
                        value={searchFields.email}
                        onChange={(e) => setSearchFields({ ...searchFields, email: e.target.value })}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="text"
                        placeholder="Search by Phone"
                        value={searchFields.phone}
                        onChange={(e) => setSearchFields({ ...searchFields, phone: e.target.value })}
                        style={{ padding: '8px' }}
                    />

                    <button
                        onClick={() => setSortByDateAsc(prev => !prev)}
                        style={{ padding: '8px 12px', background: '#f5f5f5', cursor: 'pointer' }}
                    >
                        Sort by Date: {sortByDateAsc ? 'Old → New' : 'New → Old'}
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredUsers.map(user => ({
                    ...user,
                    createdOn: new Date(user.createdOn).toISOString().split('T')[0]  // Format date
                }))}
                searchQuery={''}
                searchColumn={''}
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

export default AllUsers;
