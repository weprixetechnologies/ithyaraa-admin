import React, { useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { InputUi } from "@/components/ui/inputui";
import { Button } from "@/components/ui/button";
import { createProductGroup } from "../../lib/api/productGroupsApi";
import { searchOffers, searchCategories } from "../../lib/api/homepageSectionsApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UploadImages from '@/components/ui/uploadImages';

const AddProductGroup = () => {
    const [form, setForm] = useState({ sectionID: "", title: "", orderIndex: 0, imageUrl: "", isBannerised: false, routeTo: "", filters: {} });
    const [loading, setLoading] = useState(false);
    const [offerSuggestions, setOfferSuggestions] = useState([]);
    const [categorySuggestions, setCategorySuggestions] = useState([]);
    const offerTimerRef = useRef(null);
    const categoryTimerRef = useRef(null);
    const navigate = useNavigate();

    const uploadRef = useRef(null);
    const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.sectionID) return toast.error("sectionID is required");
        try {
            setLoading(true);
            // Upload image via Bunny (UploadImages component)
            let imageUrl = null;
            if (uploadRef.current?.uploadImageFunction) {
                const uploaded = await uploadRef.current.uploadImageFunction();
                if (uploaded && uploaded.length > 0 && uploaded[0].imgUrl) {
                    imageUrl = uploaded[0].imgUrl;
                }
            }

            const normalizeFilters = (raw) => {
                if (!raw || typeof raw !== 'object') return null;
                const out = {};
                if (raw.offer) {
                    const o = raw.offer;
                    if (typeof o === 'string') out.offerID = o;
                    else if (o.offerID) out.offerID = o.offerID;
                    else if (o.id) out.offerID = o.id;
                }
                if (raw.category) {
                    const c = raw.category;
                    if (typeof c === 'number' || /^\\d+$/.test(String(c))) out.categoryID = Number(c);
                    else if (c.categoryID) out.categoryID = c.categoryID;
                    else if (c.id) out.categoryID = c.id;
                }
                if (raw.minPrice !== undefined && raw.minPrice !== '') out.minPrice = Number(raw.minPrice);
                if (raw.maxPrice !== undefined && raw.maxPrice !== '') out.maxPrice = Number(raw.maxPrice);
                return Object.keys(out).length ? out : null;
            };

            const parsedFilters = normalizeFilters(form.filters);

            const res = await createProductGroup({
                sectionID: parseInt(form.sectionID, 10),
                title: form.title || null,
                orderIndex: parseInt(form.orderIndex, 10) || 0,
                imageUrl: imageUrl,
                isBannerised: !!form.isBannerised,
                routeTo: form.routeTo || null,
                filters: parsedFilters
            });
            if (res.success) {
                toast.success("Group created");
                navigate("/product-groups/list");
            } else {
                toast.error(res.message || res.error || "Failed to create group");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout active={"admin-product-groups"}>
            <div className="min-h-screen bg-background p-6">
                <Container>
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Create Product Group</h2>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <label className="flex flex-col">
                                Section ID
                                <input type="number" value={form.sectionID} onChange={(e) => onChange('sectionID', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <label className="flex flex-col">
                                Title
                                <input type="text" value={form.title} onChange={(e) => onChange('title', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <label className="flex flex-col">
                                Order Index
                                <input type="number" value={form.orderIndex} onChange={(e) => onChange('orderIndex', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <label className="flex flex-col">
                                Route To
                                <input type="text" placeholder="/shop" value={form.routeTo} onChange={(e) => onChange('routeTo', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <div className="flex flex-col mt-3">
                                <h4 className="font-medium text-sm mb-2">Filters</h4>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={!!(form.filters && form.filters.offer)} onChange={(e) => {
                                            const checked = e.target.checked;
                                            setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), offer: checked ? (ms.filters?.offer || {}) : undefined } }));
                                        }} /> Offer
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={!!(form.filters && form.filters.category)} onChange={(e) => {
                                            const checked = e.target.checked;
                                            setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), category: checked ? (ms.filters?.category || {}) : undefined } }));
                                        }} /> Category
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.filters && form.filters.minPrice !== undefined} onChange={(e) => {
                                            const checked = e.target.checked;
                                            setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), minPrice: checked ? (ms.filters?.minPrice || '') : undefined } }));
                                        }} /> Min Price
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.filters && form.filters.maxPrice !== undefined} onChange={(e) => {
                                            const checked = e.target.checked;
                                            setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), maxPrice: checked ? (ms.filters?.maxPrice || '') : undefined } }));
                                        }} /> Max Price
                                    </label>
                                </div>

                                {/* Offer selector */}
                                {form.filters && form.filters.offer !== undefined && (
                                    <div className="mt-3">
                                        <label className="text-xs text-secondary-text">Search Offer</label>
                                        <input className="border p-2 rounded mt-1 w-full" placeholder="Search offers by name" defaultValue={form.filters.offer?.name || ''} onChange={(e) => {
                                            const q = e.target.value;
                                            if (offerTimerRef.current) clearTimeout(offerTimerRef.current);
                                            offerTimerRef.current = setTimeout(async () => {
                                                const r = await searchOffers(q);
                                                setOfferSuggestions(r.result || []);
                                            }, 300);
                                        }} />
                                        {offerSuggestions.length > 0 && (
                                            <div className="border mt-1 rounded max-h-40 overflow-auto bg-white z-10 absolute">
                                                {offerSuggestions.map((s, i) => (
                                                    <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                                                        setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), offer: s } }));
                                                        setOfferSuggestions([]);
                                                    }}>{s.name || s.title || s.offerID || s.id}</div>
                                                ))}
                                            </div>
                                        )}
                                        {form.filters.offer && (
                                            <div className="text-xs text-secondary-text mt-1">Selected: {form.filters.offer.name || form.filters.offer.title || form.filters.offer.offerID || form.filters.offer.id}</div>
                                        )}
                                    </div>
                                )}

                                {/* Category selector */}
                                {form.filters && form.filters.category !== undefined && (
                                    <div className="mt-3">
                                        <label className="text-xs text-secondary-text">Search Category</label>
                                        <input className="border p-2 rounded mt-1 w-full" placeholder="Search categories by name" defaultValue={form.filters.category?.categoryName || ''} onChange={(e) => {
                                            const q = e.target.value;
                                            if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
                                            categoryTimerRef.current = setTimeout(async () => {
                                                const r = await searchCategories(q);
                                                setCategorySuggestions(r.data || []);
                                            }, 300);
                                        }} />
                                        {categorySuggestions.length > 0 && (
                                            <div className="border mt-1 rounded max-h-40 overflow-auto bg-white z-10 absolute">
                                                {categorySuggestions.map((s, i) => (
                                                    <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                                                        setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), category: s } }));
                                                        setCategorySuggestions([]);
                                                    }}>{s.categoryName || s.name || s.categoryID || s.id}</div>
                                                ))}
                                            </div>
                                        )}
                                        {form.filters.category && (
                                            <div className="text-xs text-secondary-text mt-1">Selected: {form.filters.category.categoryName || form.filters.category.name}</div>
                                        )}
                                    </div>
                                )}

                                {/* Min/Max price inputs */}
                                {form.filters && form.filters.minPrice !== undefined && (
                                    <div className="mt-3">
                                        <label className="text-xs text-secondary-text">Min Price</label>
                                        <input type="number" className="border p-2 rounded mt-1 w-full" value={form.filters.minPrice} onChange={(e) => {
                                            const v = e.target.value;
                                            setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), minPrice: v } }));
                                        }} />
                                    </div>
                                )}
                                {form.filters && form.filters.maxPrice !== undefined && (
                                    <div className="mt-3">
                                        <label className="text-xs text-secondary-text">Max Price</label>
                                        <input type="number" className="border p-2 rounded mt-1 w-full" value={form.filters.maxPrice} onChange={(e) => {
                                            const v = e.target.value;
                                            setForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), maxPrice: v } }));
                                        }} />
                                    </div>
                                )}
                            </div>
                            <label className="flex flex-col">
                                Upload Image
                                <div className="mt-2">
                                    <UploadImages ref={uploadRef} maxImages={1} />
                                </div>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.isBannerised} onChange={(e) => onChange('isBannerised', e.target.checked)} />
                                <span>Is Bannerised</span>
                            </label>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => navigate("/product-groups/list")}>Cancel</Button>
                                <Button type="submit" className="bg-purple-600 text-white" disabled={loading}>Create</Button>
                            </div>
                        </form>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default AddProductGroup;

