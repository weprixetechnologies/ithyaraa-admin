import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import { listPresaleSectionGroups, deletePresaleSectionGroup } from "../../lib/api/presaleSectionGroupsApi";
import { RiRefreshLine, RiAddLine, RiDeleteBinLine, RiEditLine, RiStackLine, RiCheckboxCircleFill, RiCloseCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ListPresaleSectionGroups = () => {
    const [groups, setGroups] = useState([]);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const limit = 10;
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listPresaleSectionGroups({ page, limit });
            if (res.success) {
                setGroups(res.data || []);
                setTotalItems(res.pagination?.total || 0);
            } else {
                toast.error(res.message || "Failed to fetch groups");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [page]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this presale group? This will remove associated entries.")) return;
        try {
            setLoading(true);
            const res = await deletePresaleSectionGroup(id);
            if (res.success) {
                toast.success("Group deleted successfully");
                fetchData();
            } else {
                toast.error(res.message || "Failed to delete group");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete group");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const renderPageNumbers = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        page === i 
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
        <Layout active={"admin-presale-section-groups"}>
            <div className="min-h-screen bg-[#fafbfc] bg-gradient-to-tr from-purple-50/20 via-slate-50/50 to-indigo-50/20 p-6 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-[24px] border border-slate-100 shadow-sm shadow-slate-100/50 p-6 md:p-8">
                    
                    {/* Header Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
                                <RiStackLine className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-800">
                                    Presale Section Groups
                                </h1>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">
                                    Manage presale product groups for homepage sections
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2.5">
                            <button 
                                onClick={() => fetchData()} 
                                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                            >
                                <RiRefreshLine className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                            </button>
                            <button 
                                onClick={() => navigate("/presale-section-groups/add")} 
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-100 hover:shadow-lg transition-all duration-200"
                            >
                                <RiAddLine className="w-4 h-4" /> Add Group
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-50/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Section ID</th>
                                        <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group Title</th>
                                        <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Index</th>
                                        <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bannerised</th>
                                        <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading && groups.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Loading groups...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : groups.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                                No presale groups found. Click "Add Group" to create one.
                                            </td>
                                        </tr>
                                    ) : groups.map(g => (
                                        <tr key={g.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                                            <td className="py-3.5 px-4 text-xs font-mono text-slate-400">#{g.id}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{g.sectionID}</td>
                                            <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{g.title || '-'}</td>
                                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-mono">
                                                    {g.orderIndex}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs">
                                                {g.isBannerised ? (
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1 shadow-sm shadow-emerald-50/20">
                                                        <RiCheckboxCircleFill className="w-3.5 h-3.5 text-emerald-500" /> Yes
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1">
                                                        <RiCloseCircleFill className="w-3.5 h-3.5 text-slate-400" /> No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button 
                                                        onClick={() => navigate(`/presale-section-groups/edit/${g.id}`)}
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-100 hover:border-purple-200 bg-transparent rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 duration-150"
                                                    >
                                                        <RiEditLine className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(g.id)}
                                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 bg-transparent rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 duration-150"
                                                    >
                                                        <RiDeleteBinLine className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                            <div className="text-xs font-medium text-slate-400">
                                Showing page <span className="text-slate-700 font-semibold">{page}</span> of <span className="text-slate-700 font-semibold">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => setPage(Math.max(1, page - 1))} 
                                    disabled={page === 1}
                                    className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-xs font-semibold transition-all"
                                >
                                    Previous
                                </button>
                                <div className="flex gap-1">
                                    {renderPageNumbers()}
                                </div>
                                <button 
                                    onClick={() => setPage(Math.min(totalPages, page + 1))} 
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg text-xs font-semibold transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ListPresaleSectionGroups;
