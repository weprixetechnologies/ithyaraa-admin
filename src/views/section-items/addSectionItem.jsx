import React, { useState, useEffect } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSectionItem } from "src/lib/api/sectionItemsApi";
import { listCustomImageSections } from "src/lib/api/customImageSectionsApi";
import { listProductGroups } from "src/lib/api/productGroupsApi";
import { listPresaleSectionGroups } from "src/lib/api/presaleSectionGroupsApi";
import { getAllFeaturedCoupons, createFeaturedCoupon } from "src/lib/api/featuredCouponsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    RiImageAddLine,
    RiCloseLine,
    RiCoupon3Line,
    RiCheckboxCircleLine,
} from "react-icons/ri";

const BUNNY = {
    storageZone: 'ithyaraa',
    storageRegion: 'sg.storage.bunnycdn.com',
    pullZoneUrl: 'https://ithyaraa.b-cdn.net',
    apiKey: '7017f7c4-638b-48ab-add3858172a8-f520-4b88',
};

const uploadToBunny = async (file) => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `featured-coupon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadUrl = `https://${BUNNY.storageRegion}/${BUNNY.storageZone}/${fileName}`;
    const publicUrl = `${BUNNY.pullZoneUrl}/${fileName}`;

    const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            AccessKey: BUNNY.apiKey,
            'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return publicUrl;
};

