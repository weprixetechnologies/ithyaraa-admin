import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { listSectionItems, reorderSectionItems } from "src/lib/api/sectionItemsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ListSectionItems = () => {
    const [items, setItems] = useState([]);
    const [type, setType] = useState('');
    const [filterId, setFilterId] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedJson, setFeedJson] = useState(null);
    const [jsonLoading, setJsonLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listSectionItems({ type: type || undefined });
            if (res.success) {
                let data = res.data || [];
                if (filterId) {
                    data = data.filter(d => String(d.itemId) === String(filterId) || String(d.id) === String(filterId));
                }
                setItems(data);
            } else {
                toast.error(res.message || "Failed to fetch");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [type]);

    // drag handlers
    const onDragStart = (e, id) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = async (e, targetId) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;

        const list = [...items];
        const getKey = (s) => String(s.entryId || s.id);
        const fromIndex = list.findIndex(i => getKey(i) === String(draggedId));
        const toIndex = list.findIndex(i => getKey(i) === String(targetId));
        if (fromIndex === -1 || toIndex === -1) return;

        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);

        // update orderIndex locally
        const updated = list.map((it, idx) => ({ ...it, orderIndex: idx }));
        setItems(updated);

        // persist to server
        try {
            const payload = updated.map(it => ({ id: it.entryId || it.id, orderIndex: it.orderIndex }));
            const res = await reorderSectionItems(payload);
            if (res.success) {
                toast.success('Order updated');
            } else {
                toast.error(res.message || 'Failed to save order');
                fetchData();
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to save order');
            fetchData();
        }
    };

    return (
        <Layout active={"admin-section-items"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Section Items</h1>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate('/section-items/add')}>Add Item</Button>
                            <Button variant="outline" onClick={async () => {
                                if (!window.confirm('Clear home cache?')) return;
                                try {
                                    const { clearSectionItemsCache } = await import('src/lib/api/sectionItemsApi');
                                    const res = await clearSectionItemsCache();
                                    if (res.success) {
                                        toast.success('Home cache cleared');
                                        fetchData();
                                    } else {
                                        toast.error(res.message || 'Failed to clear cache');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to clear cache');
                                }
                            }}>Clear Home Cache</Button>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-2 items-center">
                        <label className="font-medium">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded">
                            <option value="">All</option>
                            <option value="imagesection">imagesection</option>
                            <option value="productsection">productsection</option>
                            <option value="presalesection">presalesection</option>
                            <option value="featuredcoupon">featuredcoupon</option>
                            <option value="product section">product section</option>
                        </select>
                        <label className="font-medium">Filter by Item ID</label>
                        <input value={filterId} onChange={e => setFilterId(e.target.value)} placeholder="item id" className="p-2 border rounded" />
                        <Button onClick={fetchData}>Search</Button>
                    </div>

                    <div className="bg-white rounded shadow">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entry ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Item ID</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Name / Title</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="p-6 text-center">{loading ? 'Loading...' : 'No items'}</TableCell></TableRow>
                                ) : items.map(s => {
                                    const key = s.entryId || s.id;
                                    return (
                                        <TableRow key={key}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, String(key))}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => onDrop(e, String(key))}
                                        >
                                            <TableCell>#{key}</TableCell>
                                            <TableCell>{s.type}</TableCell>
                                            <TableCell>{s.itemId}</TableCell>
                                            <TableCell>{s.orderIndex}</TableCell>
                                            <TableCell>
                                                {s.type === 'featuredcoupon' && s.coupon ? (
                                                    <div className="flex items-center gap-2">
                                                        <img src={s.coupon.iconImage} alt="coupon" className="w-8 h-8 rounded-full object-cover border" />
                                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🎁 Featured Coupon</span>
                                                    </div>
                                                ) : (s.title || s.name || s.sectionID || '-')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => navigate(`/section-items/edit/${key}`)}>Edit</Button>
                                                    <Button size="sm" variant="destructive" onClick={async () => {
                                                        if (!window.confirm('Delete this item?')) return;
                                                        try {
                                                            const { deleteSectionItem } = await import('src/lib/api/sectionItemsApi');
                                                            const res = await deleteSectionItem(key);
                                                            if (res.success) {
                                                                toast.success('Deleted');
                                                                fetchData();
                                                            } else {
                                                                toast.error(res.message || 'Failed to delete');
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                            toast.error('Failed to delete');
                                                        }
                                                    }}>Delete</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Live JSON Inspector */}
                    <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div>
                                <h3 className="font-semibold text-gray-800 text-sm">Live Homepage Feed JSON (App Cache)</h3>
                                <p className="text-xs text-gray-500">Inspect the exact cached feed data that is sent to the Flutter app</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={async () => {
                                        try {
                                            setJsonLoading(true);
                                            const { listSectionItems } = await import('src/lib/api/sectionItemsApi');
                                            const res = await listSectionItems();
                                            setFeedJson(res);
                                            toast.success('Latest feed JSON fetched');
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Failed to fetch JSON feed');
                                        } finally {
                                            setJsonLoading(false);
                                        }
                                    }}
                                    disabled={jsonLoading}
                                >
                                    {jsonLoading ? 'Fetching...' : 'Fetch Feed JSON'}
                                </Button>
                                {feedJson && (
                                    <>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(feedJson, null, 2));
                                                toast.success('Copied to clipboard');
                                            }}
                                        >
                                            Copy JSON
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => setFeedJson(null)}
                                        >
                                            Hide Panel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {feedJson && (
                            <div className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] max-h-[400px] overflow-auto leading-relaxed">
                                <pre>{JSON.stringify(feedJson, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default ListSectionItems;

