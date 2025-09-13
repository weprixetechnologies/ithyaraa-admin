import React, { useEffect, useRef, useState } from 'react';
import Layout from 'src/layout';
import InputUi from '@/components/ui/inputui';
import Container from '@/components/ui/container';
import UploadImages from '@/components/ui/uploadImages';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { getCategoryByID } from '../../lib/api/categoryApi';
import axiosInstance from '../../lib/axiosInstance';

const EditCategory = () => {
    const { categoryID } = useParams();
    const categoryImageRef = useRef();
    const categoryBannerRef = useRef();

    const [category, setCategory] = useState({
        categoryName: '',
        slug: '',
        featuredImage: [],
        categoryBanner: [],
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await getCategoryByID(categoryID);
                setCategory({
                    categoryName: res.data.categoryName,
                    slug: res.data.slug || '',
                    featuredImage: res.data.featuredImage ? [res.data.featuredImage] : [],
                    categoryBanner: res.data.categoryBanner ? [res.data.categoryBanner] : [],
                });
            } catch (err) {
                console.error('Failed to fetch category', err);
                toast.error('Failed to load category details');
            }
        };

        if (categoryID) fetchCategory();
    }, [categoryID]);

    const handleChange = (e, name) => {
        setCategory(prev => ({ ...prev, [name]: e.target.value }));
    };

   const handleSubmit = async () => {
        try {
            const [featured, banner] = await Promise.all([
                categoryImageRef.current?.uploadImageFunction(),
                categoryBannerRef.current?.uploadImageFunction()
            ]);

            const payload = {
                categoryID,
                categoryName: category.categoryName,
                slug: category.slug,
                featuredImage: featured?.[0]?.imgUrl || '',
                categoryBanner: banner?.[0]?.imgUrl || '',
            };

            const res = await axiosInstance.put(`/categories/edit/${categoryID}`, payload);
            if (res.status !== 200) {
                throw new Error(res.data?.message || 'Failed to update category');
            }
            toast.success('Category updated successfully');
        } catch (err) {
            console.error('Error updating category:', err);
            toast.error(`Update failed: ${err.message}`);
        }
    };


    return (
        <Layout title="Edit Category" active="admin-category-list">
            <div className="grid grid-cols-6 gap-5">
                <div className="col-span-4">
                    <div className="flex flex-col gap-3">
                        <Container label="Category Info" gap={3}>
                            <InputUi
                                label="Name"
                                value={category.categoryName}
                                datafunction={(e) => handleChange(e, 'categoryName')}
                            />
                            <InputUi
                                label="Slug"
                                value={category.slug}
                                datafunction={(e) => handleChange(e, 'slug')}
                            />
                        </Container>
                        <Container label={'Products Added'}>
                            <div className="min-h-52 flex-center">
                                <p>REGISTER CATEGORY TO GET VIEW OF ADDED PRODUCTS</p>
                            </div>
                        </Container>
                    </div>

                </div>
                <div className="col-span-2 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container label="Featured Image">
                            <UploadImages
                                ref={categoryImageRef}
                                defaultImages={category.featuredImage}
                                maxImages={1}
                            />
                        </Container>

                        <Container label="Banner Image / Creatives">


                            <UploadImages
                                ref={categoryBannerRef}
                                defaultImages={category.categoryBanner}
                                maxImages={1}
                            />
                        </Container>
                        <button className="primary-button" onClick={handleSubmit}>
                            Update Category
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EditCategory;
