import React, { useEffect, useState, useRef } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getPresaleSectionGroupByID, updatePresaleSectionGroup, addProductsToPresaleGroup, replaceProductsInPresaleGroup } from "../../lib/api/presaleSectionGroupsApi";
import SelectPresaleProducts from "@/components/ui/selectPresaleProducts";
import UploadImages from '@/components/ui/uploadImages';
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const EditPresaleSectionGroup = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [metaForm, setMetaForm] = useState({ sectionID: '', title: '', orderIndex: '', imageUrl: '', isBannerised: false });
    const uploadRef = useRef(null);
    const navigate = useNavigate();

    const fetchGroup = async () => {
        try {
            setLoading(true);
            const res = await getPresaleSectionGroupByID(groupId);
            if (res.success) {
                setGroup(res.data);
                const prods = (res.data.products || []).map(p => p.presaleProductID);
                setSelectedProducts(prods);
                setMetaForm({
                    sectionID: res.data.sectionID || '',
                    title: res.data.title || '',
                    orderIndex: res.data.orderIndex || 0,
                    imageUrl: res.data.imageUrl || '',
                    isBannerised: !!res.data.isBannerised
                });
            } else {
                toast.error(res.message || "Failed to load presale group");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load presale group");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
        // eslint-disable-next-line
    }, [groupId]);

    const handleUpdateDetails = async () => {
        try {
            setLoading(true);

            // Upload new image if provided
            let imageUrl = metaForm.imageUrl || (group && group.imageUrl) || null;
            if (uploadRef.current?.uploadImageFunction) {
                const uploaded = await uploadRef.current.uploadImageFunction();
                if (uploaded && uploaded.length > 0 && uploaded[0].imgUrl) {
                    imageUrl = uploaded[0].imgUrl;
                }
            }

            const payload = {
                sectionID: metaForm.sectionID !== '' ? parseInt(metaForm.sectionID, 10) : undefined,
                title: metaForm.title !== '' ? String(metaForm.title) : undefined,
                orderIndex: metaForm.orderIndex !== '' ? parseInt(metaForm.orderIndex, 10) : undefined,
                imageUrl: imageUrl,
                isBannerised: !!metaForm.isBannerised
            };

            const res = await updatePresaleSectionGroup(groupId, payload);
            if (res.success) {
                toast.success("Presale group updated");
                await fetchGroup();
            } else {
                toast.error(res.message || "Failed to update details");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update presale group");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProducts = async (productIDs) => {
        try {
            setLoading(true);
            const res = await addProductsToPresaleGroup(groupId, productIDs);
            if (res.success) {
                toast.success("Products added successfully");
                fetchGroup();
            } else {
                toast.error(res.message || "Failed to add products");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to add products");
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceProducts = async (productIDs) => {
        if (!window.confirm("Replace all existing products for this presale group?")) return;
        try {
            setLoading(true);
            const res = await replaceProductsInPresaleGroup(groupId, productIDs);
            if (res.success) {
                toast.success("Products replaced successfully");
                fetchGroup();
            } else {
                toast.error(res.message || "Failed to replace products");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to replace products");
        } finally {
            setLoading(false);
        }
    };

    const handleProductToggle = (pid) => {
        setSelectedProducts(prev => {
            const exists = prev.includes(pid);
            if (exists) return prev.filter(p => p !== pid);
            return [...prev, pid];
        });
    };

    return (
        <Layout active={"admin-presale-section-groups"}>
            <div className="min-h-screen bg-background p-6">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Edit Presale Section Group</h2>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate("/presale-section-groups/list")} variant="outline">Back</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded shadow col-span-1">
                            <h3 className="font-semibold mb-2">Metadata</h3>
                            {group ? (
                                <div className="space-y-3">
                                    <label className="flex flex-col">
                                        Section ID
                                        <input
                                            type="number"
                                            value={metaForm.sectionID}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, sectionID: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        Title
                                        <input
                                            type="text"
                                            value={metaForm.title}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>
                                    <label className="flex flex-col">
                                        Order Index
                                        <input
                                            type="number"
                                            value={metaForm.orderIndex}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, orderIndex: e.target.value }))}
                                            className="border p-2 rounded mt-1"
                                        />
                                    </label>

                                    <label className="flex flex-col">
                                        Image Preview
                                        <div className="mt-2">
                                            <img
                                                src={metaForm.imageUrl || group.imageUrl || '/placeholder.png'}
                                                alt="Group Banner"
                                                className="w-48 h-28 object-cover rounded border"
                                            />
                                        </div>
                                    </label>

                                    <label className="flex flex-col">
                                        Replace Image
                                        <div className="mt-2">
                                            <UploadImages ref={uploadRef} maxImages={1} defaultImages={metaForm.imageUrl ? [metaForm.imageUrl] : (group.imageUrl ? [group.imageUrl] : [])} />
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!!metaForm.isBannerised}
                                            onChange={(e) => setMetaForm(prev => ({ ...prev, isBannerised: e.target.checked }))}
                                        />
                                        <span>Is Bannerised</span>
                                    </label>

                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => { setMetaForm({ sectionID: group.sectionID, orderIndex: group.orderIndex, imageUrl: group.imageUrl, isBannerised: !!group.isBannerised }); }}>Reset</Button>
                                        <Button className="bg-purple-600 text-white" onClick={handleUpdateDetails} disabled={loading}>Update Details</Button>
                                    </div>
                                </div>
                            ) : <div>Loading...</div>}
                        </div>

                        <div className="bg-white p-4 rounded shadow col-span-2">
                            <h3 className="font-semibold mb-2">Manage Presale Products</h3>
                            <p className="text-sm text-gray-500 mb-3">Search presale products below and toggle to select/deselect them. Use "Add Selected" to append or "Replace All" to overwrite.</p>

                            <div className="mb-4">
                                <SelectPresaleProducts onProductToggle={handleProductToggle} initialSelected={selectedProducts} />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => handleAddProducts(selectedProducts)}>Add Selected</Button>
                                <Button className="bg-red-600 text-white" onClick={() => handleReplaceProducts(selectedProducts)}>Replace All</Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default EditPresaleSectionGroup;
