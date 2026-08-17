import React, { useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import UploadImages from '@/components/ui/uploadImages';
import { createCustomImageSection } from "../../lib/api/customImageSectionsApi";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddCustomImageSection = () => {
    const uploadRef = useRef(null);
    const [form, setForm] = useState({ sectionID: '', title: '', layoutID: '', isBannerised: false });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let imageUrl = null;
            if (uploadRef.current?.uploadImageFunction) {
                const uploaded = await uploadRef.current.uploadImageFunction();
                if (uploaded && uploaded.length > 0) imageUrl = uploaded[0].imgUrl;
            }

            const res = await createCustomImageSection({
                sectionID: form.sectionID || null,
                title: form.title || null,
                layoutID: form.layoutID || null,
                imageUrl,
                isBannerised: !!form.isBannerised
            });
            if (res.success) {
                toast.success('Section created');
                navigate('/custom-image-sections/list');
            } else toast.error(res.message || 'Failed');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create');
        } finally { setLoading(false); }
    };

    return (
        <Layout active={"admin-custom-image-sections"}>
            <div className="min-h-screen p-6 bg-background">
                <Container>
                    <div className="max-w-2xl bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Create Custom Image Section</h2>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <label className="flex flex-col">Section ID<input className="border p-2 rounded mt-1" value={form.sectionID} onChange={e => setForm({ ...form, sectionID: e.target.value })} /></label>
                            <label className="flex flex-col">Title<input className="border p-2 rounded mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
                            <label className="flex flex-col">Layout ID<input className="border p-2 rounded mt-1" value={form.layoutID} onChange={e => setForm({ ...form, layoutID: e.target.value })} /></label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isBannerised} onChange={e => setForm({ ...form, isBannerised: e.target.checked })} /> Is Bannerised</label>
                            <label className="flex flex-col">Upload Image<UploadImages ref={uploadRef} maxImages={1} /></label>
                            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => navigate('/custom-image-sections/list')}>Cancel</Button><Button className="bg-purple-600 text-white" type="submit" disabled={loading}>Create</Button></div>
                        </form>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default AddCustomImageSection;

