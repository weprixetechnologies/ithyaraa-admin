import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
    getPaginatedProducts,
    getProductCount,
    deleteProduct,
    bulkDeleteProducts,
    bulkSaleUpdate,
    bulkAssignSection,
    bulkRemoveSection
} from './../../lib/api/productsApi';
import { toast } from 'react-toastify';
import {
    RiRefreshLine,
    RiAddLine,
    RiDeleteBinLine,
    RiEditLine,
    RiShoppingBag3Line,
    RiSearch2Line,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiStackLine,
    RiPriceTag3Line,
    RiLayoutGridLine
} from "react-icons/ri";

const ListProducts = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [openActionFor, setOpenActionFor] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        discountType: '',
        discountValue: '',
        updateSalePrice: false,
        sectionid: ''
    });

    const [filters, setFilters] = useState({
        name: '',
        productID: '',
        type: '',
        categoryID: '',
        categoryName: ''
    });

    const limit = 10;

    const handleChange = (e, name) => {
        setFilters({ ...filters, [name]: e.target.value });
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map((p) => p.productID));
        }
    };

    const toggleSelectOne = (productID) => {
        setSelectedProducts((prev) =>
            prev.includes(productID) ? prev.filter((id) => id !== productID) : [...prev, productID]
        );
    };

    const openBulkDialog = (action) => {
        if (!selectedProducts.length) {
            toast.warning('Select at least one product');
            return;
        }
        setBulkAction(action);
        setBulkForm({
            discountType: '',
            discountValue: '',
            updateSalePrice: false,
            sectionid: ''
        });
        setBulkDialogOpen(true);
    };

    const closeBulkDialog = () => {
        setBulkDialogOpen(false);
        setBulkAction('');
    };

    const handleBulkSubmit = async () => {
        try {
            if (!selectedProducts.length) {
                toast.warning('Select at least one product');
                return;
            }

            if (bulkAction === 'delete') {
                const res = await bulkDeleteProducts(selectedProducts);
                if (res.success) toast.success('Selected products deleted successfully');
                else toast.error(res.message || 'Bulk delete failed');
            } else if (bulkAction === 'sale') {
                const { discountType, discountValue, updateSalePrice } = bulkForm;
                if (!discountType || discountValue === '') {
                    toast.error('Discount type and value are required');
                    return;
                }
                const res = await bulkSaleUpdate({
                    productIDs: selectedProducts,
                    discountType,
                    discountValue: Number(discountValue),
                    updateSalePrice
                });
                if (res.success) toast.success('Bulk sale updated successfully');
                else toast.error(res.message || 'Bulk sale update failed');
            } else if (bulkAction === 'assign-section') {
                const { sectionid } = bulkForm;
                if (!sectionid) {
                    toast.error('Section ID is required');
                    return;
                }
                const res = await bulkAssignSection({
                    productIDs: selectedProducts,
                    sectionid
                });
                if (res.success) toast.success('Section assigned to selected products');
                else toast.error(res.message || 'Bulk assign section failed');
            } else if (bulkAction === 'remove-section') {
                const res = await bulkRemoveSection({
                    productIDs: selectedProducts
                });
                if (res.success) toast.success('Section removed from selected products');
                else toast.error(res.message || 'Bulk remove section failed');
            }

            await fetchProductCount();
            await fetchProducts();
            setSelectedProducts([]);
            closeBulkDialog();
        } catch (err) {
            console.error('Bulk action error:', err);
            toast.error('Bulk action failed');
        }
    };

    const fetchProductCount = async () => {
        try {
            const { totalItems } = await getProductCount(filters);
            setTotalPages(Math.ceil(totalItems / limit) || 1);
        } catch (error) {
            console.error('Error counting products:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getPaginatedProducts({
                page,
                limit,
                filters
            });
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setPage(1);
        await fetchProductCount();
        await fetchProducts();
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleDeleteProduct = async (productID) => {
        try {
            setDeleteLoading(true);
            const response = await deleteProduct(productID);

            if (response.success) {
                toast.success('Product deleted successfully');
                await fetchProductCount();
                await fetchProducts();
            } else {
                toast.error(response.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error deleting product');
        } finally {
            setDeleteLoading(false);
            setProductToDelete(null);
        }
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
    };

    const cancelDelete = () => {
        setProductToDelete(null);
    };

    const getProductRoute = (product) => {
        if (product.type === 'customproduct') {
            return `/custom-product/edit/${product.productID}`;
        } else if (product.type === 'Make_combo') {
            return `/make-combo/detail/${product.productID}`;
        } else if (product.type === 'combo') {
            return `/combo/detail/${product.productID}`;
        } else {
            return `/products/details/${product.productID}`;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchProductCount();
            await fetchProducts();
        };
        loadData();
    }, [page, filters]);

    const renderPageNumbers = () => {
        const buttons = [];
        const maxVisible = 5;
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-150 ${page === i
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-200 font-bold"
                        : "border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800"
                        }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    return (
        <Layout title="Product List" active="admin-products-list">
            <div className="p-4 font-sans">

                {/* Header Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
                            <RiShoppingBag3Line className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-800">
                                Product Inventory
                            </h1>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">
                                Manage store stock, configure sales campaigns, and update section allocations
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => handleSearch()}
                            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                            <RiRefreshLine className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                        </button>
                        <button
                            onClick={() => navigate("/products/add")}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-100 hover:shadow-lg transition-all duration-200"
                        >
                            <RiAddLine className="w-4 h-4" /> Add Product
                        </button>
                        <button
                            // In ListProducts.jsx — fix the existing "Soft Delete" button's onClick
                            onClick={() => navigate('/products/deleted')}
                            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                            <RiRefreshLine className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Soft Delete
                        </button>
                    </div>
                </div>

                {/* 🔍 Dynamic Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-4">
                    <input
                        type="text"
                        id="filter-name"
                        name="name"
                        placeholder="Product Name..."
                        value={filters.name}
                        onChange={(e) => handleChange(e, 'name')}
                        className="bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                    />
                    <input
                        type="text"
                        id="filter-productID"
                        name="productID"
                        placeholder="Product ID..."
                        value={filters.productID}
                        onChange={(e) => handleChange(e, 'productID')}
                        className="bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                    />
                    <input
                        type="text"
                        id="filter-type"
                        name="type"
                        placeholder="Product Type..."
                        value={filters.type}
                        onChange={(e) => handleChange(e, 'type')}
                        className="bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                    />
                    <input
                        type="text"
                        id="filter-categoryID"
                        name="categoryID"
                        placeholder="Category ID..."
                        value={filters.categoryID}
                        onChange={(e) => handleChange(e, 'categoryID')}
                        className="bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                    />
                    <input
                        type="text"
                        id="filter-categoryName"
                        name="categoryName"
                        placeholder="Category Name..."
                        value={filters.categoryName}
                        onChange={(e) => handleChange(e, 'categoryName')}
                        className="bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                    />
                </div>

                {/* ✨ Bulk Actions Bar */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border transition-all duration-300 px-4 py-3 ${selectedProducts.length > 0
                    ? "bg-purple-50/50 border-purple-100 shadow-sm shadow-purple-50/20"
                    : "bg-slate-50/60 border-slate-100"
                    } mb-5 gap-3`}>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${selectedProducts.length > 0 ? "text-purple-700" : "text-slate-500"}`}>
                            Bulk Actions
                        </span>
                        <span className="text-slate-200">|</span>
                        <span className="text-xs font-medium text-slate-500">
                            Selected: <strong className={`font-semibold ${selectedProducts.length > 0 ? "text-purple-700" : "text-slate-800"}`}>{selectedProducts.length}</strong> products
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => openBulkDialog('sale')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100/80 text-amber-700 border border-amber-100 transition-all active:scale-95 duration-100"
                        >
                            SALE UPDATE
                        </button>
                        <button
                            onClick={() => openBulkDialog('assign-section')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-100 transition-all active:scale-95 duration-100"
                        >
                            ASSIGN SECTION
                        </button>
                        <button
                            onClick={() => openBulkDialog('remove-section')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-all active:scale-95 duration-100"
                        >
                            REMOVE SECTION
                        </button>
                        <button
                            onClick={() => openBulkDialog('delete')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-100 transition-all active:scale-95 duration-100"
                        >
                            DELETE SELECTED
                        </button>
                    </div>
                </div>

                {/* 📊 Main Inventory Table */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-50/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === products.length && products.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-slate-200 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product ID</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Details</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Brand</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pricing</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Discount</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Section</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Created</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading store items...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                                            No products matching criteria. Adjust filters or register a new product.
                                        </td>
                                    </tr>
                                ) : products.map((product) => {
                                    let imgUrl = '';
                                    try {
                                        const images = JSON.parse(product.featuredImage || '[]');
                                        imgUrl = images?.[0]?.imgUrl || '';
                                    } catch (e) {
                                        imgUrl = '';
                                    }

                                    return (
                                        <tr key={product.productID} className="hover:bg-slate-50/40 transition-colors duration-150">
                                            <td className="py-3.5 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.productID)}
                                                    onChange={() => toggleSelectOne(product.productID)}
                                                    className="h-4 w-4 rounded border-slate-200 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                                                {product.productID}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={imgUrl}
                                                        alt="Product"
                                                        onError={(e) => { 
                                                            if (!e.target.dataset.error) {
                                                                e.target.dataset.error = true;
                                                                e.target.src = 'https://placehold.co/150x150?text=No+Image'; 
                                                            }
                                                        }}
                                                        className="h-9 w-9 rounded-full border border-slate-100 object-cover shadow-sm"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[240px]">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-medium text-slate-600 text-center">
                                                {(!product.brand && !product.brandID) ? 'INHOUSE' : (product.brand || product.brandID || '-')}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span className="text-xs font-bold text-slate-800">
                                                        ₹{product.salePrice}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 line-through">
                                                        ₹{product.regularPrice}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {(() => {
                                                    const t = String(product.type || '').toLowerCase();
                                                    if (t === 'customproduct') {
                                                        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Custom</span>;
                                                    }
                                                    if (t === 'make_combo') {
                                                        return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">MC</span>;
                                                    }
                                                    if (t === 'combo') {
                                                        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Combo</span>;
                                                    }
                                                    if (t === 'variable') {
                                                        return <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Variable</span>;
                                                    }
                                                    return <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{product.type || 'Standard'}</span>;
                                                })()}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 text-center">
                                                {product.discountType && product.discountValue ? (
                                                    <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        {String(product.discountType).toLowerCase() === 'percentage'
                                                            ? `${product.discountValue}% OFF`
                                                            : `₹${product.discountValue} OFF`}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {product.sectionid ? (
                                                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                                                        {product.sectionid}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-400 text-center">
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right relative">
                                                <div className="inline-flex items-center justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenActionFor(
                                                                openActionFor === product.productID
                                                                    ? null
                                                                    : product.productID
                                                            )
                                                        }
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition active:scale-95 duration-100"
                                                    >
                                                        Actions
                                                    </button>
                                                    {openActionFor === product.productID && (
                                                        <div className="absolute right-4 top-full mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden text-left z-20">
                                                            <button
                                                                type="button"
                                                                className="w-full px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 transition-all"
                                                                onClick={() => {
                                                                    setOpenActionFor(null);
                                                                    navigate(getProductRoute(product));
                                                                }}
                                                            >
                                                                <RiEditLine size={14} className="text-slate-400" />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="w-full px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-all"
                                                                onClick={() => {
                                                                    setOpenActionFor(null);
                                                                    confirmDelete(product);
                                                                }}
                                                                disabled={deleteLoading}
                                                            >
                                                                <RiDeleteBinLine size={14} className="text-rose-400" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🔄 Redesigned Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-400">
                            Showing page <span className="text-slate-700 font-semibold">{page}</span> of <span className="text-slate-700 font-semibold">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={page === 1 || loading}
                                className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-xs font-semibold transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {renderPageNumbers()}
                            </div>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || loading}
                                className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-xs font-semibold transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ⚠️ Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full mx-4 border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                <RiDeleteBinLine className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">
                                Delete Product
                            </h3>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
                            Are you sure you want to delete the product <strong className="text-slate-800 font-semibold">"{productToDelete.name}"</strong>? This action is permanent and cannot be undone.
                        </p>
                        <div className="flex gap-2.5 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(productToDelete.productID)}
                                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md shadow-rose-100 transition-all disabled:opacity-50"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✨ Bulk Action Modal */}
            {bulkDialogOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full mx-4 border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <RiStackLine className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">
                                {bulkAction === 'delete' && 'Bulk Delete Products'}
                                {bulkAction === 'sale' && 'Bulk Sale Update'}
                                {bulkAction === 'assign-section' && 'Bulk Assign Section'}
                                {bulkAction === 'remove-section' && 'Bulk Remove Section'}
                            </h3>
                        </div>
                        <p className="text-xs font-medium text-purple-600 mb-4 bg-purple-50 px-2.5 py-1 rounded-md inline-block">
                            {selectedProducts.length} product(s) selected
                        </p>

                        {bulkAction === 'sale' && (
                            <div className="space-y-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Discount Type
                                    </label>
                                    <select
                                        className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                                        value={bulkForm.discountType}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                discountType: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="">Select type</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Discount Value
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                                        value={bulkForm.discountValue}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                discountValue: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <label className="inline-flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        checked={bulkForm.updateSalePrice}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                updateSalePrice: e.target.checked
                                            }))
                                        }
                                    />
                                    <span className="font-medium">Also recalculate sale price from regular price</span>
                                </label>
                            </div>
                        )}

                        {bulkAction === 'assign-section' && (
                            <div className="space-y-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Section ID
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2 text-xs transition-all shadow-sm outline-none"
                                        value={bulkForm.sectionid}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                sectionid: e.target.value
                                            }))
                                        }
                                        placeholder="e.g. HOME_HERO, BEST_SELLERS"
                                    />
                                </div>
                            </div>
                        )}

                        {(bulkAction === 'delete' || bulkAction === 'remove-section') && (
                            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 leading-relaxed mb-4">
                                ⚠️ Warning: This action cannot be easily undone. Proceed with caution.
                            </p>
                        )}

                        <div className="flex justify-end gap-2.5 mt-6">
                            <button
                                onClick={closeBulkDialog}
                                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkSubmit}
                                className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md shadow-purple-100 transition-all"
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ListProducts;
