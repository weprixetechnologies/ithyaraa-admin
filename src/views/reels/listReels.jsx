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
import { getAllReels, deleteReel, updateReelStatus, reorderReels } from "../../lib/api/reelsApi";
import {
    RiRefreshLine,
    RiAddLine,
    RiDeleteBinLine,
    RiEyeLine,
    RiEyeOffLine,
    RiVideoLine,
    RiDragMove2Fill
} from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const ListReels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            setRefreshing(true);
            const response = await getAllReels();

            if (response.success) {
                setReels(response.data || []);
            } else {
                toast.error(response.error || 'Failed to fetch reels');
            }
        } catch (error) {
            console.error('Error fetching reels:', error);
            toast.error('Failed to fetch reels');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this reel?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await deleteReel(id);
            if (response.success) {
                toast.success('Reel deleted successfully');
                fetchData();
            } else {
                toast.error(response.error || 'Failed to delete reel');
            }
        } catch (error) {
            console.error('Error deleting reel:', error);
            toast.error('Failed to delete reel');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setLoading(true);
            const newStatus = !currentStatus;
            const response = await updateReelStatus(id, newStatus);
            if (response.success) {
                toast.success(`Reel ${newStatus ? 'enabled' : 'disabled'} successfully`);
                fetchData();
            } else {
                toast.error(response.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    // Drag and Drop Logic
    const onDragStart = (e, id) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = async (e, targetId) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || String(draggedId) === String(targetId)) return;

        const list = [...reels];
        const fromIndex = list.findIndex(r => String(r.id) === String(draggedId));
        const toIndex = list.findIndex(r => String(r.id) === String(targetId));

        if (fromIndex === -1 || toIndex === -1) return;

        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);

        // Update positions locally
        const updated = list.map((item, idx) => ({ ...item, position: idx }));
        setReels(updated);

        // Persist to server
        try {
            const positions = updated.map(item => ({ id: item.id, position: item.position }));
            const res = await reorderReels(positions);
            if (res.success) {
                toast.success('Order updated');
            } else {
                toast.error(res.error || 'Failed to update order');
                fetchData();
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update order');
            fetchData();
        }
    };

    return (
        <Layout active={'admin-reels'}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    Reels Management
                                </h1>
                                <p className="text-secondary-text mt-2 text-lg">
                                    Manage homepage reels and videos
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
                                    onClick={() => navigate('/reels/add')}
                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <RiAddLine className="w-4 h-4" />
                                    Add Reel
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Reels List</h3>
                                <div className="text-sm text-gray-500">
                                    Dragging items will update the display order on the homepage
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                                        <TableHead className="w-12 text-center"></TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            ID
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Video URL
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                            Position
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
                                    {loading && !reels.length ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                                                    <p className="text-gray-500">Loading reels...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : reels.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <RiVideoLine className="w-16 h-16 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-lg font-medium">No reels found</p>
                                                    <p className="text-gray-400 text-sm mt-1">Upload your first reel to get started</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reels.map((reel, idx) => (
                                            <TableRow
                                                key={reel.id}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, reel.id)}
                                                onDragOver={onDragOver}
                                                onDrop={(e) => onDrop(e, reel.id)}
                                                className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-move ${idx % 2 === 0 ? 'bg-white' : 'bg-background'}`}
                                            >
                                                <TableCell className="text-center">
                                                    <RiDragMove2Fill className="text-gray-400 inline-block" />
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono font-medium text-foreground">
                                                        #{reel.id}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 max-w-xs truncate">
                                                    <div className="text-sm text-secondary-text" title={reel.video_url}>
                                                        {reel.video_url}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm font-semibold text-purple-600">
                                                        {reel.position}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    {reel.isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/reels/edit/${reel.id}`)}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-green-600 border-green-200 hover:bg-green-50"
                                                        >
                                                            <MdEdit className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(reel.id, reel.isActive)}
                                                            disabled={loading}
                                                            className={`flex items-center gap-1.5 px-3 py-2 border ${reel.isActive
                                                                ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                                                                : 'text-green-600 border-green-200 hover:bg-green-50'
                                                                }`}
                                                        >
                                                            {reel.isActive ? (
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
                                                            onClick={() => handleDelete(reel.id)}
                                                            disabled={loading}
                                                            className="flex items-center gap-1.5 px-3 py-2 text-red-600 border-red-200 hover:bg-red-50"
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
                </Container>
            </div>
        </Layout>
    );
};

export default ListReels;
