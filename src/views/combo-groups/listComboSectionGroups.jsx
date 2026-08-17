import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { listComboSectionGroups, deleteComboSectionGroup } from "../../lib/api/comboSectionGroupsApi";
import { RiRefreshLine, RiAddLine, RiDeleteBinLine, RiEditLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ListComboSectionGroups = () => {
    const [groups, setGroups] = useState([]);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const limit = 10;
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listComboSectionGroups({ page, limit });
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
        if (!window.confirm("Delete this combo group? This will remove associated entries.")) return;
        try {
            setLoading(true);
            const res = await deleteComboSectionGroup(id);
            if (res.success) {
                toast.success("Combo group deleted");
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

    return (
        <Layout active={"admin-combo-groups"} title={"Combo Groups"}>
            <div className="min-h-screen bg-background p-6">
                <Container>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Combo Groups</h1>
                            <p className="text-sm text-gray-500">Manage combo products groups for homepage and offer page sections</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => fetchData()} variant="outline"><RiRefreshLine /> Refresh</Button>
                            <Button onClick={() => navigate("/combo-groups/add")} className="bg-purple-600 text-white"><RiAddLine /> Add Group</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Section ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Bannerised</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-6">No combo groups found</TableCell>
                                    </TableRow>
                                ) : groups.map(g => (
                                    <TableRow key={g.id}>
                                        <TableCell>#{g.id}</TableCell>
                                        <TableCell>{g.sectionID}</TableCell>
                                        <TableCell>{g.title || '-'}</TableCell>
                                        <TableCell>{g.orderIndex}</TableCell>
                                        <TableCell>{g.isBannerised ? "Yes" : "No"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/combo-groups/edit/${g.id}`)}><RiEditLine /> Edit</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(g.id)}><RiDeleteBinLine /> Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-secondary-text">Showing page {page} of {totalPages}</div>
                        <div className="flex gap-2">
                            <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
                            <Button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
                        </div>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default ListComboSectionGroups;
