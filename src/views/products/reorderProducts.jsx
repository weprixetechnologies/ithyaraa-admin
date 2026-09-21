import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Layout from 'src/layout';
import { useNavigate } from 'react-router-dom';
import { getProductsForReorder, reorderProducts } from '../../lib/api/productsApi';
import { getPaginatedCategories } from '../../lib/api/categoryApi';
import { toast } from 'react-toastify';
import {
    RiLayoutGridLine,
    RiListUnordered,
    RiSearch2Line,
    RiRefreshLine,
    RiSave3Line,
    RiDragMove2Fill,
    RiArrowUpLine,
    RiArrowDownLine,
    RiPushpin2Line,
    RiShoppingBag3Line,
    RiImageLine,
    RiFilter3Line,
    RiCheckLine,
    RiInformationLine,
    RiArrowGoBackLine,
    RiPriceTag3Line,
    RiEyeLine
} from "react-icons/ri";

const ReorderProducts = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Filters & View State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [isDirty, setIsDirty] = useState(false);

    // Drag and drop states
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Direct rank input temp state
    const [rankInputValues, setRankInputValues] = useState({});

    // Fetch master product list and categories
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productRes, catRes] = await Promise.all([
                getProductsForReorder(),
                getPaginatedCategories({ page: 1, limit: 100 })
            ]);

            if (productRes?.success && Array.isArray(productRes.data)) {
                setProducts(productRes.data);
                setOriginalProducts(productRes.data);
                setIsDirty(false);
            } else {
                setProducts([]);
                setOriginalProducts([]);
            }

            if (catRes?.categories && Array.isArray(catRes.categories)) {
                setCategories(catRes.categories);
            }
        } catch (error) {
            console.error('Failed to load products for reordering:', error);
            toast.error('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtered view of products (searching/category filter)
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchSearch = searchTerm
                ? (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.productID && p.productID.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            let matchCategory = true;
            if (selectedCategory) {
                if (Array.isArray(p.categories)) {
                    matchCategory = p.categories.some(
                        (c) => String(c.categoryID) === String(selectedCategory) || String(c) === String(selectedCategory)
                    );
                } else if (typeof p.categories === 'object' && p.categories !== null) {
                    matchCategory = String(p.categories.categoryID) === String(selectedCategory);
                } else {
                    matchCategory = false;
                }
            }

            return matchSearch && matchCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    // Reorder action: move item from sourceIndex to targetIndex in the full list
    const moveItemInMasterList = useCallback((fromProductID, toIndex) => {
        setProducts((prev) => {
            const currentIdx = prev.findIndex((p) => p.productID === fromProductID);
            if (currentIdx === -1) return prev;

            const targetIdx = Math.max(0, Math.min(toIndex, prev.length - 1));
            if (currentIdx === targetIdx) return prev;

            const updated = [...prev];
            const [movedItem] = updated.splice(currentIdx, 1);
            updated.splice(targetIdx, 0, movedItem);

            setIsDirty(true);
            return updated;
        });
    }, []);

    // Drag handlers
    const handleDragStart = (e, productID) => {
        const idx = products.findIndex((p) => p.productID === productID);
        setDraggedIndex(idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', productID);
    };

    const handleDragOver = (e, productID) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const idx = products.findIndex((p) => p.productID === productID);
        if (dragOverIndex !== idx) {
            setDragOverIndex(idx);
        }
    };

    const handleDragLeave = () => {
        // Handled gracefully
    };

    const handleDrop = (e, targetProductID) => {
        e.preventDefault();
        const sourceProductID = e.dataTransfer.getData('text/plain');
        if (!sourceProductID || sourceProductID === targetProductID) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const targetIdx = products.findIndex((p) => p.productID === targetProductID);
        if (targetIdx !== -1) {
            moveItemInMasterList(sourceProductID, targetIdx);
        }

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Quick move handlers
    const handleMoveToTop = (productID) => {
        moveItemInMasterList(productID, 0);
        toast.info('Moved product to top (#1)');
    };

    const handleMoveUp = (productID) => {
        const currentIdx = products.findIndex((p) => p.productID === productID);
        if (currentIdx > 0) {
            moveItemInMasterList(productID, currentIdx - 1);
        }
    };

    const handleMoveDown = (productID) => {
        const currentIdx = products.findIndex((p) => p.productID === productID);
        if (currentIdx < products.length - 1) {
            moveItemInMasterList(productID, currentIdx + 1);
        }
    };

    // Rank input change & jump
    const handleRankInputChange = (productID, val) => {
        setRankInputValues((prev) => ({ ...prev, [productID]: val }));
    };

    const handleRankInputCommit = (productID) => {
        const val = rankInputValues[productID];
        if (val === undefined || val === '') return;
        const targetNum = parseInt(val, 10);
        if (isNaN(targetNum) || targetNum < 1) {
            toast.warn('Please enter a valid rank number (1 or greater)');
            return;
        }
        const targetIdx = targetNum - 1; // 1-based to 0-based
        moveItemInMasterList(productID, targetIdx);
        setRankInputValues((prev) => {
            const next = { ...prev };
            delete next[productID];
            return next;
        });
    };

    // Reset arrangement back to original or chronological
    const handleResetToOriginal = () => {
        setProducts([...originalProducts]);
        setIsDirty(false);
        toast.info('Arrangement restored to previous saved state.');
    };

    const handleResetToNewest = () => {
        const sortedByDate = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedByDate);
        setIsDirty(true);
        toast.info('Products reordered by newest upload date.');
    };

    // Save arrangement to backend
    const handleSaveOrder = async () => {
        if (!isDirty) {
            toast.info('No changes to save.');
            return;
        }

        setSaving(true);
        try {
            // Assign sequential displayOrder 1..N
            const payload = products.map((p, idx) => ({
                productID: p.productID,
                displayOrder: idx + 1
            }));

            const res = await reorderProducts(payload);
            if (res?.success) {
                toast.success('🎉 Product arrangement saved and live on shop page!');
                setOriginalProducts([...products]);
                setIsDirty(false);
            } else {
                toast.error(res?.message || 'Failed to save product arrangement.');
            }
        } catch (error) {
            console.error('Error saving product order:', error);
            toast.error(error.response?.data?.message || 'Failed to save product order.');
        } finally {
            setSaving(false);
        }
    };

    // Helper for product image URL
    const getProductImageUrl = (featuredImage) => {
        if (!featuredImage) return null;
        if (typeof featuredImage === 'string') {
            try {
                const parsed = JSON.parse(featuredImage);
                return parsed?.url || parsed?.thumbnail || featuredImage;
            } catch {
                return featuredImage;
            }
        }
        if (typeof featuredImage === 'object') {
            return featuredImage?.url || featuredImage?.thumbnail || null;
        }
        return null;
    };

    return (
        <Layout>
            <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                                    <RiLayoutGridLine className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                        Organize Shop Products
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        Drag & drop cards or assign rank numbers to customize the exact display order on the customer Shop page.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleResetToNewest}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                title="Sort by newest upload date"
                            >
                                <RiArrowGoBackLine className="w-4 h-4" />
                                Order by Newest
                            </button>

                            {isDirty && (
                                <button
                                    type="button"
                                    onClick={handleResetToOriginal}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
                                >
                                    <RiRefreshLine className="w-4 h-4" />
                                    Reset Changes
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                disabled={saving || !isDirty}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-semibold rounded-xl shadow-sm transition-all ${
                                    isDirty
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <RiSave3Line className="w-4 h-4" />
                                        <span>Save Arrangement</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Unsaved Changes Banner */}
                    {isDirty && (
                        <div className="mt-4 flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-purple-600 animate-pulse" />
                                <span className="font-semibold">You have unsaved arrangement changes.</span>
                                <span className="text-purple-700 hidden sm:inline">Click "Save Arrangement" to update the live storefront.</span>
                            </div>
                            <button
                                onClick={handleSaveOrder}
                                disabled={saving}
                                className="font-bold underline text-purple-700 hover:text-purple-900 cursor-pointer"
                            >
                                Save Now
                            </button>
                        </div>
                    )}

                    {/* Search & Filter Toolbar */}
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-72">
                                <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search products by name / ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="relative w-full sm:w-56">
                                <RiFilter3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c.categoryID} value={c.categoryID}>
                                            {c.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* View Switcher & Product Counter */}
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">
                                Showing <strong className="text-gray-900">{filteredProducts.length}</strong> of{' '}
                                <strong className="text-gray-900">{products.length}</strong> products
                            </span>

                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg text-xs md:text-sm transition-all ${
                                        viewMode === 'grid'
                                            ? 'bg-white text-purple-700 shadow-sm font-semibold'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    title="Visual Grid View"
                                >
                                    <RiLayoutGridLine className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg text-xs md:text-sm transition-all ${
                                        viewMode === 'list'
                                            ? 'bg-white text-purple-700 shadow-sm font-semibold'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    title="Compact Table List View"
                                >
                                    <RiListUnordered className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions Hint */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200/80 text-xs text-gray-500 mb-6 shadow-xs">
                    <RiInformationLine className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>
                        <strong>Pro Tip:</strong> Click and drag any card by the handle <RiDragMove2Fill className="inline w-3.5 h-3.5 text-gray-400" /> to reposition it. You can also type a specific rank number in the <strong>#Rank</strong> input or click <strong>Pin #1</strong> to bring a product straight to the first slot.
                    </span>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm text-gray-600 font-medium">Loading catalog products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                        <RiShoppingBag3Line className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-base font-bold text-gray-800">No products found</h3>
                        <p className="text-xs text-gray-400 max-w-sm mt-1">
                            {searchTerm || selectedCategory
                                ? 'No products match your current search/filter criteria.'
                                : 'No products found in the database.'}
                        </p>
                        {(searchTerm || selectedCategory) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('');
                                }}
                                className="mt-4 px-4 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ─────────────────────────── GRID VIEW ─────────────────────────── */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredProducts.map((product) => {
                            // Find absolute index in master list
                            const masterIndex = products.findIndex((p) => p.productID === product.productID);
                            const rankNumber = masterIndex + 1;
                            const isBeingDragged = draggedIndex === masterIndex;
                            const isDropTarget = dragOverIndex === masterIndex;
                            const imageUrl = getProductImageUrl(product.featuredImage);

                            return (
                                <div
                                    key={product.productID}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, product.productID)}
                                    onDragOver={(e) => handleDragOver(e, product.productID)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, product.productID)}
                                    onDragEnd={handleDragEnd}
                                    className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col select-none cursor-grab active:cursor-grabbing ${
                                        isBeingDragged
                                            ? 'opacity-30 border-dashed border-purple-500 scale-95 shadow-none'
                                            : isDropTarget
                                            ? 'border-purple-600 ring-2 ring-purple-400 bg-purple-50/50 shadow-lg scale-102'
                                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                    }`}
                                >
                                    {/* Top Card Bar: Rank Badge + Drag Handle */}
                                    <div className="p-2.5 pb-0 flex items-center justify-between z-10">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                                                    rankNumber <= 3
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                        : rankNumber <= 10
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}
                                            >
                                                #{rankNumber}
                                            </span>
                                        </div>

                                        <div className="text-gray-400 group-hover:text-purple-600 transition-colors p-1">
                                            <RiDragMove2Fill className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Product Image Thumbnail */}
                                    <div className="px-3 pt-2">
                                        <div className="relative aspect-square w-full rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover pointer-events-none"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                                                    <RiImageLine className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4
                                                className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug mb-1"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                                                <span className="truncate max-w-[80px]" title={product.brand || 'In-House'}>
                                                    {product.brand || 'In-House'}
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ₹{Number(product.salePrice || product.regularPrice || 0).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick Action Controls */}
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                                            {/* Pin to #1 */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveToTop(product.productID);
                                                }}
                                                disabled={masterIndex === 0}
                                                className="p-1 rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                title="Pin to Top (#1)"
                                            >
                                                <RiPushpin2Line className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Move Up */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveUp(product.productID);
                                                }}
                                                disabled={masterIndex === 0}
                                                className="p-1 rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                title="Move Up 1 Position"
                                            >
                                                <RiArrowUpLine className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Move Down */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveDown(product.productID);
                                                }}
                                                disabled={masterIndex === products.length - 1}
                                                className="p-1 rounded-lg text-gray-500 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                title="Move Down 1 Position"
                                            >
                                                <RiArrowDownLine className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Direct Position Jump Input */}
                                            <div className="flex items-center gap-0.5">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={products.length}
                                                    placeholder={String(rankNumber)}
                                                    value={
                                                        rankInputValues[product.productID] !== undefined
                                                            ? rankInputValues[product.productID]
                                                            : ''
                                                    }
                                                    onChange={(e) => handleRankInputChange(product.productID, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleRankInputCommit(product.productID);
                                                        }
                                                    }}
                                                    onBlur={() => handleRankInputCommit(product.productID)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-10 h-6 text-center text-[11px] font-mono font-bold bg-slate-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:border-purple-500"
                                                    title="Type rank and hit Enter"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ─────────────────────────── LIST / TABLE VIEW ─────────────────────────── */
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-gray-200 text-gray-600 text-xs uppercase font-semibold">
                                        <th className="py-3 px-4 w-12 text-center">Grab</th>
                                        <th className="py-3 px-4 w-20">Rank</th>
                                        <th className="py-3 px-4 w-16">Image</th>
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4">Brand</th>
                                        <th className="py-3 px-4">Price</th>
                                        <th className="py-3 px-4 w-44 text-center">Quick Move</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                                    {filteredProducts.map((product) => {
                                        const masterIndex = products.findIndex((p) => p.productID === product.productID);
                                        const rankNumber = masterIndex + 1;
                                        const isBeingDragged = draggedIndex === masterIndex;
                                        const isDropTarget = dragOverIndex === masterIndex;
                                        const imageUrl = getProductImageUrl(product.featuredImage);

                                        return (
                                            <tr
                                                key={product.productID}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, product.productID)}
                                                onDragOver={(e) => handleDragOver(e, product.productID)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, product.productID)}
                                                onDragEnd={handleDragEnd}
                                                className={`transition-colors cursor-grab active:cursor-grabbing ${
                                                    isBeingDragged
                                                        ? 'opacity-30 bg-purple-50'
                                                        : isDropTarget
                                                        ? 'bg-purple-100/70'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                {/* Drag Handle */}
                                                <td className="py-3 px-4 text-center text-gray-400 hover:text-purple-600">
                                                    <RiDragMove2Fill className="w-5 h-5 mx-auto" />
                                                </td>

                                                {/* Rank Badge */}
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                                            rankNumber <= 3
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                                : rankNumber <= 10
                                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                        }`}
                                                    >
                                                        #{rankNumber}
                                                    </span>
                                                </td>

                                                {/* Thumbnail */}
                                                <td className="py-3 px-4">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover pointer-events-none"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <RiImageLine className="w-5 h-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Name & ID */}
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                                                    <p className="text-[11px] font-mono text-gray-400">ID: {product.productID}</p>
                                                </td>

                                                {/* Brand */}
                                                <td className="py-3 px-4 text-gray-600">
                                                    {product.brand || 'In-House'}
                                                </td>

                                                {/* Price */}
                                                <td className="py-3 px-4 font-semibold text-gray-900">
                                                    ₹{Number(product.salePrice || product.regularPrice || 0).toLocaleString('en-IN')}
                                                </td>

                                                {/* Controls */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveToTop(product.productID)}
                                                            disabled={masterIndex === 0}
                                                            className="p-1.5 rounded-lg text-gray-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none border border-gray-200"
                                                            title="Pin to Top (#1)"
                                                        >
                                                            <RiPushpin2Line className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveUp(product.productID)}
                                                            disabled={masterIndex === 0}
                                                            className="p-1.5 rounded-lg text-gray-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none border border-gray-200"
                                                            title="Move Up"
                                                        >
                                                            <RiArrowUpLine className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveDown(product.productID)}
                                                            disabled={masterIndex === products.length - 1}
                                                            className="p-1.5 rounded-lg text-gray-600 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:pointer-events-none border border-gray-200"
                                                            title="Move Down"
                                                        >
                                                            <RiArrowDownLine className="w-4 h-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={products.length}
                                                            placeholder={String(rankNumber)}
                                                            value={
                                                                rankInputValues[product.productID] !== undefined
                                                                    ? rankInputValues[product.productID]
                                                                    : ''
                                                            }
                                                            onChange={(e) => handleRankInputChange(product.productID, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRankInputCommit(product.productID);
                                                            }}
                                                            onBlur={() => handleRankInputCommit(product.productID)}
                                                            className="w-12 h-7 text-center text-xs font-mono font-bold bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
                                                            title="Jump to rank"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReorderProducts;
