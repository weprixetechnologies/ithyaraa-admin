import React, { useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { createFlashSale } from '../../lib/api/flashSaleApi';
import { useNavigate } from 'react-router-dom';

export default function AddFlashSale() {
    const [form, setForm] = useState({ name: '', startTime: '', endTime: '', status: 'active', metadata: '' });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const save = async () => {
        setSaving(true);
        try {
            const { success, saleID } = await createFlashSale(form);
            if (success) navigate(`/flash-sale/edit/${saleID}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout title={'Add Flash Sale'} active={'admin-flash-sale-add'}>
            <Container>
                <h1 className="text-xl font-semibold mb-4">Add Flash Sale</h1>
                <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Name" value={form.name} onChange={e => set('name', e.target.value)} />
                    <Input type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                    <Input type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
                    <Input placeholder="Status (active/inactive)" value={form.status} onChange={e => set('status', e.target.value)} />
                    <Input placeholder="Metadata (JSON)" value={form.metadata} onChange={e => set('metadata', e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end mt-4">
                    <Button variant="secondary" onClick={() => navigate('/flash-sale/list')}>Cancel</Button>
                    <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
                </div>
            </Container>
        </Layout>
    );
}


