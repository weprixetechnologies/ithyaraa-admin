import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'react-toastify';
import {
    RiPriceTag3Line,
    RiAddLine,
    RiEditLine,
    RiDeleteBinLine,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiSearchLine,
    RiStackLine,
    RiCheckLine,
    RiCloseLine,
    RiRefreshLine,
    RiShoppingBag3Line
} from 'react-icons/ri';
import {
    getAllBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    getBadgeProducts,
    syncBadgeProducts
} from '../../lib/api/productBadgesApi';
import { getPaginatedProducts } from '../../lib/api/productsApi';

const PRESET_COLORS = [
    { name: 'Red Fire', bg: '#ef4444', text: '#ffffff', icon: '🔥' },
    { name: 'Purple Spark', bg: '#8b5cf6', text: '#ffffff', icon: '⚡' },
    { name: 'Orange Hot', bg: '#f97316', text: '#ffffff', icon: '🏷️' },
    { name: 'Emerald Crown', bg: '#059669', text: '#ffffff', icon: '👑' },
    { name: 'Royal Blue', bg: '#2563eb', text: '#ffffff', icon: '⭐' },
    { name: 'Golden Luxury', bg: '#d97706', text: '#ffffff', icon: '💎' },
    { name: 'Rose Pink', bg: '#ec4899', text: '#ffffff', icon: '💖' },
    { name: 'Dark Mode', bg: '#1f2937', text: '#ffffff', icon: '✨' },
];

const EMOJI_OPTIONS = ['🔥', '⚡', '🏷️', '👑', '⭐', '💎', '💖', '✨', '🚀', '🌟', '💥', '🎯', '💯'];

const parseJSON = (val) => {
    try { return typeof val === 'string' ? JSON.parse(val) : (val || []); } catch { return []; }
};

