// pages/products/SoftDeletedProducts.jsx
import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import { useNavigate } from 'react-router-dom';
import { getDeletedProducts } from './../../lib/api/productsApi';
import { toast } from 'react-toastify';
import {
    RiRefreshLine,
    RiArrowLeftLine,
    RiDeleteBinLine,
    RiShoppingBag3Line,
    RiInboxArchiveLine
} from "react-icons/ri";

const SoftDeletedProducts = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;
    const fetchDeletedProducts = async () => {
        try {
            setLoading(true);
            console.log('[fetchDeletedProducts] Calling API', { page, limit });

            const response = await getDeletedProducts({ page, limit });
            console.log('[fetchDeletedProducts] Raw response', response);

            if (response.success) {
                console.log('[fetchDeletedProducts] OK', {
                    total: response.pagination?.total,
                    rowsReceived: response.data?.length
                });
                setProducts(response.data || []);
                setPagination(response.pagination);
            } else {
                console.warn('[fetchDeletedProducts] API returned failure', response);
                toast.error(response.message || 'Failed to fetch deleted products');
            }
        } catch (error) {
            console.error('[fetchDeletedProducts] Network/parse error', {
                message: error.message,
                stack: error.stack
            });
            toast.error('Error fetching deleted products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedProducts();
    }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const renderPageNumbers = () => {
        const buttons = [];
        const maxVisible = 5;
        const totalPages = pagination.totalPages;
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
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-200 font-bold'
                        : 'border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                        }`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    return (
        <Layout title="Soft Deleted Products" active="admin-products-list">
            <div className="p-4 font-sans">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
                            <RiInboxArchiveLine className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-800">
                                Soft Deleted Products
                            </h1>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">
                                Products removed from storefront but retained due to existing orders
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate('/products/list')}
                            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                            <RiArrowLeftLine className="w-4 h-4" /> Back to Products
                        </button>
                        <button
                            onClick={fetchDeletedProducts}
                            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                            <RiRefreshLine className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <RiDeleteBinLine className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-medium text-rose-700">
                        Total soft deleted products:{' '}
                        <strong className="font-bold">{pagination.total}</strong>
                    </span>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-50/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product ID</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Details</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pricing</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Variations</th>
                                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Deleted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading deleted products...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                            No soft deleted products found.
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
                                            <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                                                {product.productID}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={imgUrl}
                                                        alt=""
                                                        onError={(e) => { e.target.src = 'https://ithyaraa.b-cdn.net/placeholder-product.png'; }}
                                                        className="h-9 w-9 rounded-full border border-slate-100 object-cover shadow-sm opacity-60"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[240px]">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                            {product.categoryName || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {(() => {
                                                    const t = String(product.type || '').toLowerCase();
                                                    if (t === 'customproduct') return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Custom</span>;
                                                    if (t === 'make_combo') return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">MC</span>;
                                                    if (t === 'combo') return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Combo</span>;
                                                    if (t === 'variable') return <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Variable</span>;
                                                    return <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{product.type || 'Standard'}</span>;
                                                })()}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span className="text-xs font-bold text-slate-800">₹{product.salePrice}</span>
                                                    <span className="text-[10px] text-slate-400 line-through">₹{product.regularPrice}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {product.variationCount ?? 0}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                    {product.deletedAt
                                                        ? new Date(product.deletedAt).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-400">
                            Showing page <span className="text-slate-700 font-semibold">{page}</span> of{' '}
                            <span className="text-slate-700 font-semibold">{pagination.totalPages}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={!pagination.hasPrevPage || loading}
                                className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-xs font-semibold transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {renderPageNumbers()}
                            </div>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={!pagination.hasNextPage || loading}
                                className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-xs font-semibold transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SoftDeletedProducts;