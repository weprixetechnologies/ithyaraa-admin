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
import { getPaginatedHomepageSections, deleteHomepageSection, updateHomepageSectionStatus } from "./../../lib/api/homepageSectionsApi";
import {
    RiSearchLine,
    RiRefreshLine,
    RiAddLine,
    RiImageLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiEyeLine,
    RiEyeOffLine,
    RiEditLine,
    RiArrowUpLine,
    RiArrowDownLine
} from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const ListHomepageSections = () => {
    const [sections, setSections] = useState([]);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState('position');
    const [sortDir, setSortDir] = useState('ASC');
    const limit = 10;
    const navigate = useNavigate();

    // Fetch sections
    const fetchData = async () => {
        try {
            setLoading(true);
            setRefreshing(true);
            const response = await getPaginatedHomepageSections({
                page,
                limit,
                sortBy,
                sortDir
            });

            if (response.success) {
                setSections(response.data || []);
                setTotalItems(response.pagination?.totalItems || 0);
            } else {
                toast.error(response.message || 'Failed to fetch sections');
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('Failed to fetch sections');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sortBy, sortDir]);

    const handleRefresh = () => {
        fetchData();
    };

    const handleDeleteSection = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete the section "${title || id}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await deleteHomepageSection(id);
            if (response.success) {
                toast.success('Section deleted successfully');
                fetchData();
            } else {
                toast.error(response.error || response.message || 'Failed to delete section');
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            toast.error('Failed to delete section');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setLoading(true);
            const newStatus = !currentStatus;
            const response = await updateHomepageSectionStatus(id, newStatus);
            if (response.success) {
                toast.success(`Section ${newStatus ? 'enabled' : 'disabled'} successfully`);
                fetchData();
            } else {
                toast.error(response.error || response.message || 'Failed to update section status');
            }
        } catch (error) {
            console.error('Error updating section status:', error);
            toast.error('Failed to update section status');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDir('ASC');
        }
        setPage(1);
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
        <Layout active={'admin-homepage-sections-list'}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    Homepage Sections
                                </h1>
                                <p className="text-secondary-text mt-2 text-lg">
                                    Manage dynamic homepage banner sections
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
                                    onClick={() => navigate('/homepage-sections/add')}
                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <RiAddLine className="w-4 h-4" />
                                    Add Section
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-text">Total Sections</p>
                                    <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <RiImageLine className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-text">Active Sections</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {sections.filter(s => s.isActive).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <RiEyeLine className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-secondary-text">Inactive Sections</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {sections.filter(s => !s.isActive).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <RiEyeOffLine className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Sections</h3>
                                <div className="text-sm text-gray-500">
                                    Showing {sections.length} of {totalItems} sections
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                                        <TableHead
                                            className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider cursor-pointer hover:bg-purple-100"
                                            onClick={() => handleSort('id')}
                                        >
                                            <div className="flex items-center gap-1">
                                                ID
                                                {sortBy === 'id' && (
                                                    sortDir === 'ASC' ? <RiArrowUpLine /> : <RiArrowDownLine />
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Image
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Title
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Route To
                                        </TableHead>
                                        <TableHead
                                            className="px-6 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider cursor-pointer hover:bg-purple-100"
                                            onClick={() => handleSort('position')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                Position
                                                {sortBy === 'position' && (
                                                    sortDir === 'ASC' ? <RiArrowUpLine /> : <RiArrowDownLine />
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Status
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
                                                    <p className="text-gray-500 text-lg">Loading sections...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : sections.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <RiImageLine className="w-16 h-16 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-lg font-medium">No sections found</p>
                                                    <p className="text-gray-400 text-sm mt-1">Create your first homepage section</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sections.map((section, idx) => (
                                            <TableRow
                                                key={section.id}
                                                className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-background'
                                                    }`}
                                            >
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono font-medium text-foreground">
                                                        #{section.id}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center">
                                                        {section.image ? (
                                                            <img
                                                                src={section.image}
                                                                alt={section.title || 'Section Image'}
                                                                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                <RiImageLine className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-foreground">
                                                        {section.title || 'Untitled Section'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-secondary-text">
                                                        {section.routeTo || section.link || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm font-semibold text-purple-600">
                                                        {section.position}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    {section.isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/homepage-sections/edit/${section.id}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                                        >
                                                            <MdEdit className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(section.id, section.isActive)}
                                                            disabled={loading}
                                                            className={`flex items-center gap-1.5 px-3 py-2 border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${section.isActive
                                                                ? 'text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                                                                : 'text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
                                                                }`}
                                                        >
                                                            {section.isActive ? (
                                                                <>
                                                                    <RiEyeOffLine className="w-4 h-4" />
                                                                    Disable
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <RiEyeLine className="w-4 h-4" />
                                                                    Enable
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteSection(section.id, section.title)}
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
                        <div className="bg-background px-6 py-4 border-t border-gray-200 mt-6 rounded-b-xl">
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
                </Container>
            </div>
        </Layout>
    );
};

export default ListHomepageSections;
