import React, { useEffect, useRef, useState } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import UploadImages from '@/components/ui/uploadImages';
import InputUi from '@/components/ui/inputui';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';
import { 
    getCustomTabbedCategories, 
    upsertCustomTabbedCategory, 
    deleteCustomTabbedCategory 
} from '../../lib/api/customTabbedCategoryApi';
import { RiRefreshLine, RiDeleteBinLine, RiImageLine } from 'react-icons/ri';

const ManageCustomTabbedCategories = () => {
    const imageRef = useRef();
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [tabbedCategories, setTabbedCategories] = useState([]);
    const [form, setForm] = useState({
        categoryID: '',
        sortOrder: '',
        isActive: true,
    });

    const loadCategories = async () => {
        try {
            const res = await axiosInstance.get('/categories/all-category');
            const rows = res.data?.data || res.data?.categories || [];
            setAvailableCategories(rows);
        } catch (error) {
            console.error('Failed to load categories', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchTabbedCategories = async () => {
        setListLoading(true);
        try {
            const data = await getCustomTabbedCategories();
            setTabbedCategories(data || []);
        } catch (error) {
            console.error('Error fetching tabbed categories', error);
            toast.error('Failed to fetch tabbed categories');
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
        fetchTabbedCategories();
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
                sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
                isActive: form.isActive ? 1 : 0,
            };

            const result = await upsertCustomTabbedCategory(payload);
            if (!result.success) {
                toast.error(result.message || 'Failed to save tabbed category');
                return;
            }

            toast.success('Custom tabbed category saved');
            setForm({ categoryID: '', sortOrder: '', isActive: true });
            imageRef.current?.reset();
            fetchTabbedCategories();
        } catch (error) {
            console.error('Error saving tabbed category', error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this category from the tabbed section?')) return;
        try {
            await deleteCustomTabbedCategory(id);
            toast.success('Removed successfully');
            fetchTabbedCategories();
        } catch (error) {
            console.error('Error deleting', error);
            toast.error('Failed to remove');
        }
    };

    return (
        <Layout active={'admin-custom-tabbed-categories'} title={'Manage Custom Tabbed Categories'}>
            <div className="flex flex-col gap-8 min-h-screen bg-slate-50 p-4 md:p-8">
                
                {/* 1. Add/Select Category Section */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                    <div className="lg:col-span-4">
                        <Container label="1. Select Category & Config" gap={4}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
                                    <select
                                        className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputUi
                                        label="Sort Order"
                                        type="number"
                                        value={form.sortOrder}
                                        datafunction={(e) =>
                                            setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                                        }
                                        placeholder="0"
                                    />
                                    <div className="flex items-center gap-2 pt-8">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={form.isActive}
                                            onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Container label="Tab Image" gap={3}>
                            <UploadImages ref={imageRef} />
                        </Container>
                        <button
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Add to Tabbed Section'}
                        </button>
                    </div>
                </div>

                {/* 2. List Tabbed Categories Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">2. List Tabbed Categories</h2>
                            <p className="text-sm text-gray-500">Categories that will appear in the tabbed product section</p>
                        </div>
                        <button
                            onClick={fetchTabbedCategories}
                            disabled={listLoading}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            <RiRefreshLine className={`w-5 h-5 text-gray-600 ${listLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {listLoading ? (
                            <div className="p-12 text-center text-gray-400">
                                <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                                <p>Loading categories...</p>
                            </div>
                        ) : tabbedCategories.length === 0 ? (
                            <div className="p-16 text-center text-gray-400">
                                <RiImageLine className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <p className="text-lg font-medium">No categories added yet</p>
                                <p className="text-sm">Select a category and image above to get started</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Tab Image</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Sort Order</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tabbedCategories.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.categoryName}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{item.categoryName}</span>
                                                    <span className="text-xs text-gray-400">ID: {item.categoryID}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {item.sortOrder}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <RiDeleteBinLine className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ManageCustomTabbedCategories;
