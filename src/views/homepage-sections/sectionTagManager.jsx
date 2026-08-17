import React, { useEffect, useState, useCallback } from "react";
import Layout from "src/layout";
import axiosInstance from "src/lib/axiosInstance";
import { toast } from "react-toastify";
import Container from "@/components/ui/container";
import InputUi from "@/components/ui/inputui";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    RiTagLine,
    RiAddLine,
    RiEditLine,
    RiDeleteBinLine,
    RiEyeLine,
    RiSearchLine,
    RiCheckLine,
    RiRefreshLine,
    RiPriceTag3Line,
    RiCloseLine
} from "react-icons/ri";

const SectionTagManager = () => {
    // Tag sections list state
    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [selectedTagSection, setSelectedTagSection] = useState(null);

    // Form state for creating/editing section tag
    const [isEditing, setIsEditing] = useState(false);
    const [formId, setFormId] = useState(null);
    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [description, setDescription] = useState("");
    const [position, setPosition] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);

    // Preview tagged products state
    const [previewProducts, setPreviewProducts] = useState([]);
    const [previewTotal, setPreviewTotal] = useState(0);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // All catalog products state (for bulk selection)
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [catalogTotal, setCatalogTotal] = useState(0);
    const [catalogPage, setCatalogPage] = useState(1);
    const [catalogSearch, setCatalogSearch] = useState("");
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [selectedProductIDs, setSelectedProductIDs] = useState([]);

    // Action state
    const [actionLoading, setActionLoading] = useState(false);

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Fetch Tag Sections List
    // ──────────────────────────────────────────────────────────────────────────
    const fetchSections = useCallback(async () => {
        try {
            setLoadingSections(true);
            const res = await axiosInstance.get("/homepage-tag-sections");
            if (res.data?.success) {
                const list = res.data.data || [];
                setSections(list);
                if (list.length > 0 && !selectedTagSection) {
                    setSelectedTagSection(list[0]);
                }
            } else {
                toast.error("Failed to load tag sections");
            }
        } catch (err) {
            console.error("Error fetching tag sections:", err);
            toast.error("Error loading section tags");
        } finally {
            setLoadingSections(false);
        }
    }, [selectedTagSection]);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Fetch Preview Products for Selected Section Tag
    // ──────────────────────────────────────────────────────────────────────────
    const fetchPreviewProducts = useCallback(async () => {
        if (!selectedTagSection?.tag) {
            setPreviewProducts([]);
            setPreviewTotal(0);
            return;
        }
        try {
            setLoadingPreview(true);
            const res = await axiosInstance.get(`/homepage-tag-sections/${selectedTagSection.tag}/products?limit=50`);
            if (res.data?.success) {
                setPreviewProducts(res.data.data || []);
                setPreviewTotal(res.data.total || 0);
            }
        } catch (err) {
            console.error("Error fetching section products preview:", err);
        } finally {
            setLoadingPreview(false);
        }
    }, [selectedTagSection]);

    useEffect(() => {
        fetchPreviewProducts();
    }, [fetchPreviewProducts]);

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Fetch Catalog Products (for bulk tagging picker)
    // ──────────────────────────────────────────────────────────────────────────
    const fetchCatalogProducts = useCallback(async () => {
        try {
            setLoadingCatalog(true);
            const params = new URLSearchParams({
                page: catalogPage,
                limit: 10,
            });
            if (catalogSearch.trim()) {
                params.append("name", catalogSearch.trim());
            }

            const res = await axiosInstance.get(`/products/all-products?${params.toString()}`);
            if (res.data?.success || res.data?.data) {
                setCatalogProducts(res.data.data || []);
                setCatalogTotal(res.data.count || res.data.total || 0);
            }
        } catch (err) {
            console.error("Error fetching catalog products:", err);
        } finally {
            setLoadingCatalog(false);
        }
    }, [catalogPage, catalogSearch]);

    useEffect(() => {
        fetchCatalogProducts();
    }, [fetchCatalogProducts]);

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Save / Create Section Tag
    // ──────────────────────────────────────────────────────────────────────────
    const handleSaveSection = async (e) => {
        e.preventDefault();
        if (!title.trim() || !tag.trim()) {
            toast.error("Title and Tag are required!");
            return;
        }

        try {
            setActionLoading(true);
            const payload = {
                title: title.trim(),
                tag: tag.trim().toLowerCase().replace(/\s+/g, "_"),
                description: description.trim(),
                position: Number(position) || 0,
                isActive: Boolean(isActive)
            };

            let res;
            if (isEditing && formId) {
                res = await axiosInstance.put(`/homepage-tag-sections/${formId}`, payload);
            } else {
                res = await axiosInstance.post("/homepage-tag-sections", payload);
            }

            if (res.data?.success) {
                toast.success(isEditing ? "Section updated! Redis cache re-primed ⚡" : "Section created!");
                resetForm();
                setShowFormModal(false);
                await fetchSections();
            } else {
                toast.error(res.data?.message || "Failed to save section");
            }
        } catch (err) {
            console.error("Error saving section:", err);
            toast.error("Failed to save section");
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setFormId(null);
        setTitle("");
        setTag("");
        setDescription("");
        setPosition(0);
        setIsActive(true);
        setIsEditing(false);
    };

    const handleEditSection = (sec) => {
        setFormId(sec.id);
        setTitle(sec.title || "");
        setTag(sec.tag || "");
        setDescription(sec.description || "");
        setPosition(sec.position || 0);
        setIsActive(sec.isActive ?? true);
        setIsEditing(true);
        setShowFormModal(true);
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tag section?")) return;
        try {
            const res = await axiosInstance.delete(`/homepage-tag-sections/${id}`);
            if (res.data?.success) {
                toast.success("Section deleted!");
                if (selectedTagSection?.id === id) {
                    setSelectedTagSection(null);
                }
                await fetchSections();
            }
        } catch (err) {
            toast.error("Error deleting section");
        }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Bulk Selection Helpers
    // ──────────────────────────────────────────────────────────────────────────
    const handleToggleProduct = (pid) => {
        setSelectedProductIDs(prev =>
            prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
        );
    };

    const handleSelectAllPage = () => {
        const pageIDs = catalogProducts.map(p => p.productID);
        const allSelected = pageIDs.every(id => selectedProductIDs.includes(id));

        if (allSelected) {
            setSelectedProductIDs(prev => prev.filter(id => !pageIDs.includes(id)));
        } else {
            setSelectedProductIDs(prev => [...new Set([...prev, ...pageIDs])]);
        }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // 6. Bulk Tag / Untag Actions with Instant Re-caching
    // ──────────────────────────────────────────────────────────────────────────
    const handleBulkTag = async () => {
        if (!selectedTagSection) {
            toast.error("Please select a tag section first!");
            return;
        }
        if (selectedProductIDs.length === 0) {
            toast.error("Please select at least one product to tag!");
            return;
        }

        try {
            setActionLoading(true);
            const res = await axiosInstance.post(`/homepage-tag-sections/${selectedTagSection.tag}/bulk-tag`, {
                productIDs: selectedProductIDs
            });

            if (res.data?.success) {
                toast.success(`Tagged ${res.data.updatedCount} products to '${selectedTagSection.tag}'! Redis cache re-primed ⚡`);
                setSelectedProductIDs([]);
                await fetchPreviewProducts();
                await fetchSections();
            } else {
                toast.error(res.data?.message || "Failed to bulk tag products");
            }
        } catch (err) {
            console.error("Error bulk tagging:", err);
            toast.error("Bulk tag failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkUntag = async (targetIDs = null) => {
        const idsToUntag = targetIDs || selectedProductIDs;
        if (!selectedTagSection) {
            toast.error("Please select a tag section first!");
            return;
        }
        if (!idsToUntag || idsToUntag.length === 0) {
            toast.error("Please select products to untag!");
            return;
        }

        try {
            setActionLoading(true);
            const res = await axiosInstance.post(`/homepage-tag-sections/${selectedTagSection.tag}/bulk-untag`, {
                productIDs: idsToUntag
            });

            if (res.data?.success) {
                toast.success(`Removed '${selectedTagSection.tag}' tag from ${res.data.updatedCount} products! Redis cache re-primed ⚡`);
                if (!targetIDs) setSelectedProductIDs([]);
                await fetchPreviewProducts();
                await fetchSections();
            } else {
                toast.error(res.data?.message || "Failed to remove tags");
            }
        } catch (err) {
            console.error("Error bulk untagging:", err);
            toast.error("Bulk untag failed");
        } finally {
            setActionLoading(false);
        }
    };

    const getImageUrl = (product) => {
        let feat = product.featuredImage;
        if (typeof feat === 'string') {
            try { feat = JSON.parse(feat); } catch (_) {}
        }
        if (Array.isArray(feat) && feat.length > 0) {
            return feat[0]?.imgUrl || feat[0] || '';
        }
        return typeof feat === 'string' ? feat : '';
    };

    return (
        <Layout active="admin-homepage-sections-list" title="Homepage Section Tag Manager">
            <div className="flex flex-col gap-6">

                {/* Top Section: Action Header & Manage Sections List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Left Column: Created Tag Sections List */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <RiPriceTag3Line className="text-purple-600" /> Section Tags
                            </h2>
                            <Button
                                onClick={() => { resetForm(); setShowFormModal(true); }}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 flex items-center gap-1 rounded-md"
                            >
                                <RiAddLine /> New Section
                            </Button>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm max-h-[420px] overflow-y-auto">
                            {loadingSections ? (
                                <div className="p-4 text-center text-sm text-gray-500">Loading section tags...</div>
                            ) : sections.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No tag sections created yet.</div>
                            ) : (
                                sections.map(sec => {
                                    const isSelected = selectedTagSection?.id === sec.id;
                                    return (
                                        <div
                                            key={sec.id}
                                            onClick={() => setSelectedTagSection(sec)}
                                            className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                                                isSelected ? 'bg-purple-50 border-l-4 border-purple-600 font-semibold' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div>
                                                <div className="text-sm text-gray-900 font-medium">{sec.title}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                                        {sec.tag}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({sec.productCount || 0} products)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditSection(sec); }}
                                                    className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                                    title="Edit Section"
                                                >
                                                    <RiEditLine size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                                                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                                                    title="Delete Section"
                                                >
                                                    <RiDeleteBinLine size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Live Section Preview Panel */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <RiEyeLine className="text-emerald-600" /> Live Section Preview:
                                {selectedTagSection ? (
                                    <span className="text-purple-600 font-mono text-base">[{selectedTagSection.tag}]</span>
                                ) : (
                                    <span className="text-gray-400 text-sm">Select a section</span>
                                )}
                            </h2>
                            {selectedTagSection && (
                                <button
                                    onClick={fetchPreviewProducts}
                                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                >
                                    <RiRefreshLine /> Refresh Preview
                                </button>
                            )}
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[420px] max-h-[420px] overflow-y-auto">
                            {!selectedTagSection ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Click a section tag on the left to preview its products live.
                                </div>
                            ) : loadingPreview ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                    Loading live preview products...
                                </div>
                            ) : previewProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                                    <RiPriceTag3Line size={32} />
                                    <span>No products currently tagged with &quot;{selectedTagSection.tag}&quot;.</span>
                                    <span className="text-xs text-gray-500">Select products below and click &quot;Bulk Add Tag&quot;.</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {previewProducts.map(p => {
                                        const img = getImageUrl(p);
                                        return (
                                            <div key={p.productID} className="border border-gray-200 rounded-md p-2 flex flex-col justify-between bg-gray-50 relative group">
                                                <div>
                                                    <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden relative mb-1">
                                                        {img ? (
                                                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-semibold text-gray-800 line-clamp-1">{p.name}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{p.productID}</div>
                                                    <div className="text-xs font-bold text-green-700 mt-0.5">₹{p.salePrice || p.regularPrice}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleBulkUntag([p.productID])}
                                                    disabled={actionLoading}
                                                    className="mt-2 w-full bg-red-100 hover:bg-red-200 text-red-700 text-[10px] py-1 rounded font-medium flex items-center justify-center gap-1"
                                                >
                                                    <RiCloseLine size={12} /> Remove Tag
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Bulk Product Picker & Catalog Browser */}
                {selectedTagSection && (
                    <Container label={`Bulk Tag Products for Section: "${selectedTagSection.title}" (${selectedTagSection.tag})`}>
                        <div className="flex flex-col gap-4">
                            
                            {/* Toolbar: Search, Select All, Bulk Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 flex-1 max-w-sm">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={catalogSearch}
                                            onChange={(e) => { setCatalogSearch(e.target.value); setCatalogPage(1); }}
                                            placeholder="Search product by name or ID..."
                                            className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-xs outline-none focus:border-purple-600"
                                        />
                                        <RiSearchLine className="absolute left-2.5 top-2 text-gray-400" size={14} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSelectAllPage}
                                        className="text-xs font-medium text-purple-700 hover:text-purple-900 underline"
                                    >
                                        Select / Deselect Page
                                    </button>

                                    <span className="text-xs font-semibold text-gray-700 bg-white px-2.5 py-1 rounded border border-gray-200">
                                        {selectedProductIDs.length} Selected
                                    </span>

                                    <Button
                                        onClick={handleBulkTag}
                                        disabled={actionLoading || selectedProductIDs.length === 0}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 flex items-center gap-1 rounded"
                                    >
                                        <RiCheckLine /> Bulk Add Tag
                                    </Button>

                                    <Button
                                        onClick={() => handleBulkUntag()}
                                        disabled={actionLoading || selectedProductIDs.length === 0}
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 flex items-center gap-1 rounded"
                                    >
                                        <RiCloseLine /> Bulk Remove Tag
                                    </Button>
                                </div>
                            </div>

                            {/* Catalog Products Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-100">
                                        <TableRow>
                                            <TableHead className="w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={catalogProducts.length > 0 && catalogProducts.every(p => selectedProductIDs.includes(p.productID))}
                                                    onChange={handleSelectAllPage}
                                                />
                                            </TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Product ID</TableHead>
                                            <TableHead>Current Section Tags</TableHead>
                                            <TableHead>Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingCatalog ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-sm text-gray-500">
                                                    Loading catalog products...
                                                </TableCell>
                                            </TableRow>
                                        ) : catalogProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-sm text-gray-500">
                                                    No catalog products found matching search.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            catalogProducts.map(p => {
                                                const isSelected = selectedProductIDs.includes(p.productID);
                                                const img = getImageUrl(p);
                                                const hasTag = (p.sectionid || '').toLowerCase().includes(selectedTagSection.tag);

                                                return (
                                                    <TableRow key={p.productID} className={isSelected ? 'bg-purple-50/50' : ''}>
                                                        <TableCell className="text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleProduct(p.productID)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                                    {img ? (
                                                                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                                    <div className="text-xs text-gray-500">{p.brand || 'Inhouse'}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs text-gray-600">{p.productID}</TableCell>
                                                        <TableCell>
                                                            {p.sectionid ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {p.sectionid.split(',').map((t, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                                                                t.trim() === selectedTagSection.tag
                                                                                    ? 'bg-purple-600 text-white font-bold'
                                                                                    : 'bg-gray-100 text-gray-700'
                                                                            }`}
                                                                        >
                                                                            {t.trim()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-sm">
                                                            ₹{p.salePrice || p.regularPrice}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <div>Showing page {catalogPage} of {Math.ceil(catalogTotal / 10) || 1} ({catalogTotal} total)</div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={catalogPage <= 1}
                                        onClick={() => setCatalogPage(p => p - 1)}
                                        className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={catalogPage >= Math.ceil(catalogTotal / 10)}
                                        onClick={() => setCatalogPage(p => p + 1)}
                                        className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                        </div>
                    </Container>
                )}

            </div>

            {/* Create/Edit Section Modal */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">{isEditing ? "Edit Tag Section" : "Create New Tag Section"}</h3>
                            <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                                <RiCloseLine size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSection} className="flex flex-col gap-3">
                            <InputUi
                                label="Section Title (e.g. Trending Products)"
                                value={title}
                                datafunction={(e) => setTitle(e.target.value)}
                            />
                            <InputUi
                                label="Section Tag Slug (e.g. trending)"
                                value={tag}
                                datafunction={(e) => setTag(e.target.value)}
                            />
                            <InputUi
                                label="Description (Optional)"
                                value={description}
                                datafunction={(e) => setDescription(e.target.value)}
                            />
                            <InputUi
                                label="Display Order Position"
                                value={position}
                                datafunction={(e) => setPosition(e.target.value)}
                            />

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="secActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <label htmlFor="secActive" className="text-sm font-medium">Active Section</label>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium"
                                >
                                    {actionLoading ? "Saving..." : isEditing ? "Update & Re-prime Cache" : "Create Section"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default SectionTagManager;