const ProductBadges = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [badgeForm, setBadgeForm] = useState({
        name: '',
        bgColor: '#ef4444',
        textColor: '#ffffff',
        icon: '🔥',
        isActive: 1,
        displayOrder: 0
    });
    const [submittingBadge, setSubmittingBadge] = useState(false);

    // Product assignment modal states
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [activeBadgeForAssign, setActiveBadgeForAssign] = useState(null);
    const [assignedProductIDs, setAssignedProductIDs] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [loadingAssignProducts, setLoadingAssignProducts] = useState(false);
    const [submittingAssign, setSubmittingAssign] = useState(false);

    // Fetch badges
    const fetchBadges = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllBadges();
            if (res && res.success) {
                setBadges(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching badges:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch badges');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    // Open Modal for Create
    const handleOpenCreateModal = () => {
        setEditingBadge(null);
        setBadgeForm({
            name: '',
            bgColor: '#ef4444',
            textColor: '#ffffff',
            icon: '🔥',
            isActive: 1,
            displayOrder: badges.length + 1
        });
        setIsBadgeModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (badge) => {
        setEditingBadge(badge);
        setBadgeForm({
            name: badge.name || '',
            bgColor: badge.bgColor || '#ef4444',
            textColor: badge.textColor || '#ffffff',
            icon: badge.icon || '🔥',
            isActive: badge.isActive ?? 1,
            displayOrder: badge.displayOrder || 0
        });
        setIsBadgeModalOpen(true);
    };

    // Save Badge (Create or Update)
    const handleSaveBadge = async (e) => {
        e.preventDefault();
        if (!badgeForm.name.trim()) {
            toast.error('Please enter a badge name');
            return;
        }

        try {
            setSubmittingBadge(true);
            if (editingBadge) {
                const res = await updateBadge(editingBadge.id, badgeForm);
                if (res.success) {
                    toast.success('Badge updated successfully!');
                    setIsBadgeModalOpen(false);
                    fetchBadges();
                }
            } else {
                const res = await createBadge(badgeForm);
                if (res.success) {
                    toast.success('Badge created successfully!');
                    setIsBadgeModalOpen(false);
                    fetchBadges();
                }
            }
        } catch (err) {
            console.error('Failed to save badge:', err);
            toast.error(err.response?.data?.message || 'Failed to save badge');
        } finally {
            setSubmittingBadge(false);
        }
    };

    // Toggle Badge Active Status directly from table
    const handleToggleStatus = async (badge) => {
        try {
            const updated = { ...badge, isActive: badge.isActive ? 0 : 1 };
            const res = await updateBadge(badge.id, updated);
            if (res.success) {
                toast.success(`Badge ${updated.isActive ? 'activated' : 'deactivated'}`);
                fetchBadges();
            }
        } catch (err) {
            console.error('Error toggling badge status:', err);
            toast.error('Failed to update status');
        }
    };

    // Delete Badge
    const handleDeleteBadge = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete badge "${name}"?`)) return;
        try {
            const res = await deleteBadge(id);
            if (res.success) {
                toast.success('Badge deleted successfully');
                fetchBadges();
            }
        } catch (err) {
            console.error('Failed to delete badge:', err);
            toast.error(err.response?.data?.message || 'Failed to delete badge');
        }
    };

    // Open Assign Products Modal
    const handleOpenAssignModal = async (badge) => {
        setActiveBadgeForAssign(badge);
        setIsAssignModalOpen(true);
        setProductSearch('');
        setLoadingAssignProducts(true);

        try {
            // Load currently assigned products
            const assignedRes = await getBadgeProducts(badge.id);
            const assignedList = assignedRes.data || [];
            const assignedIds = assignedList.map(p => p.productID);
            setAssignedProductIDs(assignedIds);

            // Load all store products for selection
            const productsRes = await getPaginatedProducts({ page: 1, limit: 100 });
            setAllProducts(productsRes.data || []);
        } catch (err) {
            console.error('Error loading products for assignment:', err);
            toast.error('Failed to load products');
        } finally {
            setLoadingAssignProducts(false);
        }
    };

    // Filter products in assignment modal
    const filteredProductsForAssign = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (!query) return allProducts;
        return allProducts.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            String(p.productID).includes(query) ||
            p.brand?.toLowerCase().includes(query)
        );
    }, [allProducts, productSearch]);

    // Toggle product selection in assign modal
    const handleToggleProductSelection = (productID) => {
        setAssignedProductIDs(prev => {
            if (prev.includes(productID)) {
                return prev.filter(id => id !== productID);
            } else {
                return [...prev, productID];
            }
        });
    };

    const handleSelectAllFilteredProducts = () => {
        const currentFilteredIds = filteredProductsForAssign.map(p => p.productID);
        setAssignedProductIDs(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
    };

    const handleClearAllAssigned = () => {
        setAssignedProductIDs([]);
    };

    // Save product assignments
    const handleSaveAssignments = async () => {
        if (!activeBadgeForAssign) return;
        try {
            setSubmittingAssign(true);
            const res = await syncBadgeProducts(activeBadgeForAssign.id, assignedProductIDs);
            if (res.success) {
                toast.success('Product badges assigned successfully!');
                setIsAssignModalOpen(false);
                fetchBadges();
            }
        } catch (err) {
            console.error('Error syncing badge products:', err);
            toast.error('Failed to save product assignments');
        } finally {
            setSubmittingAssign(false);
        }
    };

    return (
        <Layout active="admin-product-badges" title="Product Badges System">
            <Container containerclass="bg-transparent">
                {/* Header Actions Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RiPriceTag3Line className="text-blue-600" />
                                Product Badges Manager
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Create badges (e.g. Best Seller, Trending) and select products to display dynamic badges on user storefront cards.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchBadges}
                                className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                            >
                                <RiRefreshLine size={15} />
                                Refresh
                            </button>
                            <button
                                onClick={handleOpenCreateModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <RiAddLine size={16} />
                                Create Badge
                            </button>
                        </div>
                    </div>
                </div>

                {/* Badges Table Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <DotLottieReact
                                src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                loop
                                autoplay
                                style={{ height: '160px', width: 'auto', margin: '0 auto' }}
                            />
                        </div>
                    ) : badges.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
                                <RiPriceTag3Line size={32} />
                            </div>
                            <h3 className="text-base font-semibold text-gray-800">No Badges Created</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                                Click "Create Badge" above to add your first product badge (e.g., Best Seller or Trending).
                            </p>
                            <button
                                onClick={handleOpenCreateModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                            >
                                Create Badge
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="py-3.5 px-4">Live Preview</th>
                                        <th className="py-3.5 px-4">Badge Title</th>
                                        <th className="py-3.5 px-4 text-center">Assigned Products</th>
                                        <th className="py-3.5 px-4 text-center">Display Order</th>
                                        <th className="py-3.5 px-4 text-center">Status</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                    {badges.map((badge) => (
                                        <tr key={badge.id} className="hover:bg-gray-50/70 transition-colors">
                                            {/* Preview */}
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
                                                    style={{ backgroundColor: badge.bgColor, color: badge.textColor }}
                                                >
                                                    <span>{badge.icon}</span>
                                                    <span>{badge.name}</span>
                                                </span>
                                            </td>

                                            {/* Name */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
                                                <div className="text-[11px] text-gray-400 font-mono">
                                                    BG: {badge.bgColor} | Text: {badge.textColor}
                                                </div>
                                            </td>

                                            {/* Product Count */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                                                    <RiShoppingBag3Line size={13} />
                                                    {badge.productCount || 0} Products
                                                </span>
                                            </td>

                                            {/* Display Order */}
                                            <td className="py-3.5 px-4 text-center font-mono text-gray-700">
                                                #{badge.displayOrder}
                                            </td>

                                            {/* Status Toggle */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(badge)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                                                        badge.isActive
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {badge.isActive ? (
                                                        <>
                                                            <RiCheckboxCircleFill size={13} /> Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RiCloseCircleFill size={13} /> Inactive
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenAssignModal(badge)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                                        title="Select products for this badge"
                                                    >
                                                        <RiStackLine size={14} />
                                                        Select Products
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditModal(badge)}
                                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Edit badge properties"
                                                    >
                                                        <RiEditLine size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBadge(badge.id, badge.name)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete badge"
                                                    >
                                                        <RiDeleteBinLine size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Container>

            {/* Create / Edit Badge Modal */}
            {isBadgeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <RiPriceTag3Line className="text-blue-600" />
                                {editingBadge ? 'Edit Badge' : 'Create New Badge'}
                            </h3>
                            <button
                                onClick={() => setIsBadgeModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBadge} className="p-6 space-y-4">

                            {/* Real-time Badge Preview Box */}
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <div className="text-[11px] font-semibold uppercase text-gray-400 mb-2">Live Badge Preview</div>
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all"
                                    style={{ backgroundColor: badgeForm.bgColor, color: badgeForm.textColor }}
                                >
                                    <span>{badgeForm.icon}</span>
                                    <span>{badgeForm.name || 'Badge Preview'}</span>
                                </span>
                            </div>

                            {/* Badge Title */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Badge Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Best Seller, Trending, Hot Deal"
                                    value={badgeForm.name}
                                    onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Preset Color Palettes */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Preset Palettes</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_COLORS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setBadgeForm({
                                                ...badgeForm,
                                                bgColor: preset.bg,
                                                textColor: preset.text,
                                                icon: preset.icon
                                            })}
                                            className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-gray-200 flex items-center gap-1 hover:scale-105 transition-transform"
                                            style={{ backgroundColor: preset.bg, color: preset.text }}
                                        >
                                            <span>{preset.icon}</span>
                                            <span>{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Color Pickers */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">Background Color</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={badgeForm.bgColor}
                                            onChange={(e) => setBadgeForm({ ...badgeForm, bgColor: e.target.value })}
                                            className="h-9 w-10 rounded cursor-pointer border border-gray-300 p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={badgeForm.bgColor}
                                            onChange={(e) => setBadgeForm({ ...badgeForm, bgColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono uppercase"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">Text Color</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={badgeForm.textColor}
                                            onChange={(e) => setBadgeForm({ ...badgeForm, textColor: e.target.value })}
                                            className="h-9 w-10 rounded cursor-pointer border border-gray-300 p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={badgeForm.textColor}
                                            onChange={(e) => setBadgeForm({ ...badgeForm, textColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Icon / Emoji Selector */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">Icon / Emoji</label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setBadgeForm({ ...badgeForm, icon: emoji })}
                                            className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-all ${
                                                badgeForm.icon === emoji
                                                    ? 'bg-blue-100 border-blue-500 scale-110'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Custom emoji or icon text"
                                    value={badgeForm.icon}
                                    onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                />
                            </div>

                            {/* Display Order & Active Toggle */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={badgeForm.displayOrder}
                                        onChange={(e) => setBadgeForm({ ...badgeForm, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 block mb-1">Status</label>
                                    <select
                                        value={badgeForm.isActive}
                                        onChange={(e) => setBadgeForm({ ...badgeForm, isActive: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs h-[38px]"
                                    >
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsBadgeModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingBadge}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submittingBadge ? 'Saving...' : editingBadge ? 'Update Badge' : 'Create Badge'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Product Assignment Modal */}
            {isAssignModalOpen && activeBadgeForAssign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <RiStackLine className="text-blue-600" />
                                    Assign Products to Badge
                                </h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <span
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                        style={{ backgroundColor: activeBadgeForAssign.bgColor, color: activeBadgeForAssign.textColor }}
                                    >
                                        <span>{activeBadgeForAssign.icon}</span>
                                        <span>{activeBadgeForAssign.name}</span>
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({assignedProductIDs.length} selected)
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                            <div className="relative w-full sm:w-72">
                                <RiSearchLine className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search products by name or ID..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={handleSelectAllFilteredProducts}
                                    className="text-xs text-blue-600 hover:underline font-medium px-2 py-1"
                                >
                                    Select All Filtered
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearAllAssigned}
                                    className="text-xs text-red-500 hover:underline font-medium px-2 py-1"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Products List Scroll Container */}
                        <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100">
                            {loadingAssignProducts ? (
                                <div className="p-8 text-center text-xs text-gray-500">
                                    Loading store products...
                                </div>
                            ) : filteredProductsForAssign.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-500">
                                    No matching products found
                                </div>
                            ) : (
                                filteredProductsForAssign.map((prod) => {
                                    const isSelected = assignedProductIDs.includes(prod.productID);
                                    const images = parseJSON(prod.featuredImage);
                                    const imgUrl = images?.[0]?.imgUrl || '/placeholder.png';

                                    return (
                                        <div
                                            key={prod.productID}
                                            onClick={() => handleToggleProductSelection(prod.productID)}
                                            className={`py-3 px-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                                isSelected ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}} // Container onClick handles toggle
                                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-100 relative shrink-0">
                                                    <img
                                                        src={imgUrl}
                                                        alt={prod.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-xs text-gray-900 line-clamp-1">{prod.name}</div>
                                                    <div className="text-[11px] text-gray-500 flex gap-2 mt-0.5">
                                                        <span>ID: #{prod.productID}</span>
                                                        <span>•</span>
                                                        <span className="font-medium text-gray-700">₹{prod.salePrice || prod.regularPrice || 0}</span>
                                                        {prod.brand && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="uppercase text-blue-600 font-semibold">{prod.brand}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <RiCheckLine className="text-blue-600 shrink-0" size={18} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                            <span className="text-xs text-gray-600 font-medium">
                                Selected: <strong>{assignedProductIDs.length}</strong> products
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAssignments}
                                    disabled={submittingAssign}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                                >
                                    {submittingAssign ? 'Saving...' : 'Save Product Assignments'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProductBadges;
