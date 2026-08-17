import React, { useState, useEffect } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOfferSectionItem } from "../../lib/api/offerSectionItemsApi";
import { listCustomImageSections } from "src/lib/api/customImageSectionsApi";
import { listProductGroups } from "src/lib/api/productGroupsApi";
import { listComboSectionGroups } from "../../lib/api/comboSectionGroupsApi";
import { listPresaleSectionGroups } from "src/lib/api/presaleSectionGroupsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddOfferSectionItem = () => {
    const [itemId, setItemId] = useState('');
    const [type, setType] = useState('imagesection');
    const [order, setOrder] = useState(0);
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!itemId || !type) {
            toast.error('id and type are required');
            return;
        }
        try {
            setLoading(true);
            const res = await createOfferSectionItem({ id: itemId, type, order });
            if (res.success) {
                toast.success('Created');
                navigate('/offer-section-items/list');
            } else {
                toast.error(res.message || 'Failed to create');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to create');
        } finally {
            setLoading(false);
        }
    };

    // fetch options when type changes
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                if (type === 'imagesection') {
                    const res = await listCustomImageSections({ page: 1, limit: 100 });
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else if (type === 'productsection') {
                    const res = await listProductGroups({ page: 1, limit: 100 });
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else if (type === 'combosection') {
                    const res = await listComboSectionGroups({ page: 1, limit: 100 });
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else if (type === 'presalesection') {
                    const res = await listPresaleSectionGroups({ page: 1, limit: 100 });
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else {
                    setOptions([]);
                }
                setSelectedOption(null);
                setItemId('');
                setSearch('');
            } catch (err) {
                console.error(err);
                setOptions([]);
            }
        };
        fetchOptions();
    }, [type]);

    const filteredOptions = options.filter(opt => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        if (type === 'imagesection') {
            return String(opt.title || '').toLowerCase().includes(q) || String(opt.sectionID || '').toLowerCase().includes(q);
        }
        if (type === 'productsection') {
            return String(opt.sectionID || '').toLowerCase().includes(q) || String(opt.id || '').toLowerCase().includes(q);
        }
        if (type === 'combosection') {
            return String(opt.sectionID || '').toLowerCase().includes(q) || String(opt.id || '').toLowerCase().includes(q) || String(opt.title || '').toLowerCase().includes(q);
        }
        if (type === 'presalesection') {
            return String(opt.sectionID || '').toLowerCase().includes(q) || String(opt.id || '').toLowerCase().includes(q) || String(opt.title || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <Layout active={"admin-offer-section-items"} title={"Add Offer Section Item"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <h1 className="text-2xl font-bold mb-4">Add Offer Section Item</h1>
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-2xl">
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded w-full">
                                <option value="imagesection">imagesection</option>
                                <option value="productsection">productsection</option>
                                <option value="combosection">combosection</option>
                                <option value="presalesection">presalesection</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Search {type === 'imagesection' ? 'Image Sections' : type === 'combosection' ? 'Combo Groups' : type === 'presalesection' ? 'Presale Groups' : 'Product Groups'}</label>
                            <div className="flex gap-2">
                                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="search by id or title" />
                                <Button type="button" onClick={() => { setSearch(''); }}>Clear</Button>
                            </div>

                            <div className="mt-2 max-h-48 overflow-auto border rounded p-2 bg-white">
                                {filteredOptions.length === 0 ? (
                                    <div className="text-sm text-muted-foreground p-2">No results</div>
                                ) : filteredOptions.map(opt => {
                                    const key = opt.sectionID;
                                    const label = `${opt.sectionID} — ${opt.title || '-'}`;
                                    const isSelected = selectedOption && String(selectedOption.key) === String(key);
                                    return (
                                        <div key={key} className={`p-2 cursor-pointer ${isSelected ? 'bg-slate-100' : 'hover:bg-background'}`} onClick={() => {
                                            setSelectedOption({ key, label, raw: opt });
                                            setItemId(key);
                                        }}>
                                            <div className="text-sm">{label}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedOption && (
                                <div className="mt-2 p-2 bg-background rounded">
                                    <div className="text-sm">Selected: <strong>{selectedOption.label}</strong></div>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Order</label>
                            <Input type="number" value={order} onChange={e => setOrder(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/offer-section-items/list')}>Cancel</Button>
                        </div>
                    </form>
                </Container>
            </div>
        </Layout>
    );
};

export default AddOfferSectionItem;
