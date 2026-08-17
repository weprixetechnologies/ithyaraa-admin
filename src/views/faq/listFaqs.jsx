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
import {
    getPaginatedFaqs,
    deleteFaq,
    toggleFaq,
    reorderFaqs,
} from "../../lib/api/faqApi";
import {
    RiAddLine,
    RiRefreshLine,
    RiDeleteBinLine,
    RiEditLine,
    RiEyeLine,
    RiEyeOffLine,
    RiDraggable,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ListFaqs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPaginatedFaqs({ page: 1, limit: 200 });
            if (res.success && res.data) {
                setFaqs(res.data);
            } else {
                toast.error(res.message || "Failed to fetch FAQs");
            }
        } catch (e) {
            toast.error("Failed to fetch FAQs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id, question) => {
        if (!window.confirm(`Delete "${(question || "").slice(0, 50)}..."?`)) return;
        try {
            const res = await deleteFaq(id);
            if (res.success) {
                toast.success("FAQ deleted");
                fetchData();
            } else {
                toast.error(res.message || "Delete failed");
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleToggle = async (id, current) => {
        try {
            const res = await toggleFaq(id);
            if (res.success) {
                toast.success(res.data?.is_active ? "FAQ enabled" : "FAQ disabled");
                fetchData();
            } else {
                toast.error(res.message || "Toggle failed");
            }
        } catch {
            toast.error("Toggle failed");
        }
    };

    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(id));
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverId(id);
    };

    const handleDragLeave = () => setDragOverId(null);

    const handleDrop = async (e, targetId) => {
        e.preventDefault();
        setDragOverId(null);
        setDraggedId(null);
        const sourceId = e.dataTransfer.getData("text/plain");
        if (!sourceId || sourceId === String(targetId)) return;
        const fromIndex = faqs.findIndex((f) => String(f.id) === sourceId);
        const toIndex = faqs.findIndex((f) => f.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return;
        const reordered = [...faqs];
        const [removed] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, removed);
        const order = reordered.map((item, i) => ({ id: item.id, sort_order: i }));
        try {
            const res = await reorderFaqs(order);
            if (res.success) {
                toast.success("Order updated");
                setFaqs(reordered.map((f, i) => ({ ...f, sort_order: i })));
            } else {
                toast.error(res.message || "Reorder failed");
            }
        } catch {
            toast.error("Reorder failed");
        }
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    return (
        <Layout active="admin-faq-list">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                FAQs
                            </h1>
                            <p className="text-secondary-text mt-2">Manage frequently asked questions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => fetchData()}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <RiRefreshLine className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                            <Button
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                                onClick={() => navigate("/faq/add")}
                            >
                                <RiAddLine className="w-4 h-4" />
                                Add FAQ
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-background border-b border-gray-200">
                                        <TableHead className="w-10 px-4 py-3 text-center">Order</TableHead>
                                        <TableHead className="px-4 py-3">Question</TableHead>
                                        <TableHead className="px-4 py-3 text-center w-24">Status</TableHead>
                                        <TableHead className="px-4 py-3 text-center w-40">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : faqs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                                No FAQs yet. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        faqs.map((faq) => (
                                            <TableRow
                                                key={faq.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, faq.id)}
                                                onDragOver={(e) => handleDragOver(e, faq.id)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, faq.id)}
                                                onDragEnd={handleDragEnd}
                                                className={`cursor-grab active:cursor-grabbing ${draggedId === String(faq.id) ? "opacity-50" : ""} ${dragOverId === faq.id ? "bg-purple-50" : ""}`}
                                            >
                                                <TableCell className="px-4 py-3 text-center">
                                                    <RiDraggable className="w-5 h-5 text-gray-400 inline" />
                                                </TableCell>
                                                <TableCell className="px-4 py-3 font-medium text-foreground">
                                                    {(faq.question || "").slice(0, 80)}
                                                    {(faq.question || "").length > 80 ? "…" : ""}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    {faq.is_active ? (
                                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-secondary-text">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/faq/edit/${faq.id}`)}
                                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                                        >
                                                            <RiEditLine className="w-4 h-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggle(faq.id, faq.is_active)}
                                                            className={faq.is_active ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                                                        >
                                                            {faq.is_active ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                                                            {faq.is_active ? "Disable" : "Enable"}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(faq.id, faq.question)}
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
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

export default ListFaqs;
