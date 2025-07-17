import React, { useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import SelectCustomLabelled from '../../components/ui/customSelect';
import DataTable from '../../components/ui/dataTable';
import './giftcard.css';

const SECRET_SALT = 'ITHYARAA'; // 🔐 Keep this private & secure

// Generate a hash-based key from the mainCode and salt
const generateKeyPart = (mainCode) => {
    let hash = 0;
    const str = mainCode + SECRET_SALT;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 5).toUpperCase(); // 5-char key
};

// Full secure code generator
const generateSecureGiftcardCode = () => {
    const mainCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const keyPart = generateKeyPart(mainCode);
    const finalCode = `GFT-${mainCode}-${keyPart}`;

    // 🔍 Log for debugging or admin
    console.log('🔐 Gift Card Code Generated:');
    console.log('Main Code:', mainCode);
    console.log('Key Part:', keyPart);
    console.log('Final Code:', finalCode);

    return finalCode;
};

const generateGiftcardId = () => {
    const prefix = 'GFT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

const dummyGiftcards = [
    {
        giftcardId: 'GFT-ABC123-K9X8',
        giftcardCode: generateSecureGiftcardCode(),
        amount: 250,
        expiryDate: '2025-12-31',
        createdOn: '2024-07-10',
    },
    {
        giftcardId: 'GFT-JKL456-D3R2',
        giftcardCode: generateSecureGiftcardCode(),
        amount: 500,
        expiryDate: '2025-11-15',
        createdOn: '2024-06-28',
    },
];

const Giftcard = () => {
    const [giftcards, setGiftcards] = useState(dummyGiftcards);
    const [selectedGiftcardId, setSelectedGiftcardId] = useState(null);
    const [searchField, setSearchField] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [form, setForm] = useState({
        giftcardId: generateGiftcardId(),
        giftcardCode: generateSecureGiftcardCode(),
        expiryDate: '',
        amount: '',
        createdOn: new Date().toISOString().split('T')[0],
    });

    const handleChange = (field) => (value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (selectedGiftcardId) {
            const updated = giftcards.map((g) =>
                g.giftcardId === selectedGiftcardId ? { ...form } : g
            );
            setGiftcards(updated);
        } else {
            setGiftcards((prev) => [...prev, { ...form }]);
        }

        setForm({
            giftcardId: generateGiftcardId(),
            giftcardCode: generateSecureGiftcardCode(),
            expiryDate: '',
            amount: '',
            createdOn: new Date().toISOString().split('T')[0],
        });
        setSelectedGiftcardId(null);
    };

    const handleEdit = (giftcard) => {
        setForm(giftcard);
        setSelectedGiftcardId(giftcard.giftcardId);
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm('Delete this gift card?');
        if (confirmed) {
            setGiftcards((prev) => prev.filter((g) => g.giftcardId !== id));
        }
    };

    const filteredGiftcards = giftcards.filter((g) => {
        if (!searchQuery || !searchField) return true;
        return String(g[searchField]).toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <Layout active={'admin-6a'} title={'GiftCards'}>
            <div className="coupons-wrapper-page">
                {/* Left: Giftcard Generator */}
                <div className="addcoupon-left">
                    <Container gap={10} title={selectedGiftcardId ? 'Edit Gift Card' : 'Generate Gift Card'}>
                        <InputCustomLabelled
                            label="Gift Card ID"
                            value={form.giftcardId}
                            inputFunction={handleChange('giftcardId')}
                            disabled={true}
                        />

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <InputCustomLabelled
                                    label="Gift Card Code"
                                    value={form.giftcardCode}
                                    inputFunction={handleChange('giftcardCode')}
                                />
                            </div>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                    setForm((prev) => ({
                                        ...prev,
                                        giftcardCode: generateSecureGiftcardCode(),
                                    }))
                                }
                            >
                                Generate
                            </button>
                        </div>

                        <InputCustomLabelled
                            label="Amount"
                            type="number"
                            value={form.amount}
                            inputFunction={handleChange('amount')}
                        />
                        <InputCustomLabelled
                            label="Expiry Date"
                            type="date"
                            value={form.expiryDate}
                            inputFunction={handleChange('expiryDate')}
                        />
                        <button
                            className="primary-btn"
                            style={{ marginTop: '10px' }}
                            onClick={handleSubmit}
                        >
                            {selectedGiftcardId ? 'Update Gift Card' : 'Generate Gift Card'}
                        </button>
                    </Container>
                </div>

                {/* Right: Gift Card List */}
                <div className="listcoupon-right">
                    <Container title="Gift Card List">
                        <div
                            className="search-sort-bar"
                            style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
                        >
                            <SelectCustomLabelled
                                label="Search Field"
                                value={searchField}
                                selectFunction={(val) => setSearchField(val)}
                                options={[
                                    { value: 'giftcardId', label: 'Gift Card ID' },
                                    { value: 'giftcardCode', label: 'Gift Card Code' },
                                ]}
                            />
                            <InputCustomLabelled
                                label="Search"
                                value={searchQuery}
                                inputFunction={(val) => setSearchQuery(val)}
                            />
                        </div>

                        <DataTable
                            columns={[
                                { label: 'Gift Card ID', value: 'giftcardId' },
                                { label: 'Code', value: 'giftcardCode' },
                                { label: 'Amount', value: 'amount' },
                                { label: 'Expiry', value: 'expiryDate' },
                            ]}
                            data={filteredGiftcards}
                            actions={(row) => (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button className="small-btn edit-btn" onClick={() => handleEdit(row)}>
                                        Edit
                                    </button>
                                    <button className="small-btn delete-btn" onClick={() => handleDelete(row.giftcardId)}>
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

export default Giftcard;
