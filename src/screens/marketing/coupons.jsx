import React, { useState } from 'react';
import Layout from './../../layout';
import './coupons.css';
import Container from '../../components/ui/container';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import SelectCustomLabelled from '../../components/ui/customSelect';
import DataTable from '../../components/ui/dataTable';

const dummyCoupons = [
    {
        couponId: 'COUP-ML51B3PS-1A2B',
        couponCode: 'WELCOME10',
        validityPerUser: 1,
        expiryDate: '2025-12-31',
        couponType: 'percentage',
        value: 10,
        createdOn: '2024-07-11',
    },
    {
        couponId: 'COUP-ML51B3XY-3C4D',
        couponCode: 'FLAT100',
        validityPerUser: 3,
        expiryDate: '2025-11-30',
        couponType: 'flat',
        value: 100,
        createdOn: '2024-07-01',
    },
];

// ✅ Coupon ID Generator
const generateCouponId = () => {
    const prefix = 'ITHY';
    const timestamp = Date.now().toString(36).toUpperCase(); // Unique-ish time
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase(); // Random 4 chars
    const randomPartPre = Math.random().toString(6).substring(2, 6).toUpperCase(); // Random 4 chars
    return `${randomPartPre}-${prefix}-${timestamp}-${randomPart}`;
};


const Coupons = () => {
    const [coupons, setCoupons] = useState(dummyCoupons);
    const [selectedCouponId, setSelectedCouponId] = useState(null);
    const [searchField, setSearchField] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortType, setSortType] = useState('');

    const [form, setForm] = useState({
        couponId: generateCouponId(), // Auto-created
        couponCode: '',
        validityPerUser: '',
        expiryDate: '',
        couponType: '',
        value: '',
        createdOn: new Date().toISOString().split('T')[0],
    });


    const handleChange = (field) => (value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (selectedCouponId) {
            // Update
            const updated = coupons.map((c) =>
                c.couponId === selectedCouponId ? { ...form } : c
            );
            setCoupons(updated);
        } else {
            // Add new
            const newCoupon = {
                ...form,
                createdOn: new Date().toISOString().split('T')[0],
            };
            setCoupons((prev) => [...prev, newCoupon]);
        }

        // Reset form (new ID)
        setForm({
            couponId: generateCouponId(),
            couponCode: '',
            validityPerUser: '',
            expiryDate: '',
            couponType: '',
            value: '',
            createdOn: new Date().toISOString().split('T')[0],
        });
        setSelectedCouponId(null);
    };


    const handleEdit = (coupon) => {
        setForm(coupon);
        setSelectedCouponId(coupon.couponId);
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this coupon?');
        if (confirmed) {
            setCoupons(prev => prev.filter(c => c.couponId !== id));
        }
    };

    // Filter + Sort
    const filteredCoupons = coupons
        .filter(c => {
            if (!searchQuery || !searchField) return true;
            return String(c[searchField]).toLowerCase().includes(searchQuery.toLowerCase());
        })
        .filter(c => !sortType || c.couponType === sortType);

    return (
        <Layout title={'Add Coupons'} active={'admin-13'}>
            <div className="coupons-wrapper-page">
                {/* Left - Add/Edit Form */}
                <div className="addcoupon-left">
                    <Container gap={10} title={selectedCouponId ? 'Edit Coupon' : 'Add Coupon'}>
                        <InputCustomLabelled
                            label="Coupon Code"
                            value={form.couponCode}
                            inputFunction={handleChange('couponCode')}
                        />
                        <InputCustomLabelled
                            label="Coupon ID"
                            value={form.couponId}
                            inputFunction={handleChange('couponId')}
                            disabled={true}
                        />

                        <InputCustomLabelled
                            label="Validity Per User"
                            type="number"
                            value={form.validityPerUser}
                            inputFunction={handleChange('validityPerUser')}
                        />
                        <InputCustomLabelled
                            label="Expiry Date"
                            type="date"
                            value={form.expiryDate}
                            inputFunction={handleChange('expiryDate')}
                        />
                        <SelectCustomLabelled
                            label="Coupon Type"
                            htmlFor="couponType"
                            value={form.couponType}
                            selectFunction={handleChange('couponType')}
                            options={[
                                { value: 'flat', label: 'Flat Amount' },
                                { value: 'percentage', label: 'Percentage' },
                            ]}
                        />
                        <InputCustomLabelled
                            label="Value"
                            type="number"
                            value={form.value}
                            inputFunction={handleChange('value')}
                        />
                        <button className="primary-btn" style={{ marginTop: '10px' }} onClick={handleSubmit}>
                            {selectedCouponId ? 'Update Coupon' : 'Add Coupon'}
                        </button>
                    </Container>
                </div>

                {/* Right - Search + Table */}
                <div className="listcoupon-right">
                    <Container gap={10} title="Coupons List">
                        <div className="search-sort-bar" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <SelectCustomLabelled
                                label="Search Field"
                                value={searchField}
                                selectFunction={val => setSearchField(val)}
                                options={[
                                    { value: 'couponId', label: 'Coupon ID' },
                                    { value: 'couponCode', label: 'Coupon Code' },
                                ]}
                            />
                            <InputCustomLabelled
                                label="Search"
                                value={searchQuery}
                                inputFunction={val => setSearchQuery(val)}
                            />
                            <SelectCustomLabelled
                                label="Sort by Type"
                                value={sortType}
                                selectFunction={val => setSortType(val)}
                                options={[
                                    { value: '', label: 'All' },
                                    { value: 'flat', label: 'Flat Amount' },
                                    { value: 'percentage', label: 'Percentage' },
                                ]}
                            />
                        </div>

                        <DataTable
                            columns={[
                                { label: 'Coupon ID', value: 'couponId' },
                                { label: 'Code', value: 'couponCode' },
                                { label: 'Value', value: 'value' },
                                { label: 'Type', value: 'couponType' },
                                { label: 'Expiry', value: 'expiryDate' },
                            ]}
                            data={filteredCoupons}
                            actions={(row) => (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button
                                        className="small-btn edit-btn"
                                        onClick={() => handleEdit(row)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="small-btn delete-btn"
                                        onClick={() => handleDelete(row.couponId)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        />
                    </Container>
                </div>
            </div>
        </Layout>
    );
};

export default Coupons;
