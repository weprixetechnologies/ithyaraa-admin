import React, { useState, useEffect } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import {
    getAllSliderBanners,
    createSliderBanner,
    deleteSliderBanner,
    updateSliderBanner,
    reorderSliderBanners,
} from '@/lib/api/sliderBannersApi';
import { getPaginatedCategories } from '@/lib/api/categoryApi';
import { getPaginatedOffers } from '@/lib/api/offerApi';
import { toast } from 'react-toastify';
import {
    RiImageAddLine,
    RiDeleteBinLine,
    RiArrowUpLine,
    RiArrowDownLine,
    RiSmartphoneLine,
    RiComputerLine,
    RiArrowRightSLine,
    RiFilter3Line,
    RiEditLine,
    RiCloseLine,
} from 'react-icons/ri';

const BUNNY = {
    storageZone: 'ithyaraa',
    storageRegion: 'sg.storage.bunnycdn.com',
    pullZoneUrl: 'https://ithyaraa.b-cdn.net',
    apiKey: '7017f7c4-638b-48ab-add3858172a8-f520-4b88',
};

const uploadToBunny = async (file, type) => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `home-slider-${type}-${Date.now()}.${ext}`;
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

const SliderSection = ({
    type,
    title,
    spec,
    icon: Icon,
    banners,
    categories = [],
    offers = [],
    onAdd,
    onDelete,
    onMoveUp,
    onMoveDown,
    loading,
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Filter fields state
    const [routeTo, setRouteTo] = useState('shop');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [offerID, setOfferID] = useState('');
    const [editingBanner, setEditingBanner] = useState(null);

    const inputRef = React.useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        setUploading(true);
        try {
            const image_url = await uploadToBunny(file, type);
            const result = await createSliderBanner({
                type,
                image_url,
                routeTo,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                category: categoryID || null,
                offer: offerID || null,
            });
            if (result.success) {
                toast.success('Image uploaded and added to slider');
                onAdd();
            } else {
                toast.error(result.message || result.error || 'Failed to save');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleEditClick = (banner) => {
        setEditingBanner(banner);
        setRouteTo(banner.routeTo || 'shop');
        setMinPrice(banner.minPrice || '');
        setMaxPrice(banner.maxPrice || '');
        setCategoryID(banner.category || '');
        setOfferID(banner.offer || '');
        toast.info('Configuration loaded. You can now edit and update.');
    };

    const handleUpdate = async () => {
        if (!editingBanner) return;
        setUploading(true);
        try {
            const result = await updateSliderBanner(editingBanner.id, {
                routeTo,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                category: categoryID || null,
                offer: offerID || null,
            });
            if (result.success) {
                toast.success('Configuration updated');
                setEditingBanner(null);
                onAdd(); // Refresh list
            } else {
                toast.error(result.error || 'Update failed');
            }
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setUploading(false);
        }
    };

    const cancelEdit = () => {
        setEditingBanner(null);
        setRouteTo('shop');
        setMinPrice('');
        setMaxPrice('');
        setCategoryID('');
        setOfferID('');
    };

    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm flex flex-col gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-secondary-text" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">{spec}</p>
            </div>

            {/* Config Section */}
            <div className={`border p-4 rounded-lg transition-colors ${editingBanner ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <RiFilter3Line className="w-4 h-4" />
                        <span>{editingBanner ? 'Editing Configuration' : 'Navigation & Filter Config (Apply to next upload)'}</span>
                    </div>
                    {editingBanner && (
                        <button
                            onClick={cancelEdit}
                            className="text-xs text-red-600 hover:underline flex items-center gap-0.5"
                        >
                            <RiCloseLine /> Cancel
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Route To</label>
                        <select
                            value={routeTo}
                            onChange={(e) => setRouteTo(e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-primary h-9"
                        >
                            <option value="shop">Shop</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Category</label>
                        <select
                            value={categoryID}
                            onChange={(e) => setCategoryID(e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-primary h-9"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Min Price</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Min"
                            className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-primary h-9"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Max Price</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Max"
                            className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-primary h-9"
                        />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">Offer</label>
                        <select
                            value={offerID}
                            onChange={(e) => setOfferID(e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-primary h-9"
                        >
                            <option value="">No offer limit</option>
                            {offers.map(o => (
                                <option key={o.offerID} value={o.offerID}>{o.offerName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                />
                {editingBanner ? (
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        disabled={uploading || loading}
                        className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                    >
                        {uploading ? 'Updating…' : <><RiEditLine className="w-5 h-5 mr-2 inline" /> Update configuration</>}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading || loading}
                        className="w-full h-12 text-base"
                    >
                        {uploading ? 'Uploading…' : <><RiImageAddLine className="w-5 h-5 mr-2 inline" /> Add image with config</>}
                    </Button>
                )}
            </div>

            <div
                className={`min-h-[120px] rounded border-2 border-dashed p-3 flex flex-wrap gap-3 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                        const fakeEvent = { target: { files: [file] } };
                        handleFile(fakeEvent);
                    }
                }}
            >
                {banners.length === 0 ? (
                    <p className="text-gray-400 text-sm self-center w-full text-center">No images. Upload or drag & drop.</p>
                ) : (
                    banners.map((b, i) => (
                        <div
                            key={b.id}
                            className={`relative group w-32 h-32 rounded-lg overflow-hidden border bg-gray-100 shadow-sm transition-all ${editingBanner?.id === b.id ? 'ring-4 ring-blue-400 scale-105 z-10' : 'hover:scale-105'}`}
                        >
                            <img
                                src={b.image_url || null}
                                alt={`Slide ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Info */}
                            {(b.category || b.minPrice || b.maxPrice || b.offer) && (
                                <div className="absolute top-1 left-1 flex gap-1 flex-wrap">
                                    <div className="bg-black/70 text-white text-[8px] px-1 rounded flex items-center gap-0.5">
                                        <RiArrowRightSLine /> {b.routeTo}
                                    </div>
                                    {b.category && <div className="bg-blue-600/90 text-white text-[8px] px-1 rounded">CAT: {b.category}</div>}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleEditClick(b)}
                                        className="p-1.5 rounded bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                                        title="Edit config"
                                    >
                                        <RiEditLine className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMoveUp(type, i)}
                                        disabled={i === 0}
                                        className="p-1.5 rounded bg-white text-black disabled:opacity-30 shadow-lg"
                                        title="Move left"
                                    >
                                        <RiArrowUpLine className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMoveDown(type, i)}
                                        disabled={i === banners.length - 1}
                                        className="p-1.5 rounded bg-white text-black disabled:opacity-30 shadow-lg"
                                        title="Move right"
                                    >
                                        <RiArrowDownLine className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onDelete(b.id)}
                                    className="p-2 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors"
                                    title="Delete"
                                >
                                    <RiDeleteBinLine className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ManageHomeSlider = () => {
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const [reordering, setReordering] = useState(false);

    // Meta data for dropdowns
    const [categories, setCategories] = useState([]);
    const [offers, setOffers] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bannersRes, catsRes, offersRes] = await Promise.all([
                getAllSliderBanners(),
                getPaginatedCategories({ limit: 100 }), // Increased limit for dropdown
                getPaginatedOffers({ limit: 100 })
            ]);

            if (bannersRes.success) setBanners(bannersRes.data);
            if (catsRes.success) setCategories(catsRes.data);
            if (offersRes.success) setOffers(offersRes.data);
        } catch (e) {
            toast.error('Failed to load slider data');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const mobileBanners = banners.filter((b) => b.type === 'mobile');
    const desktopBanners = banners.filter((b) => b.type === 'desktop');

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this image from the slider?')) return;
        const res = await deleteSliderBanner(id);
        if (res.success) {
            toast.success('Removed');
            fetchData();
        } else {
            toast.error(res.error || 'Delete failed');
        }
    };

    const move = async (type, fromIndex, direction) => {
        const list = type === 'mobile' ? [...mobileBanners] : [...desktopBanners];
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= list.length) return;
        [list[fromIndex], list[toIndex]] = [list[toIndex], list[fromIndex]];
        const order = list.map((b) => b.id);
        setReordering(true);
        try {
            const res = await reorderSliderBanners({ type, order });
            if (res.success) {
                toast.success('Order updated');
                fetchData();
            } else {
                toast.error(res.error || 'Reorder failed');
            }
        } finally {
            setReordering(false);
        }
    };

    return (
        <Layout active="admin-home-slider" title="Home Page Slider Banners">
            <Container>
                <div className="flex flex-col gap-1 mb-8">
                    <p className="text-secondary-text">
                        Upload images for the home page sliders. Mobile uses 1:1 (square); desktop uses 1470×489 (≈3:1).
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                        Configure filters below before clicking "Add image" to set navigation targets for new sliders.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <SliderSection
                        type="mobile"
                        title="Mobile slider (1:1)"
                        spec="Aspect ratio 1:1. Shown on home page in mobile view."
                        icon={RiSmartphoneLine}
                        banners={mobileBanners}
                        categories={categories}
                        offers={offers}
                        onAdd={fetchData}
                        onDelete={handleDelete}
                        onMoveUp={(_, i) => move('mobile', i, 'up')}
                        onMoveDown={(_, i) => move('mobile', i, 'down')}
                        loading={loading || reordering}
                    />
                    <SliderSection
                        type="desktop"
                        title="Desktop slider (1470×489)"
                        spec="Aspect ratio 1470:489 (≈3:1). Shown on home page in desktop view."
                        icon={RiComputerLine}
                        banners={desktopBanners}
                        categories={categories}
                        offers={offers}
                        onAdd={fetchData}
                        onDelete={handleDelete}
                        onMoveUp={(_, i) => move('desktop', i, 'up')}
                        onMoveDown={(_, i) => move('desktop', i, 'down')}
                        loading={loading || reordering}
                    />
                </div>
            </Container>
        </Layout>
    );
};

export default ManageHomeSlider;
