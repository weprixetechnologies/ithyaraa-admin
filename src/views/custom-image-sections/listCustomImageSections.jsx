import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { listCustomImageSections, deleteCustomImageSection } from "../../lib/api/customImageSectionsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ListCustomImageSections = () => {
    const [sections, setSections] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const limit = 10;
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listCustomImageSections({ page, limit });
            if (res.success) {
                setSections(res.data || []);
                setTotal(res.pagination?.total || 0);
            } else {
                toast.error(res.message || "Failed to fetch");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [page]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this section?")) return;
        try {
            const res = await deleteCustomImageSection(id);
            if (res.success) {
                toast.success("Deleted");
                fetchData();
            } else toast.error(res.message || "Failed to delete");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete");
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <Layout active={"admin-custom-image-sections"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Custom Image Sections</h1>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate('/custom-image-sections/add')}>Add Section</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>SectionID</TableHead>
                                    <TableHead>Layout</TableHead>
                                    <TableHead>Bannerised</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sections.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="p-6 text-center">No sections</TableCell></TableRow>
                                ) : sections.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell>#{s.id}</TableCell>
                                        <TableCell>{s.title}</TableCell>
                                        <TableCell>{s.sectionID}</TableCell>
                                        <TableCell>{s.layoutID}</TableCell>
                                        <TableCell>{s.isBannerised ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => navigate(`/custom-image-sections/edit/${s.id}`)}>Edit</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div>Page {page} of {totalPages}</div>
                        <div className="flex gap-2">
                            <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
                            <Button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
                        </div>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default ListCustomImageSections;

