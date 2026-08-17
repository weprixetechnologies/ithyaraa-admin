import React, { useEffect, useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { getCustomImageSection, updateCustomImageSection, addImagesToSection, listImagesForSection, updateSectionImage, deleteSectionImage } from "../../lib/api/customImageSectionsApi";
import { searchOffers, searchCategories } from "../../lib/api/homepageSectionsApi";
import UploadImages from '@/components/ui/uploadImages';
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const EditCustomImageSection = () => {
    const { id } = useParams();
    const [section, setSection] = useState(null);
    const [meta, setMeta] = useState({ sectionID: '', title: '', layoutID: '', isBannerised: false });
    const uploadRef = useRef(null);
    const addImagesRef = useRef(null);
    const [images, setImages] = useState([]);
    const [pendingUploads, setPendingUploads] = useState([]); // { imageUrl, routeTo, filters (object), keep:true }
    const [modalState, setModalState] = useState({ open: false, type: null, index: null, image: null }); // type: 'pending'|'existing'
    const [loading, setLoading] = useState(false);
    const [offerSuggestions, setOfferSuggestions] = useState([]);
    const [categorySuggestions, setCategorySuggestions] = useState([]);
    const offerTimerRef = useRef(null);
    const categoryTimerRef = useRef(null);
    const navigate = useNavigate();

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await getCustomImageSection(id);
            if (res.success) {
                setSection(res.data);
                setMeta({ sectionID: res.data.sectionID || '', title: res.data.title || '', layoutID: res.data.layoutID || '', isBannerised: !!res.data.isBannerised });
                const imgs = await listImagesForSection(id);
                if (imgs.success) {
                    const parsed = (imgs.data || []).map(r => ({ ...r, filters: r.filters ? (() => { try { return JSON.parse(r.filters) } catch (e) { return {} } })() : {} }));
                    setImages(parsed);
                }
            } else toast.error(res.message || 'Failed');
        } catch (err) { console.error(err); toast.error('Failed'); } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [id]);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            let imageUrl = meta.imageUrl || section?.imageUrl || null;
            if (uploadRef.current?.uploadImageFunction) {
                const uploaded = await uploadRef.current.uploadImageFunction();
                if (uploaded && uploaded.length > 0) imageUrl = uploaded[0].imgUrl;
            }
            const payload = { sectionID: meta.sectionID || null, title: meta.title || null, layoutID: meta.layoutID || null, imageUrl, isBannerised: !!meta.isBannerised };
            const res = await updateCustomImageSection(id, payload);
            if (res.success) { toast.success('Updated'); fetch(); } else toast.error(res.message || 'Failed');
        } catch (err) { console.error(err); toast.error('Failed'); } finally { setLoading(false); }
    };

    const handleAddImages = async () => {
        try {
            if (!addImagesRef.current?.uploadImageFunction) return;
            const uploaded = await addImagesRef.current.uploadImageFunction();
            if (!uploaded || uploaded.length === 0) return toast.info('No images uploaded');

            const newPending = uploaded.map(u => ({ imageUrl: u.imgUrl, routeTo: 'shop', filters: {}, keep: true }));
            setPendingUploads(prev => [...prev, ...newPending]);
            // open modal to edit first pending
            setModalState({ open: true, type: 'pending', index: pendingUploads.length, image: newPending[0] });
        } catch (err) { console.error(err); toast.error('Failed to add'); }
    };

    const openPendingModal = (index) => {
        setModalState({ open: true, type: 'pending', index, image: pendingUploads[index] });
    };

    const openExistingModal = (index) => {
        setModalState({ open: true, type: 'existing', index, image: images[index] });
    };

    const closeModal = () => setModalState({ open: false, type: null, index: null, image: null });

    const normalizeFilters = (raw) => {
        if (!raw || typeof raw !== 'object') return null;
        const out = {};
        if (raw.offer) {
            // accept object or string
            const o = raw.offer;
            if (typeof o === 'string') out.offerID = o;
            else if (o.offerID) out.offerID = o.offerID;
            else if (o.id) out.offerID = o.id;
        }
        if (raw.category) {
            const c = raw.category;
            if (typeof c === 'number' || /^\d+$/.test(String(c))) out.categoryID = Number(c);
            else if (c.categoryID) out.categoryID = c.categoryID;
            else if (c.id) out.categoryID = c.id;
        }
        if (raw.minPrice !== undefined && raw.minPrice !== '') out.minPrice = Number(raw.minPrice);
        if (raw.maxPrice !== undefined && raw.maxPrice !== '') out.maxPrice = Number(raw.maxPrice);
        // return null if empty
        return Object.keys(out).length ? out : null;
    };

    const updatePending = (index, patch) => {
        setPendingUploads(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...patch };
            return copy;
        });
        // refresh modal image
        setModalState(ms => ({ ...ms, image: { ...ms.image, ...patch } }));
    };

    const removePending = (index) => {
        setPendingUploads(prev => prev.filter((_, i) => i !== index));
        closeModal();
    };

    const submitPending = async () => {
        try {
            if (pendingUploads.length === 0) return toast.info('No pending uploads');
            const payload = pendingUploads.filter(p => p.keep).map(p => {
                const filters = normalizeFilters(p.filters);
                return { routeTo: p.routeTo || null, filters, imageUrl: p.imageUrl };
            });
            if (payload.length === 0) { toast.info('No images to submit'); return; }
            const res = await addImagesToSection(id, payload);
            if (res.success) {
                toast.success('Images added');
                setPendingUploads([]);
                closeModal();
                fetch();
            } else toast.error(res.message || 'Failed to add');
        } catch (err) { console.error(err); toast.error('Failed to submit'); }
    };

    const handleUpdateExisting = async (index, updated) => {
        try {
            const img = images[index];
            const rawFilters = updated.filters && typeof updated.filters === 'object' ? updated.filters : (updated.filters ? (() => { try { return JSON.parse(updated.filters) } catch (e) { return null } })() : null);
            const filters = normalizeFilters(rawFilters);
            const res = await updateSectionImage(img.id, { routeTo: updated.routeTo || null, filters: filters, imageUrl: updated.imageUrl || img.imageUrl, position: updated.position });
            if (res.success) { toast.success('Image updated'); fetch(); closeModal(); } else toast.error(res.message || 'Failed to update');
        } catch (err) { console.error(err); toast.error('Failed to update'); }
    };

    const handleDeleteExisting = async (index) => {
        try {
            const img = images[index];
            if (!window.confirm('Delete this image?')) return;
            const res = await deleteSectionImage(img.id);
            if (res.success) { toast.success('Deleted'); fetch(); closeModal(); } else toast.error(res.message || 'Failed to delete');
        } catch (err) { console.error(err); toast.error('Failed to delete'); }
    };

    return (
        <Layout active={"admin-custom-image-sections"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Edit Custom Image Section</h2>
                        <div><Button onClick={() => navigate('/custom-image-sections/list')}>Back</Button></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded shadow col-span-1">
                            <label className="flex flex-col">Title<input className="border p-2 rounded mt-1" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} /></label>
                            <label className="flex flex-col mt-2">Section ID<input className="border p-2 rounded mt-1" value={meta.sectionID} onChange={e => setMeta({ ...meta, sectionID: e.target.value })} /></label>
                            <label className="flex flex-col mt-2">Layout ID<input className="border p-2 rounded mt-1" value={meta.layoutID} onChange={e => setMeta({ ...meta, layoutID: e.target.value })} /></label>
                            <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={!!meta.isBannerised} onChange={e => setMeta({ ...meta, isBannerised: e.target.checked })} /> Is Bannerised</label>
                            <div className="mt-3">
                                <h4 className="font-medium">Preview</h4>
                                <img src={section?.imageUrl || '/placeholder.png'} alt="preview" className="w-full h-40 object-cover rounded border mt-2" />
                            </div>
                            <div className="mt-3">
                                <h4 className="font-medium">Replace Image</h4>
                                <UploadImages ref={uploadRef} maxImages={1} />
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" onClick={fetch}>Reset</Button>
                                <Button className="bg-purple-600 text-white" onClick={handleUpdate} disabled={loading}>Update</Button>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded shadow col-span-2">
                            <h4 className="font-semibold mb-2">Section Images</h4>
                            <div className="mb-3">
                                <UploadImages ref={addImagesRef} maxImages={5} />
                                <div className="flex justify-end mt-2">
                                    <Button onClick={handleAddImages}>Add Uploaded Images</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {images.map((img, idx) => (
                                    <div key={img.id} className="border rounded overflow-hidden cursor-pointer" onClick={() => openExistingModal(idx)}>
                                        <img src={img.imageUrl} alt="" className="w-full h-36 object-cover" />
                                        <div className="p-2 text-xs text-secondary-text">Route: {img.routeTo || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Pending uploads list */}
                    {pendingUploads.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold mb-2">Pending Uploaded Images</h4>
                            <div className="grid grid-cols-4 gap-3">
                                {pendingUploads.map((p, i) => (
                                    <div key={i} className="border rounded overflow-hidden cursor-pointer" onClick={() => openPendingModal(i)}>
                                        <img src={p.imageUrl} alt="" className="w-full h-28 object-cover" />
                                        <div className="p-2 text-xs text-secondary-text">Route: {p.routeTo || '—'}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-2 gap-2">
                                <Button variant="outline" onClick={() => { setPendingUploads([]); toast.info('Cleared pending uploads'); }}>Clear Pending</Button>
                                <Button onClick={submitPending}>Submit Pending</Button>
                            </div>
                        </div>
                    )}

                    {/* Modal */}
                    {modalState.open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded p-6 w-full max-w-2xl">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold">{modalState.type === 'pending' ? 'Edit Pending Image' : 'Edit Image'}</h3>
                                    <button className="text-gray-500" onClick={closeModal}>Close</button>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {/* Left: image preview */}
                                    <div>
                                        <img src={modalState.image.imageUrl || modalState.image.imgUrl} alt="preview" className="w-full h-56 object-cover rounded border" />
                                    </div>

                                    {/* Right: route & filters */}
                                    <div>
                                        <label className="flex flex-col">Route To
                                            <select className="border p-2 rounded mt-1" value={modalState.image.routeTo || 'shop'} onChange={(e) => {
                                                const v = e.target.value;
                                                setModalState(ms => ({ ...ms, image: { ...ms.image, routeTo: v } }));
                                            }}>
                                                <option value="shop">Shop</option>
                                            </select>
                                        </label>

                                        <div className="mt-3">
                                            <h4 className="font-medium">Filters</h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={!!(modalState.image.filters && modalState.image.filters.offer)} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), offer: checked ? (ms.image.filters?.offer || {}) : undefined } } }));
                                                    }} /> Offer
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={!!(modalState.image.filters && modalState.image.filters.category)} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), category: checked ? (ms.image.filters?.category || {}) : undefined } } }));
                                                    }} /> Category
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={modalState.image.filters && modalState.image.filters.minPrice !== undefined} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), minPrice: checked ? (ms.image.filters?.minPrice || '') : undefined } } }));
                                                    }} /> Min Price
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={modalState.image.filters && modalState.image.filters.maxPrice !== undefined} onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), maxPrice: checked ? (ms.image.filters?.maxPrice || '') : undefined } } }));
                                                    }} /> Max Price
                                                </label>
                                            </div>

                                            {/* Offer selector */}
                                            {modalState.image.filters && modalState.image.filters.offer !== undefined && (
                                                <div className="mt-3">
                                                    <label className="text-xs text-secondary-text">Search Offer</label>
                                                    <input className="border p-2 rounded mt-1 w-full" placeholder="Search offers by name" defaultValue={modalState.image.filters.offer?.name || ''} onChange={(e) => {
                                                        const q = e.target.value;
                                                        if (offerTimerRef.current) clearTimeout(offerTimerRef.current);
                                                        offerTimerRef.current = setTimeout(async () => {
                                                            const r = await searchOffers(q);
                                                            setOfferSuggestions(r.result || []);
                                                        }, 300);
                                                    }} />
                                                    {offerSuggestions.length > 0 && (
                                                        <div className="border mt-1 rounded max-h-40 overflow-auto bg-white z-10">
                                                            {offerSuggestions.map((s, i) => (
                                                                <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                                                                    setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), offer: s } } }));
                                                                    setOfferSuggestions([]);
                                                                }}>{s.name || s.title || s.offerID || s.id}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {modalState.image.filters.offer && (
                                                        <div className="text-xs text-secondary-text mt-1">Selected: {modalState.image.filters.offer.name || modalState.image.filters.offer.title || modalState.image.filters.offer.offerID || modalState.image.filters.offer.id}</div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Category selector */}
                                            {modalState.image.filters && modalState.image.filters.category !== undefined && (
                                                <div className="mt-3">
                                                    <label className="text-xs text-secondary-text">Search Category</label>
                                                    <input className="border p-2 rounded mt-1 w-full" placeholder="Search categories by name" defaultValue={modalState.image.filters.category?.categoryName || ''} onChange={(e) => {
                                                        const q = e.target.value;
                                                        if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
                                                        categoryTimerRef.current = setTimeout(async () => {
                                                            const r = await searchCategories(q);
                                                            setCategorySuggestions(r.data || []);
                                                        }, 300);
                                                    }} />
                                                    {categorySuggestions.length > 0 && (
                                                        <div className="border mt-1 rounded max-h-40 overflow-auto bg-white z-10">
                                                            {categorySuggestions.map((s, i) => (
                                                                <div key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                                                                    setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), category: s } } }));
                                                                    setCategorySuggestions([]);
                                                                }}>{s.categoryName || s.name || s.categoryID || s.id}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {modalState.image.filters.category && (
                                                        <div className="text-xs text-secondary-text mt-1">Selected: {modalState.image.filters.category.categoryName || modalState.image.filters.category.name}</div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Min/Max price inputs */}
                                            {modalState.image.filters && modalState.image.filters.minPrice !== undefined && (
                                                <div className="mt-3">
                                                    <label className="text-xs text-secondary-text">Min Price</label>
                                                    <input type="number" className="border p-2 rounded mt-1 w-full" value={modalState.image.filters.minPrice} onChange={(e) => {
                                                        const v = e.target.value;
                                                        setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), minPrice: v } } }));
                                                    }} />
                                                </div>
                                            )}
                                            {modalState.image.filters && modalState.image.filters.maxPrice !== undefined && (
                                                <div className="mt-3">
                                                    <label className="text-xs text-secondary-text">Max Price</label>
                                                    <input type="number" className="border p-2 rounded mt-1 w-full" value={modalState.image.filters.maxPrice} onChange={(e) => {
                                                        const v = e.target.value;
                                                        setModalState(ms => ({ ...ms, image: { ...ms.image, filters: { ...(ms.image.filters || {}), maxPrice: v } } }));
                                                    }} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 justify-end mt-4">
                                            {modalState.type === 'pending' ? (
                                                <>
                                                    <Button variant="destructive" onClick={() => removePending(modalState.index)}>Delete</Button>
                                                    <Button onClick={() => {
                                                        // save changes to pending
                                                        updatePending(modalState.index, { routeTo: modalState.image.routeTo, filters: modalState.image.filters });
                                                        closeModal();
                                                    }}>Save</Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button variant="destructive" onClick={() => handleDeleteExisting(modalState.index)}>Delete</Button>
                                                    <Button onClick={() => handleUpdateExisting(modalState.index, modalState.image)}>Save</Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        </Layout>
    );
};

export default EditCustomImageSection;

