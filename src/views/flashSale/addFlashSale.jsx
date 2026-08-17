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

    const formatDateTimeForInput = (dateValue) => {
        if (!dateValue || dateValue === '') return '';

        let val = dateValue;
        if (typeof val === 'string') {
            if (val.includes(' ') && !val.includes('T') && !val.includes('Z')) {
                val = val.replace(' ', 'T') + 'Z';
            }
            else if (val.includes('T') && !val.includes('Z') && !val.includes('+') && !val.includes('-')) {
                val = val + 'Z';
            }
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const save = async () => {
        setSaving(true);
        try {
            const convertToMySQL = (dateStr) => {
                if (!dateStr || dateStr === '') return null;
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return null;
                
                const pad = (n) => n.toString().padStart(2, '0');
                // Format to LOCAL YYYY-MM-DD HH:mm:ss
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const payload = {
                ...form,
                startTime: convertToMySQL(form.startTime),
                endTime: convertToMySQL(form.endTime)
            };

            const response = await createFlashSale(payload);
            if (response.success) navigate(`/flash-sale/edit/${response.saleID}`);
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


