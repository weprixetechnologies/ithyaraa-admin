import React, { useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { createComboSectionGroup } from "../../lib/api/comboSectionGroupsApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UploadImages from '@/components/ui/uploadImages';

const AddComboSectionGroup = () => {
    const [form, setForm] = useState({ sectionID: "", title: "", orderIndex: 0, imageUrl: "", isBannerised: false });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const uploadRef = useRef(null);
    const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.sectionID) return toast.error("sectionID is required");
        try {
            setLoading(true);
            let imageUrl = null;
            if (uploadRef.current?.uploadImageFunction) {
                const uploaded = await uploadRef.current.uploadImageFunction();
                if (uploaded && uploaded.length > 0 && uploaded[0].imgUrl) {
                    imageUrl = uploaded[0].imgUrl;
                }
            }

            const res = await createComboSectionGroup({
                sectionID: parseInt(form.sectionID, 10),
                title: form.title || null,
                orderIndex: parseInt(form.orderIndex, 10) || 0,
                imageUrl: imageUrl,
                isBannerised: !!form.isBannerised
            });
            if (res.success) {
                toast.success("Combo group created");
                navigate("/combo-groups/list");
            } else {
                toast.error(res.message || res.error || "Failed to create group");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout active={"admin-combo-groups"} title={"Create Combo Group"}>
            <div className="min-h-screen bg-background p-6">
                <Container>
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Create Combo Group</h2>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <label className="flex flex-col">
                                Section ID
                                <input type="number" value={form.sectionID} onChange={(e) => onChange('sectionID', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <label className="flex flex-col">
                                Title
                                <input type="text" value={form.title} onChange={(e) => onChange('title', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <label className="flex flex-col">
                                Order Index
                                <input type="number" value={form.orderIndex} onChange={(e) => onChange('orderIndex', e.target.value)} className="border p-2 rounded mt-1" />
                            </label>
                            <label className="flex flex-col">
                                Upload Image
                                <div className="mt-2">
                                    <UploadImages ref={uploadRef} maxImages={1} />
                                </div>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.isBannerised} onChange={(e) => onChange('isBannerised', e.target.checked)} />
                                <span>Is Bannerised</span>
                            </label>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => navigate("/combo-groups/list")}>Cancel</Button>
                                <Button type="submit" className="bg-purple-600 text-white" disabled={loading}>Create</Button>
                            </div>
                        </form>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default AddComboSectionGroup;
