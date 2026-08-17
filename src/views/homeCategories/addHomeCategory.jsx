import React, { useEffect, useRef, useState } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import UploadImages from '@/components/ui/uploadImages';
import InputUi from '@/components/ui/inputui';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';
import { createHomeCategoryTile } from '../../lib/api/homeCategoryApi';

const AddHomeCategory = () => {
    const imageRef = useRef();
    const [loading, setLoading] = useState(false);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [form, setForm] = useState({
        categoryID: '',
        sortOrder: '',
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await axiosInstance.get('/categories/all-category');
                const rows = res.data?.data || res.data?.categories || [];
                setAvailableCategories(rows);
            } catch (error) {
                console.error('Failed to load categories for home tiles', error);
                toast.error('Failed to load categories');
            }
        };
        loadCategories();
    }, []);

    const handleSubmit = async () => {
        if (!form.categoryID) {
            toast.error('Please select a category');
            return;
        }
        try {
            setLoading(true);
            const upload = await imageRef.current?.uploadImageFunction();
            if (!upload || !upload.length) {
                toast.error('Image is required');
                setLoading(false);
                return;
            }

            const payload = {
                categoryID: form.categoryID,
                imageUrl: upload[0].imgUrl,
                sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
            };

            const result = await createHomeCategoryTile(payload);
            if (!result.success) {
                toast.error(result.message || result.error || 'Failed to save home category');
                return;
            }

            toast.success('Home category saved');
            setForm({ categoryID: '', sortOrder: '' });
            imageRef.current?.reset();
        } catch (error) {
            console.error('Error saving home category', error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout active={'admin-home-categories-add'} title={'Add Home Categories'}>
            <div className="grid grid-cols-6 gap-4">
                <div className="col-span-4">
                    <Container label="Select Category" gap={3}>
                        <label className="text-sm font-medium mb-1 block">Category</label>
                        <select
                            className="border rounded px-3 py-2 w-full text-sm"
                            value={form.categoryID}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, categoryID: e.target.value }))
                            }
                        >
                            <option value="">Select category</option>
                            {availableCategories.map((cat) => (
                                <option key={cat.categoryID} value={cat.categoryID}>
                                    {cat.categoryName}
                                </option>
                            ))}
                        </select>
                        <InputUi
                            label="Sort Order (optional)"
                            value={form.sortOrder}
                            datafunction={(e) =>
                                setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                            }
                        />
                    </Container>
                </div>

                <div className="col-span-2">
                    <Container label="Category Image" gap={3}>
                        <UploadImages ref={imageRef} />
                    </Container>
                    <div className="flex justify-end mt-4">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Home Category'}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AddHomeCategory;

