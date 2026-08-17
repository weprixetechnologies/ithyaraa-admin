import React, { useState, useEffect } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import {
    getAllFeaturedBlocks,
    createFeaturedBlock,
    deleteFeaturedBlock,
    updateFeaturedBlock,
    reorderFeaturedBlocks,
} from '@/lib/api/featuredBlocksApi';
import { getPaginatedCategories } from '@/lib/api/categoryApi';
import { getPaginatedOffers } from '@/lib/api/offerApi';
import { toast } from 'react-toastify';
import {
    RiImageAddLine,
    RiDeleteBinLine,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiFilter3Line,
    RiEditLine,
    RiCloseLine,
    RiInformationLine,
} from 'react-icons/ri';

const BUNNY = {
    storageZone: 'ithyaraa',
    storageRegion: 'sg.storage.bunnycdn.com',
    pullZoneUrl: 'https://ithyaraa.b-cdn.net',
    apiKey: '7017f7c4-638b-48ab-add3858172a8-f520-4b88',
};

const uploadToBunny = async (file) => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `featured-block-${Date.now()}.${ext}`;
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

const AddFeaturedBlock = () => {
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [offers, setOffers] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [routeTo, setRouteTo] = useState('shop');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [offerID, setOfferID] = useState('');
    const [editingBlock, setEditingBlock] = useState(null);

    const inputRef = React.useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [blocksRes, catsRes, offersRes] = await Promise.all([
                getAllFeaturedBlocks(),
                getPaginatedCategories({ limit: 100 }),
                getPaginatedOffers({ limit: 100 })
            ]);

            if (blocksRes.success) setBlocks(blocksRes.data);
            if (catsRes.success) setCategories(catsRes.data);
            if (offersRes.success) setOffers(offersRes.data);
        } catch (e) {
            toast.error('Failed to load data');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (blocks.length >= 4) {
            toast.warning('Maximum 4 blocks allowed');
            return;
        }

        setUploading(true);
        try {
            const image_url = await uploadToBunny(file);
            const result = await createFeaturedBlock({
                image_url,
                routeTo,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                category: categoryID || null,
                offer: offerID || null,
                position: blocks.length
            });

            if (result.success) {
                toast.success('Block added');
                fetchData();
            } else {
                toast.error(result.error || 'Failed to save');
            }
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleEditClick = (block) => {
        setEditingBlock(block);
        setRouteTo(block.routeTo || 'shop');
        setMinPrice(block.minPrice || '');
        setMaxPrice(block.maxPrice || '');
        setCategoryID(block.category || '');
        setOfferID(block.offer || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async () => {
        if (!editingBlock) return;
        setUploading(true);
        try {
            const result = await updateFeaturedBlock(editingBlock.id, {
                routeTo,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                category: categoryID || null,
                offer: offerID || null,
            });
            if (result.success) {
                toast.success('Configuration updated');
                setEditingBlock(null);
                fetchData();
            } else {
                toast.error(result.error || 'Update failed');
            }
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this block?')) return;
        const res = await deleteFeaturedBlock(id);
        if (res.success) {
            toast.success('Removed');
            fetchData();
        } else {
            toast.error(res.error || 'Delete failed');
        }
    };

    const move = async (index, direction) => {
        const list = [...blocks];
        const toIndex = direction === 'left' ? index - 1 : index + 1;
        if (toIndex < 0 || toIndex >= list.length) return;
        [list[index], list[toIndex]] = [list[toIndex], list[index]];
        const order = list.map((b) => b.id);
        try {
            const res = await reorderFeaturedBlocks({ order });
            if (res.success) {
                fetchData();
            }
        } catch (e) {
            toast.error('Move failed');
        }
    };

    const cancelEdit = () => {
        setEditingBlock(null);
        setRouteTo('shop');
        setMinPrice('');
        setMaxPrice('');
        setCategoryID('');
        setOfferID('');
    };

    return (
        <Layout active="admin-featured-blocks" title="Add Featured Block">
            <Container>
                <div className="flex flex-col gap-2 mb-8">
                    <p className="text-secondary-text">
                        Manage the 4 featured blocks on the homepage. Recommended aspect ratio is 2:3 (e.g. 400x600).
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <RiInformationLine className="w-4 h-4" />
                        <span>Maximum of 4 blocks can be displayed on the homepage. Configure navigation before uploading.</span>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 border rounded-lg p-6 bg-white shadow-sm flex flex-col gap-6 transition-all ${editingBlock ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <RiFilter3Line className="text-primary" />
                                    {editingBlock ? 'Edit Block' : 'New Block Config'}
                                </h2>
                                {editingBlock && (
                                    <button onClick={cancelEdit} className="text-red-500 hover:text-red-700">
                                        <RiCloseLine className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Route To</label>
                                    <select
                                        value={routeTo}
                                        onChange={(e) => setRouteTo(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                                    >
                                        <option value="shop">Shop Page</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={categoryID}
                                        onChange={(e) => setCategoryID(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(c => (
                                            <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Min Price</label>
                                        <input
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="Min"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Max Price</label>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="Max"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Offer</label>
                                    <select
                                        value={offerID}
                                        onChange={(e) => setOfferID(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
                                    >
                                        <option value="">No Filter</option>
                                        {offers.map(o => (
                                            <option key={o.offerID} value={o.offerID}>{o.offerName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFile}
                                    />
                                    {editingBlock ? (
                                        <Button
                                            onClick={handleUpdate}
                                            disabled={uploading}
                                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {uploading ? 'Updating...' : <><RiEditLine className="inline mr-2" /> Update Block</>}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => inputRef.current?.click()}
                                            disabled={uploading || blocks.length >= 4}
                                            className="w-full h-12"
                                        >
                                            {uploading ? 'Uploading...' : <><RiImageAddLine className="inline mr-2" /> {blocks.length >= 4 ? 'Limit Reached' : 'Add Image Block'}</>}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview/List Section */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {blocks.length === 0 && !loading && (
                                <div className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl h-64 flex items-center justify-center text-gray-400">
                                    No featured blocks added yet.
                                </div>
                            )}
                            {blocks.map((block, index) => (
                                <div key={block.id} className={`group relative bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${editingBlock?.id === block.id ? 'ring-4 ring-blue-400 scale-[1.02]' : ''}`}>
                                    <div className="aspect-[2/3] bg-gray-100 overflow-hidden">
                                        <img
                                            src={block.image_url}
                                            alt={`Featured Block ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    
                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                        <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                            #{index + 1}
                                        </span>
                                        {block.category && (
                                            <span className="bg-blue-600/80 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                                CAT: {block.category}
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => handleEditClick(block)}
                                            className="p-3 bg-white text-blue-600 rounded-full shadow-xl hover:scale-110 transition-transform"
                                        >
                                            <RiEditLine className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(block.id)}
                                            className="p-3 bg-white text-red-600 rounded-full shadow-xl hover:scale-110 transition-transform"
                                        >
                                            <RiDeleteBinLine className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button
                                            disabled={index === 0}
                                            onClick={() => move(index, 'left')}
                                            className="p-2 bg-white/90 text-gray-700 rounded-lg shadow disabled:opacity-30 hover:bg-white"
                                        >
                                            <RiArrowLeftLine className="w-5 h-5" />
                                        </button>
                                        <button
                                            disabled={index === blocks.length - 1}
                                            onClick={() => move(index, 'right')}
                                            className="p-2 bg-white/90 text-gray-700 rounded-lg shadow disabled:opacity-30 hover:bg-white"
                                        >
                                            <RiArrowRightLine className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </Layout>
    );
};

export default AddFeaturedBlock;
