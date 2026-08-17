
import React, { useState, useEffect } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import InputUi from "@/components/ui/inputui";
import { getSectionItem, updateSectionItem } from "src/lib/api/sectionItemsApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditSectionItem = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [itemId, setItemId] = useState('');
    const [type, setType] = useState('imagesection');
    const [order, setOrder] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getSectionItem(id);
                if (res.success) {
                    setItem(res.data);
                    setItemId(res.data.itemId || res.data.itemID || '');
                    setType(res.data.type || 'imagesection');
                    setOrder(res.data.orderIndex || res.data.order || 0);
                } else {
                    toast.error(res.message || 'Item not found');
                    navigate('/section-items/list');
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load item details');
                navigate('/section-items/list');
            }
        };
        if (id) fetch();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!itemId) {
            toast.warning('Please provide an Item ID');
            return;
        }

        try {
            setLoading(true);
            const res = await updateSectionItem(id, { id: itemId, type, order: Number(order) });
            if (res.success) {
                toast.success('Section Item updated successfully');
                navigate('/section-items/list');
            } else {
                toast.error(res.message || 'Failed to update item');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update item');
        } finally {
            setLoading(false);
        }
    };

    if (!item) {
        return (
            <Layout active={"admin-section-items-list"} title={"Edit Section Item"}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500 animate-pulse">Loading item details...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout active={"admin-section-items-list"} title={"Edit Section Item"}>
            <div className="max-w-4xl mx-auto py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Container label={"Item Configuration"}>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-semibold text-unique uppercase block mb-1">
                                        Section Type
                                    </label>
                                    <select 
                                        value={type} 
                                        onChange={e => setType(e.target.value)} 
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    >
                                        <option value="imagesection">Image Section</option>
                                        <option value="productsection">Product Section (Standard)</option>
                                        <option value="product section">Product Section (Legacy)</option>
                                        <option value="presalesection">Presale Section</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Determines how this item is rendered on the homepage.
                                    </p>
                                </div>

                                <div>
                                    <InputUi 
                                        label={"Target Item ID"}
                                        value={itemId} 
                                        datafunction={e => setItemId(e.target.value)} 
                                        placeholder="Enter the ID of the image section or product group" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        The unique identifier of the content to display.
                                    </p>
                                </div>

                                <div>
                                    <InputUi 
                                        label={"Display Order"}
                                        type="number" 
                                        value={order} 
                                        datafunction={e => setOrder(e.target.value)} 
                                        placeholder="e.g. 1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lower numbers appear first. Example: 0, 1, 2...
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/section-items/list')}
                                        className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </Container>
                    </div>

                    <div className="space-y-6">
                        <Container label={"Item Summary"}>
                            <div className="py-2 space-y-4">
                                <div className="flex flex-col items-center pb-4 border-b border-gray-100">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mb-3">
                                        {order}
                                    </div>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Position {order}
                                    </span>
                                </div>
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Record ID:</span>
                                        <span className="font-mono text-gray-800">{id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Target Type:</span>
                                        <span className="font-medium text-gray-800">{type}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Target ID:</span>
                                        <span className="font-mono text-gray-800 bg-gray-50 px-2 py-0.5 rounded">{itemId || 'None'}</span>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EditSectionItem;
