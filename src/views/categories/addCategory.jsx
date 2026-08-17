import React, { useRef, useState, useEffect } from 'react';
import Layout from 'src/layout';
import InputUi from '@/components/ui/inputui';
import Container from '@/components/ui/container';
import UploadImages from '@/components/ui/uploadImages';
import { uploadCategory } from './../../lib/api/categoryApi';
import { toast } from 'react-toastify';

const AddCategory = () => {
    const categoryImageRef = useRef();
    const categoryBannerRef = useRef();
    const [loading, setLoading] = useState(false);

    const [categoryData, setCategoryData] = useState({
        name: '',
        slug: '',
    });

    // 🔁 Auto-generate slug from name
    useEffect(() => {
        const generatedSlug = categoryData.name
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]/g, '')   // remove special characters
            .replace(/\s+/g, '_');     // replace spaces with underscores

        setCategoryData((prev) => ({ ...prev, slug: generatedSlug }));
    }, [categoryData.name]);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const imageUpload = await categoryImageRef?.current?.uploadImageFunction();
            const bannerUpload = await categoryBannerRef?.current?.uploadImageFunction();

            if (!imageUpload.length) {
                toast.error('Featured image is required');
                setLoading(false);
                return;
            }

            const payload = {
                categoryName: categoryData.name,
                slug: categoryData.slug,
                featuredImage: imageUpload[0].imgUrl,
                categoryBanner: bannerUpload?.[0]?.imgUrl || null,
            };

            const res = await uploadCategory(payload);

            if (res.success) {
                toast.success('Category uploaded successfully');
                setCategoryData({ name: '', slug: '' });
                categoryImageRef.current?.reset();
                categoryBannerRef.current?.reset();
            } else {
                toast.error(res.error || 'Failed to upload category');
            }
        } catch (error) {
            toast.error('Something went wrong!');
            console.error('Upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout active={'admin-category-add'} title={'Add Category'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4">
                    <div className="flex flex-col gap-3">
                        <Container label={'Category Information'} gap={3}>
                            <InputUi
                                label="Enter Category Name"
                                value={categoryData.name}
                                datafunction={(e) =>
                                    setCategoryData((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                            <InputUi
                                label="Generated Slug"
                                value={categoryData.slug}
                                datafunction={() => { }}
                                disabled={true}
                            />
                        </Container>

                        <Container label={'Products Added'}>
                            <div className="min-h-52 flex-center">
                                <p>REGISTER CATEGORY TO GET VIEW OF ADDED PRODUCTS</p>
                            </div>
                        </Container>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex flex-col gap-3">
                        <Container label={'Featured Image'} gap={3}>
                            <UploadImages ref={categoryImageRef} />
                        </Container>

                        <Container label={'Banner Image'} gap={3}>
                            <UploadImages ref={categoryBannerRef} />
                        </Container>

                        <div className="flex justify-end">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-fit"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Category'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AddCategory;
