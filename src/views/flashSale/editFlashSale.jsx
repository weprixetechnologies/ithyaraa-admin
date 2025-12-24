import React, { useEffect, useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { listFlashSaleItems, setFlashSaleItems, updateFlashSale, getFlashSaleDetail } from '../../lib/api/flashSaleApi';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditFlashSale() {
  const { saleID } = useParams();
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', status: 'active', metadata: '' });
  const [items, setItems] = useState([]); // [{ productID, discountType, discountValue }]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Meta
        const meta = await getFlashSaleDetail(saleID);
        if (meta?.success && meta.data) {
          // Normalize keys from DB into our state keys
          const m = meta.data;
          setForm({
            name: m.name || '',
            startTime: (m.startTime || m.start_time || '').replace('Z',''),
            endTime: (m.endTime || m.end_time || '').replace('Z',''),
            status: m.status || 'active',
            metadata: m.metadata ? (typeof m.metadata === 'string' ? m.metadata : JSON.stringify(m.metadata)) : ''
          });
        }
        // Items
        const resp = await listFlashSaleItems(saleID);
        if (resp?.success) {
          const rows = (resp.data || []).map(r => ({
            productID: r.productID,
            discountType: (r.discountType || 'percentage'),
            discountValue: Number(r.discountValue || 0)
          }));
          setItems(rows);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [saleID]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const saveMeta = async () => {
    setSaving(true);
    try {
      await updateFlashSale(saleID, form);
    } finally {
      setSaving(false);
    }
  };

  const saveItems = async () => {
    // basic validation
    const payload = items
      .filter(it => it.productID)
      .map(it => ({ productID: it.productID.trim(), discountType: it.discountType || 'percentage', discountValue: Number(it.discountValue || 0) }));
    await setFlashSaleItems(saleID, { items: payload });
  };

  const updateItem = (idx, key, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: value } : it));
  };
  const addRow = () => setItems(prev => [...prev, { productID: '', discountType: 'percentage', discountValue: 0 }]);
  const removeRow = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <Layout title={`Edit Flash Sale: ${saleID}`} active={'admin-flash-sale-list'}>
      <Container>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Edit Flash Sale: {saleID}</h1>
            <Button variant="secondary" onClick={() => navigate('/flash-sale/list')}>Back</Button>
          </div>

          <div className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Name" value={form.name} onChange={e => set('name', e.target.value)} />
            <Input type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            <Input type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
            <Input placeholder="Status (active/inactive)" value={form.status} onChange={e => set('status', e.target.value)} />
            <Input placeholder="Metadata (JSON)" value={form.metadata} onChange={e => set('metadata', e.target.value)} />
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-600">Items (Product, Discount Type, Discount Value)</label>
                <Button size="sm" onClick={addRow}>Add Item</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product ID</th>
                      <th className="text-left p-2">Discount Type</th>
                      <th className="text-left p-2">Discount Value</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td className="p-3" colSpan={4}>No items</td></tr>
                    ) : items.map((it, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 w-[40%]"><Input value={it.productID} onChange={e => updateItem(idx, 'productID', e.target.value)} placeholder="ITHY..." /></td>
                        <td className="p-2 w-[25%]">
                          <select className="border rounded px-2 py-2 w-full" value={it.discountType} onChange={e => updateItem(idx, 'discountType', e.target.value)}>
                            <option value="percentage">percentage</option>
                            <option value="fixed">fixed</option>
                          </select>
                        </td>
                        <td className="p-2 w-[25%]"><Input type="number" step="0.01" value={it.discountValue} onChange={e => updateItem(idx, 'discountValue', e.target.value)} /></td>
                        <td className="p-2 w-[10%]"><Button variant="secondary" size="sm" onClick={() => removeRow(idx)}>Remove</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button onClick={saveMeta} disabled={saving}>{saving ? 'Saving...' : 'Save Meta'}</Button>
            <Button onClick={saveItems}>Save Items</Button>
          </div>
      </Container>
    </Layout>
  );
}


