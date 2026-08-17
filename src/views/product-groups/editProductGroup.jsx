import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getProductGroupByID, updateProductGroup, addProductsToGroup, replaceProductsInGroup, getGroupProducts } from "../../lib/api/productGroupsApi";
import { searchOffers, searchCategories } from "../../lib/api/homepageSectionsApi";
import SelectProducts from "@/components/ui/selectProducts";
import UploadImages from '@/components/ui/uploadImages';
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const EditProductGroup = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [metaForm, setMetaForm] = useState({ sectionID: '', title: '', orderIndex: '', imageUrl: '', isBannerised: false, routeTo: '', filters: {} });
    const [offerSuggestions, setOfferSuggestions] = useState([]);
    const [categorySuggestions, setCategorySuggestions] = useState([]);
    const offerTimerRef = React.useRef(null);
    const categoryTimerRef = React.useRef(null);
    const uploadRef = React.useRef(null);
    const navigate = useNavigate();

    const fetchGroup = async () => {
        try {
            setLoading(true);
            const res = await getProductGroupByID(groupId);
            if (res.success) {
                setGroup(res.data);
                const prods = (res.data.products || []).map(p => p.productID);
                setSelectedProducts(prods);
                setMetaForm({
                    sectionID: res.data.sectionID || '',
                    title: res.data.title || '',
                    orderIndex: res.data.orderIndex || 0,
                    imageUrl: res.data.imageUrl || '',
                    isBannerised: !!res.data.isBannerised,
                    routeTo: res.data.routeTo || '',
                    filters: res.data.filters ? (typeof res.data.filters === 'string' ? (() => { try { return JSON.parse(res.data.filters) } catch (e) { return {} } })() : res.data.filters) : {}
                });
            } else {
                toast.error(res.message || "Failed to load group");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load group");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
        // eslint-disable-next-line
    }, [groupId]);

    const handleUpdateDetails = async () => {
        try {
            setLoading(true);

            // Upload new image if provided
            let imageUrl = metaForm.imageUrl || (group && group.imageUrl) || null;
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

            const parsedFilters = normalizeFilters(metaForm.filters);

            const payload = {
                sectionID: metaForm.sectionID !== '' ? parseInt(metaForm.sectionID, 10) : undefined,
                title: metaForm.title !== '' ? String(metaForm.title) : undefined,
                orderIndex: metaForm.orderIndex !== '' ? parseInt(metaForm.orderIndex, 10) : undefined,
                imageUrl: imageUrl,
                isBannerised: !!metaForm.isBannerised,
                routeTo: metaForm.routeTo || null,
                filters: parsedFilters
            };

            const res = await updateProductGroup(groupId, payload);
            if (res.success) {
                toast.success("Group updated");
                await fetchGroup();
            } else {
                toast.error(res.message || "Failed to update");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update group");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProducts = async (productIDs) => {
        try {
            setLoading(true);
            const res = await addProductsToGroup(groupId, productIDs);
            if (res.success) {
                toast.success("Products added");
                fetchGroup();
            } else {
                toast.error(res.message || "Failed to add products");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to add products");
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceProducts = async (productIDs) => {
        if (!window.confirm("Replace all existing products for this group?")) return;
        try {
            setLoading(true);
            const res = await replaceProductsInGroup(groupId, productIDs);
            if (res.success) {
                toast.success("Products replaced");
                fetchGroup();
            } else {
                toast.error(res.message || "Failed to replace products");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to replace products");
        } finally {
            setLoading(false);
        }
    };

    const handleProductToggle = (pid) => {
        setSelectedProducts(prev => {
            const exists = prev.includes(pid);
            if (exists) return prev.filter(p => p !== pid);
            return [...prev, pid];
        });
    };

    return (
        <Layout active={"admin-product-groups"}>
            <div className="min-h-screen bg-background p-6">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Edit Product Group</h2>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate("/product-groups/list")} variant="outline">Back</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded shadow col-span-1">
                            <h3 className="font-semibold mb-2">Metadata</h3>
                            {group ? (
                                <div className="space-y-3">
                                    <label className="flex flex-col">
                                        Section ID
                                        <input
                                            type="number"
                                            value={metaForm.sectionID}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, sectionID: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        Title
                                        <input
                                            type="text"
                                            value={metaForm.title}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        Order Index
                                        <input
                                            type="number"
                                            value={metaForm.orderIndex}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, orderIndex: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        Route To
                                        <input
                                            type="text"
                                            placeholder="/shop"
                                            value={metaForm.routeTo}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, routeTo: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>
                                    <div className="flex flex-col mt-3">
                                        <h4 className="font-medium text-sm mb-2">Filters</h4>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={!!(metaForm.filters && metaForm.filters.offer)} onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), offer: checked ? (ms.filters?.offer || {}) : undefined } }));
                                                }} /> Offer
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={!!(metaForm.filters && metaForm.filters.category)} onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), category: checked ? (ms.filters?.category || {}) : undefined } }));
                                                }} /> Category
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={metaForm.filters && metaForm.filters.minPrice !== undefined} onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), minPrice: checked ? (ms.filters?.minPrice || '') : undefined } }));
                                                }} /> Min Price
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={metaForm.filters && metaForm.filters.maxPrice !== undefined} onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), maxPrice: checked ? (ms.filters?.maxPrice || '') : undefined } }));
                                                }} /> Max Price
                                            </label>
                                        </div>

                                        {/* Offer selector */}
                                        {metaForm.filters && metaForm.filters.offer !== undefined && (
                                            <div className="mt-3">
                                                <label className="text-xs text-secondary-text">Search Offer</label>
                                                <input className="border p-2 rounded mt-1 w-full" placeholder="Search offers by name" defaultValue={metaForm.filters.offer?.name || ''} onChange={(e) => {
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
                                                                setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), offer: s } }));
                                                                setOfferSuggestions([]);
                                                            }}>{s.name || s.title || s.offerID || s.id}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {metaForm.filters.offer && (
                                                    <div className="text-xs text-secondary-text mt-1">Selected: {metaForm.filters.offer.name || metaForm.filters.offer.title || metaForm.filters.offer.offerID || metaForm.filters.offer.id}</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Category selector */}
                                        {metaForm.filters && metaForm.filters.category !== undefined && (
                                            <div className="mt-3">
                                                <label className="text-xs text-secondary-text">Search Category</label>
                                                <input className="border p-2 rounded mt-1 w-full" placeholder="Search categories by name" defaultValue={metaForm.filters.category?.categoryName || ''} onChange={(e) => {
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
                                                                setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), category: s } }));
                                                                setCategorySuggestions([]);
                                                            }}>{s.categoryName || s.name || s.categoryID || s.id}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {metaForm.filters.category && (
                                                    <div className="text-xs text-secondary-text mt-1">Selected: {metaForm.filters.category.categoryName || metaForm.filters.category.name}</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Min/Max price inputs */}
                                        {metaForm.filters && metaForm.filters.minPrice !== undefined && (
                                            <div className="mt-3">
                                                <label className="text-xs text-secondary-text">Min Price</label>
                                                <input type="number" className="border p-2 rounded mt-1 w-full" value={metaForm.filters.minPrice} onChange={(e) => {
                                                    const v = e.target.value;
                                                    setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), minPrice: v } }));
                                                }} />
                                            </div>
                                        )}
                                        {metaForm.filters && metaForm.filters.maxPrice !== undefined && (
                                            <div className="mt-3">
                                                <label className="text-xs text-secondary-text">Max Price</label>
                                                <input type="number" className="border p-2 rounded mt-1 w-full" value={metaForm.filters.maxPrice} onChange={(e) => {
                                                    const v = e.target.value;
                                                    setMetaForm(ms => ({ ...ms, filters: { ...(ms.filters || {}), maxPrice: v } }));
                                                }} />
                                            </div>
                                        )}
                                    </div>

                                    <label className="flex flex-col mt-4">
                                        Image Preview
                                        <div className="mt-2">
                                            <img
                                                src={metaForm.imageUrl || group.imageUrl || '/placeholder.png'}
                                                alt="Group Image"
                                                className="w-48 h-28 object-cover rounded border"
                                            />
                                        </div>
                                    </label>

                                    <label className="flex flex-col">
                                        Replace Image
                                        <div className="mt-2">
                                            <UploadImages ref={uploadRef} maxImages={1} defaultImages={metaForm.imageUrl ? [metaForm.imageUrl] : (group.imageUrl ? [group.imageUrl] : [])} />
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!!metaForm.isBannerised}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, isBannerised: e.target.checked }))}
                                        />
                                        <span>Is Bannerised</span>
                                    </label>

                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => { setMetaForm({ sectionID: group.sectionID, orderIndex: group.orderIndex, imageUrl: group.imageUrl, isBannerised: !!group.isBannerised }); }}>Reset</Button>
                                        <Button className="bg-purple-600 text-white" onClick={handleUpdateDetails} disabled={loading}>Update Details</Button>
                                    </div>
                                </div>
                            ) : <div>Loading...</div>}
                        </div>

                        <div className="bg-white p-4 rounded shadow col-span-2">
                            <h3 className="font-semibold mb-2">Manage Products</h3>
                            <p className="text-sm text-gray-500 mb-3">Search products below and toggle to add/remove selection. Use "Add Selected" to append or "Replace All" to overwrite.</p>

                            <div className="mb-4">
                                <SelectProducts onProductToggle={handleProductToggle} initialSelected={selectedProducts} />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => handleAddProducts(selectedProducts)}>Add Selected</Button>
                                <Button className="bg-red-600 text-white" onClick={() => handleReplaceProducts(selectedProducts)}>Replace All</Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default EditProductGroup;

