import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { listOfferSectionItems, reorderOfferSectionItems, deleteOfferSectionItem, clearOfferSectionItemsCache } from "../../lib/api/offerSectionItemsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../lib/axiosInstance";

const ListOfferSectionItems = () => {
    const [items, setItems] = useState([]);
    const [type, setType] = useState('');
    const [filterId, setFilterId] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedJson, setFeedJson] = useState(null);
    const [jsonLoading, setJsonLoading] = useState(false);
    const [revalidateCheck, setRevalidateCheck] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listOfferSectionItems({ type: type || undefined });
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

        const updated = list.map((it, idx) => ({ ...it, orderIndex: idx }));
        setItems(updated);

        try {
            const payload = updated.map(it => ({ id: it.entryId || it.id, orderIndex: it.orderIndex }));
            const res = await reorderOfferSectionItems(payload);
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

    const handleDelete = async (key) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            const res = await deleteOfferSectionItem(key);
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
    };

    const fetchFeedJson = async () => {
        try {
            setJsonLoading(true);
            const url = `/offer/offerpage-app${revalidateCheck ? '?revalidate=true' : ''}`;
            const res = await axiosInstance.get(url);
            setFeedJson(res.data);
            toast.success(`Latest offer feed JSON fetched ${revalidateCheck ? '(with cache revalidation)' : '(from cache)'}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch JSON feed');
        } finally {
            setJsonLoading(false);
        }
    };

    return (
        <Layout active={"admin-offer-section-items"} title={"Offer Section Items"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Offer Page Customize</h1>
                            <p className="text-sm text-gray-500">Configure layout and display order of sections on the offer page</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate('/offer-section-items/add')}>Add Item</Button>
                            <Button variant="outline" onClick={async () => {
                                if (!window.confirm('Clear Offer Page cache?')) return;
                                try {
                                    const res = await clearOfferSectionItemsCache();
                                    if (res.success) {
                                        toast.success('Offer page cache cleared');
                                        fetchData();
                                    } else {
                                        toast.error(res.message || 'Failed to clear cache');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to clear cache');
                                }
                            }}>Clear Offer Cache</Button>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-2 items-center">
                        <label className="font-medium">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded">
                            <option value="">All</option>
                            <option value="imagesection">imagesection</option>
                            <option value="productsection">productsection</option>
                            <option value="presalesection">presalesection</option>
                            <option value="combosection">combosection</option>
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="p-6 text-center">{loading ? 'Loading...' : 'No items'}</TableCell></TableRow>
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
                                                {s.title || s.name || s.sectionID || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => navigate(`/offer-section-items/edit/${key}`)}>Edit</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(key)}>Delete</Button>
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
                                <h3 className="font-semibold text-gray-800 text-sm">Live Offer Page Feed JSON (App Cache)</h3>
                                <p className="text-xs text-gray-500">Inspect the exact cached feed data that is sent to the Flutter app</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={revalidateCheck} 
                                        onChange={(e) => setRevalidateCheck(e.target.checked)} 
                                        className="rounded border-gray-300"
                                    />
                                    <span>Force Cache Revalidate (?revalidate=true)</span>
                                </label>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={fetchFeedJson}
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

export default ListOfferSectionItems;