const AddSectionItem = () => {
    const [itemId, setItemId] = useState('');
    const [type, setType] = useState('imagesection');
    const [order, setOrder] = useState(0);
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Featured coupon state
    const [popupImageFile, setPopupImageFile] = useState(null);
    const [iconImageFile, setIconImageFile] = useState(null);
    const [popupImagePreview, setPopupImagePreview] = useState(null);
    const [iconImagePreview, setIconImagePreview] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (type === 'featuredcoupon') {
            // Handle featured coupon creation
            if (!popupImageFile || !iconImageFile || !couponCode) {
                toast.error('Popup image, icon image, and coupon code are required');
                return;
            }

            try {
                setLoading(true);
                setUploading(true);

                // Upload both images
                const [popupUrl, iconUrl] = await Promise.all([
                    uploadToBunny(popupImageFile),
                    uploadToBunny(iconImageFile),
                ]);

                // Create featured coupon in DB
                const couponRes = await createFeaturedCoupon({
                    popupImage: popupUrl,
                    iconImage: iconUrl,
                    couponCode: couponCode
                });

                if (!couponRes.success) {
                    toast.error(couponRes.error || 'Failed to create featured coupon');
                    return;
                }

                // Create section item linking to the coupon
                const sectionRes = await createSectionItem({
                    id: String(couponRes.id),
                    type: 'featuredcoupon',
                    order,
                });

                if (sectionRes.success) {
                    toast.success('Featured Coupon added to homepage!');
                    navigate('/section-items/list');
                } else {
                    toast.error(sectionRes.message || 'Failed to create section item');
                }
            } catch (err) {
                console.error(err);
                toast.error(err.message || 'Failed to create');
            } finally {
                setLoading(false);
                setUploading(false);
            }
            return;
        }

        // Existing logic for other types
        if (!itemId || !type) {
            toast.error('id and type are required');
            return;
        }
        try {
            setLoading(true);
            const res = await createSectionItem({ id: itemId, type, order });
            if (res.success) {
                toast.success('Created');
                navigate('/section-items/list');
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
                } else if (type === 'productsection' || type === 'product section') {
                    const res = await listProductGroups({ page: 1, limit: 100 });
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else if (type === 'presalesection' || type === 'presale section') {
                    const res = await listPresaleSectionGroups({ page: 1, limit: 100 });
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else if (type === 'featuredcoupon') {
                    // Load existing coupons for reference
                    const res = await getAllFeaturedCoupons();
                    if (res.success) {
                        setOptions(res.data || []);
                    } else setOptions([]);
                } else {
                    setOptions([]);
                }
                setSelectedOption(null);
                setItemId('');
                setSearch('');
                // Reset coupon images when type changes
                setPopupImageFile(null);
                setIconImageFile(null);
                setPopupImagePreview(null);
                setIconImagePreview(null);
                setCouponCode('');
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
        if (type === 'productsection' || type === 'product section') {
            return String(opt.sectionID || '').toLowerCase().includes(q) || String(opt.id || '').toLowerCase().includes(q);
        }
        if (type === 'presalesection' || type === 'presale section') {
            return String(opt.sectionID || '').toLowerCase().includes(q) || String(opt.id || '').toLowerCase().includes(q) || String(opt.title || '').toLowerCase().includes(q);
        }
        if (type === 'featuredcoupon') {
            return String(opt.id || '').includes(q);
        }
        return true;
    });

    const handleFileSelect = (e, setFile, setPreview) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const clearFile = (setFile, setPreview) => {
        setFile(null);
        setPreview(null);
    };

    return (
        <Layout active={"admin-section-items"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <h1 className="text-2xl font-bold mb-4">Add Section Item</h1>
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-2xl">
                        <div className="mb-4">
                            <label className="block font-medium mb-1">Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="p-2 border rounded w-full">
                                <option value="imagesection">imagesection</option>
                                <option value="productsection">productsection</option>
                                <option value="presalesection">presalesection</option>
                                <option value="featuredcoupon">featuredcoupon</option>
                            </select>
                        </div>

                        {/* ── Featured Coupon UI ── */}
                        {type === 'featuredcoupon' && (
                            <div className="mb-6 space-y-6">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <RiCoupon3Line className="w-5 h-5 text-amber-600" />
                                        <h3 className="font-semibold text-amber-800">Featured Coupon Widget</h3>
                                    </div>
                                    <p className="text-sm text-amber-700">
                                        This creates a fixed floating widget in the bottom-right corner of the homepage.
                                        Upload a <strong>popup image</strong> (shown when user clicks the icon) and an <strong>icon image</strong> (the small floating button).
                                    </p>
                                </div>

                                {/* Coupon Code */}
                                <div>
                                    <label className="block font-medium mb-2 text-gray-700">
                                        🎟️ Coupon Code <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        value={couponCode} 
                                        onChange={e => setCouponCode(e.target.value)} 
                                        placeholder="e.g. SAVE50" 
                                        className="border-amber-300 focus:ring-amber-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This code will be auto-applied when the user clicks the coupon image.</p>
                                </div>

                                {/* Existing coupons reference */}
                                {options.length > 0 && (
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Existing Featured Coupons ({options.length})</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {options.map(fc => (
                                                <div key={fc.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                                                    <img src={fc.iconImage} alt="icon" className="w-10 h-10 rounded object-cover border" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-gray-500">ID: {fc.id}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${fc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {fc.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Popup Image Upload */}
                                <div>
                                    <label className="block font-medium mb-2 text-gray-700">
                                        📋 Popup Image <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">This is the full-size image shown when user taps the coupon icon. Recommended: portrait or square ratio.</p>
                                    {popupImagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={popupImagePreview} alt="Popup preview" className="w-48 h-auto rounded-lg border-2 border-amber-300 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => clearFile(setPopupImageFile, setPopupImagePreview)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                            >
                                                <RiCloseLine className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <RiCheckboxCircleLine className="w-3 h-3" /> Ready
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors">
                                            <RiImageAddLine className="w-8 h-8 text-amber-400 mb-1" />
                                            <span className="text-sm text-amber-600">Upload Popup</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileSelect(e, setPopupImageFile, setPopupImagePreview)}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Icon Image Upload */}
                                <div>
                                    <label className="block font-medium mb-2 text-gray-700">
                                        🔔 Bottom Icon Image <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">This is the small floating icon in the bottom-right corner. Recommended: 80×80 or 100×100 square.</p>
                                    {iconImagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={iconImagePreview} alt="Icon preview" className="w-20 h-20 rounded-full border-2 border-amber-300 shadow-sm object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => clearFile(setIconImageFile, setIconImagePreview)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                            >
                                                <RiCloseLine className="w-4 h-4" />
                                            </button>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <RiCheckboxCircleLine className="w-3 h-3" /> Ready
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-amber-300 rounded-full cursor-pointer hover:bg-amber-50 transition-colors">
                                            <RiImageAddLine className="w-6 h-6 text-amber-400" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileSelect(e, setIconImageFile, setIconImagePreview)}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Existing selector for imagesection / productsection ── */}
                        {type !== 'featuredcoupon' && (
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Search {type === 'imagesection' ? 'Image Sections' : type === 'presalesection' ? 'Presale Groups' : 'Product Groups'}</label>
                                <div className="flex gap-2">
                                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="search by id or title" />
                                    <Button type="button" onClick={() => { setSearch(''); }}>Clear</Button>
                                </div>

                                <div className="mt-2 max-h-48 overflow-auto border rounded p-2 bg-white">
                                    {filteredOptions.length === 0 ? (
                                        <div className="text-sm text-muted-foreground p-2">No results</div>
                                    ) : filteredOptions.map(opt => {
                                        const key = type === 'imagesection' ? opt.sectionID : opt.sectionID;
                                        const label = type === 'imagesection' ? `${opt.sectionID} — ${opt.title}` : `${opt.sectionID} — ${opt.title || '-'}`;
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
                        )}

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Order</label>
                            <Input type="number" value={order} onChange={e => setOrder(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading || uploading}>
                                {uploading ? 'Uploading images...' : loading ? 'Saving...' : type === 'featuredcoupon' ? '🎁 Create Featured Coupon' : 'Save'}
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/section-items/list')}>Cancel</Button>
                        </div>
                    </form>
                </Container>
            </div>
        </Layout>
    );
};

export default AddSectionItem;
