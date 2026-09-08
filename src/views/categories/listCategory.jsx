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
import { getPaginatedCategories, getCategoryCount, deleteCategory, bulkSetFeatured, reorderAllCategories } from "./../../lib/api/categoryApi";
import { Input } from "@/components/ui/input";
import {
    RiSearchLine,
    RiRefreshLine,
    RiAddLine,
    RiImageLine,
    RiFolderLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiListOrdered2,
    RiArrowUpLine,
    RiArrowDownLine,
    RiSaveLine,
    RiDragMove2Fill
} from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const ListCategory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryNameFilter, setCategoryNameFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const limit = 10;
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Reorder State
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [reorderList, setReorderList] = useState([]);
    const [reorderLoading, setReorderLoading] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

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

    const handleOpenReorderModal = async () => {
        setShowReorderModal(true);
        setReorderLoading(true);
        try {
            const res = await getPaginatedCategories({ page: 1, limit: 1000 });
            if (res && res.data) {
                setReorderList(res.data);
            }
        } catch (err) {
            console.error("Error fetching categories for reorder:", err);
            toast.error("Failed to fetch categories for reordering");
        } finally {
            setReorderLoading(false);
        }
    };

    const moveReorderItem = (index, direction) => {
        const newList = [...reorderList];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newList.length) {
            const temp = newList[index];
            newList[index] = newList[targetIndex];
            newList[targetIndex] = temp;
            setReorderList(newList);
        }
    };

    // Drag and Drop handlers for reorder modal
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        setDragOverIndex(null);
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const newList = [...reorderList];
        const [movedItem] = newList.splice(draggedIndex, 1);
        newList.splice(targetIndex, 0, movedItem);

        setReorderList(newList);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleSaveOrder = async () => {
        try {
            setSavingOrder(true);
            const payload = reorderList.map((cat, index) => ({
                categoryID: cat.categoryID,
                order: index + 1
            }));
            const response = await reorderAllCategories(payload);
            if (response.success) {
                toast.success(response.message || "Category order updated successfully!");
                setShowReorderModal(false);
                fetchData();
            } else {
                toast.error(response.error || response.message || "Failed to update category order");
            }
        } catch (err) {
            console.error("Error saving category order:", err);
            toast.error("An error occurred while saving category order");
        } finally {
            setSavingOrder(false);
        }
    };

    const handleDeleteCategory = async (categoryID, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete the category "${categoryName || categoryID}"? This will also remove this category from all associated products. This action cannot be undone.`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await deleteCategory(categoryID);
            if (response.success) {
                toast.success(`Category deleted successfully. ${response.updatedProductsCount || 0} product(s) updated.`);
                // Refresh the categories list
                fetchData();
            } else {
                toast.error(response.error || response.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkFeatured = async (isFeatured) => {
        if (selectedCategories.length === 0) {
            toast.warn("Please select at least one category");
            return;
        }

        const action = isFeatured ? "mark as featured" : "unmark as featured";
        if (!window.confirm(`Are you sure you want to ${action} ${selectedCategories.length} categories?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await bulkSetFeatured(selectedCategories, isFeatured);
            if (response.success) {
                toast.success(response.message || "Updated successfully");
                setSelectedCategories([]);
                fetchData();
            } else {
                toast.error(response.error || "Failed to update categories");
            }
        } catch (error) {
            console.error("Bulk update error:", error);
            toast.error("An error occurred during bulk update");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(cat => cat.categoryID));
        }
    };

    const toggleSelect = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(item => item !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
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
                                <p className="text-secondary-text mt-2 text-lg">
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
                                <Button
                                    onClick={handleOpenReorderModal}
                                    variant="outline"
                                    className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-medium"
                                >
                                    <RiListOrdered2 className="w-4 h-4 text-purple-600" />
                                    Reorder Categories
                                </Button>
                                <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={() => navigate('/categories/add')}>
                                    <RiAddLine className="w-4 h-4" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedCategories.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-purple-100 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                    {selectedCategories.length} selected
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => handleBulkFeatured(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                    size="sm"
                                >
                                    Mark Featured
                                </Button>
                                <Button
                                    onClick={() => handleBulkFeatured(false)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                                    size="sm"
                                >
                                    Unmark Featured
                                </Button>
                                <Button
                                    onClick={() => setSelectedCategories([])}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-text">Total Categories</p>
                                    <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <RiFolderLine className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-text">With Images</p>
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
                                    <p className="text-sm font-medium text-secondary-text">With Banners</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {categories.filter(cat => cat.categoryBanner).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <RiImageLine className="w-6 h-6 text-blue-600" />
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
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary-text transition-colors duration-200"
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
                                <h3 className="text-lg font-semibold text-foreground">Categories</h3>
                                <div className="text-sm text-gray-500">
                                    Showing {categories.length} of {totalItems} categories
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                                        <TableHead className="px-4 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={categories.length > 0 && selectedCategories.length === categories.length}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                        </TableHead>
                                        <TableHead className="px-4 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Order
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            ID
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Category Name
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Featured Image
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Banner Status
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                                                    <p className="text-gray-500 text-lg">Loading categories...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-12 text-center">
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
                                                className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${selectedCategories.includes(cat.categoryID) ? 'bg-purple-50' : idx % 2 === 0 ? 'bg-white' : 'bg-background'
                                                    }`}
                                            >
                                                <TableCell className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(cat.categoryID)}
                                                        onChange={() => toggleSelect(cat.categoryID)}
                                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                    />
                                                </TableCell>
                                                <TableCell className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                                                        {cat.order ?? (idx + 1)}
                                                    </span>
                                                </TableCell>
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
                                                            <div className="text-sm font-mono font-medium text-foreground">
                                                                {cat.categoryID || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-foreground">
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
                                                    <div className="flex flex-col items-center gap-1">
                                                        {cat.categoryBanner ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                                                Available
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                                                                No Banner
                                                            </span>
                                                        )}
                                                        {cat.isFeatured === 1 && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 uppercase tracking-tighter">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
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
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteCategory(cat.categoryID, cat.categoryName)}
                                                            disabled={loading}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <RiDeleteBinLine className="w-4 h-4" />
                                                            Delete
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
                        <div className="bg-background px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-secondary-text">
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
                    {/* Reorder Modal */}
                    {showReorderModal && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {/* Modal Header */}
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <RiListOrdered2 className="w-5 h-5 text-purple-600" />
                                            Reorder Categories
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Drag and drop items or use up/down arrows to reorder. Sequence set here will reflect on the website categories page.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowReorderModal(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white transition-colors"
                                    >
                                        <RiCloseLine className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50 space-y-2">
                                    {reorderLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                                            <p className="text-sm text-gray-500">Loading categories...</p>
                                        </div>
                                    ) : reorderList.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">No categories found to reorder.</div>
                                    ) : (
                                        reorderList.map((cat, index) => (
                                            <div
                                                key={cat.categoryID}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                                    draggedIndex === index
                                                        ? "opacity-40 border-dashed border-purple-500 bg-purple-50"
                                                        : dragOverIndex === index
                                                        ? "border-purple-600 bg-purple-100/70 shadow-md scale-[1.01]"
                                                        : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-gray-400 hover:text-purple-600 cursor-grab active:cursor-grabbing p-1">
                                                        <RiDragMove2Fill className="w-5 h-5" />
                                                    </div>
                                                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200">
                                                        {index + 1}
                                                    </span>
                                                    {cat.featuredImage ? (
                                                        <img
                                                            src={cat.featuredImage}
                                                            alt={cat.categoryName}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 pointer-events-none"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs pointer-events-none">
                                                            <RiImageLine className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{cat.categoryName}</h4>
                                                        <p className="text-xs text-gray-400 font-mono">ID: {cat.categoryID}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => moveReorderItem(index, 'up')}
                                                        disabled={index === 0}
                                                        className="h-8 w-8 p-0 border-gray-200 hover:bg-purple-50 text-gray-700 disabled:opacity-30"
                                                    >
                                                        <RiArrowUpLine className="w-4 h-4 text-purple-600" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => moveReorderItem(index, 'down')}
                                                        disabled={index === reorderList.length - 1}
                                                        className="h-8 w-8 p-0 border-gray-200 hover:bg-purple-50 text-gray-700 disabled:opacity-30"
                                                    >
                                                        <RiArrowDownLine className="w-4 h-4 text-purple-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-medium">
                                        Total: {reorderList.length} categories
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowReorderModal(false)}
                                            disabled={savingOrder}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveOrder}
                                            disabled={savingOrder || reorderLoading || reorderList.length === 0}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
                                        >
                                            <RiSaveLine className="w-4 h-4" />
                                            {savingOrder ? "Saving..." : "Save Order"}
                                        </Button>
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

export default ListCategory;
