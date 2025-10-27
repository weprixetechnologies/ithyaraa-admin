import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { getPaginatedCategories, getCategoryCount } from "./../../lib/api/categoryApi";
import { Input } from "@/components/ui/input";
import {
    RiSearchLine,
    RiRefreshLine,
    RiAddLine,
    RiImageLine,
    RiFolderLine,
    RiCloseLine
} from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ListCategory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryNameFilter, setCategoryNameFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const limit = 10;
    const navigate = useNavigate();

    // Fetch categories
    const fetchData = async () => {
        try {
            setLoading(true);
            setRefreshing(true);
            const [catRes, countRes] = await Promise.all([
                getPaginatedCategories({ page, limit, filters: { categoryName: categoryNameFilter } }),
                getCategoryCount({ categoryName: categoryNameFilter })
            ]);

            setCategories(catRes.data || []);
            setTotalItems(countRes);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryNameFilter, page]);

    const handleRefresh = () => {
        fetchData();
    };

    const handleSearch = () => {
        setPage(1);
        fetchData();
    };

    // Pagination logic
    const totalPages = Math.ceil(totalItems / limit);
    const maxPagesToShow = 5;
    let pages = [];

    if (totalPages <= maxPagesToShow) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        const middle = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, page - middle);
        let end = Math.min(totalPages, page + middle);

        if (page <= middle) {
            end = maxPagesToShow;
        } else if (page + middle >= totalPages) {
            start = totalPages - maxPagesToShow + 1;
        }

        pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    return (
        <Layout active={'admin-category-list'}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    Category Management
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    Manage product categories and their details
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    variant="outline"
                                    className="flex items-center gap-2 hover:bg-purple-50 border-purple-200 text-purple-700"
                                >
                                    <RiRefreshLine className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                    <RiAddLine className="w-4 h-4" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Categories</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <RiFolderLine className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">With Images</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {categories.filter(cat => cat.featuredImage).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <RiImageLine className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">With Banners</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {categories.filter(cat => cat.categoryBanner).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <RiImageLine className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                                    <p className="text-2xl font-bold text-pink-600">
                                        {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-pink-100 rounded-full">
                                    <RiFolderLine className="w-6 h-6 text-pink-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Search category name..."
                                    value={categoryNameFilter}
                                    onChange={(e) => setCategoryNameFilter(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                                {categoryNameFilter && (
                                    <button
                                        onClick={() => {
                                            setCategoryNameFilter('');
                                            setPage(1);
                                            fetchData();
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <RiCloseLine className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Searching...
                                    </div>
                                ) : (
                                    'Search'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                                <div className="text-sm text-gray-500">
                                    Showing {categories.length} of {totalItems} categories
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            ID
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Category Name
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Featured Image
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Products
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Banner Status
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                                                    <p className="text-gray-500 text-lg">Loading categories...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <RiFolderLine className="w-16 h-16 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-lg font-medium">No categories found</p>
                                                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((cat, idx) => (
                                            <TableRow
                                                key={cat.categoryID}
                                                className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                                <span className="text-white font-bold text-sm">
                                                                    {typeof cat.categoryID === 'string' ? cat.categoryID.slice(-2) : String(cat.categoryID || '').slice(-2) || 'ID'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-mono font-medium text-gray-900">
                                                                {cat.categoryID || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {cat.categoryName || 'Unnamed Category'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center">
                                                        {cat.featuredImage ? (
                                                            <img
                                                                src={cat.featuredImage}
                                                                alt={cat.categoryName || 'Category Image'}
                                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <RiImageLine className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {cat.count || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">products</div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    {cat.categoryBanner ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                                            {/* <span>✅</span> */}
                                                            Available
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                                                            {/* <span>❌</span> */}
                                                            No Banner
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/categories/edit/${cat.categoryID}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                                        >
                                                            <MdEdit className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/categories/details/${cat.categoryID}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                                        >
                                                            <IoMdEye className="w-4 h-4" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>


                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page <span className="font-semibold">{page}</span> of{' '}
                                    <span className="font-semibold">{totalPages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1 || loading}
                                        variant="outline"
                                        size="sm"
                                        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {pages.map((pg) => (
                                            <Button
                                                key={pg}
                                                onClick={() => setPage(pg)}
                                                variant={page === pg ? "default" : "outline"}
                                                size="sm"
                                                className={`w-10 h-10 ${page === pg
                                                    ? 'bg-purple-600 text-white'
                                                    : 'hover:bg-purple-50'
                                                    }`}
                                            >
                                                {pg}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages || loading}
                                        variant="outline"
                                        size="sm"
                                        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        </Layout>
    );
};

export default ListCategory;
