import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { getFeaturedCategories, reorderCategories } from "./../../lib/api/categoryApi";
import { RiDragMove2Fill, RiArrowUpLine, RiArrowDownLine, RiSaveLine, RiRefreshLine } from "react-icons/ri";
import { toast } from 'react-toastify';

const FeaturedCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getFeaturedCategories();
            if (res.success) {
                setCategories(res.data || []);
            } else {
                toast.error(res.error || "Failed to fetch featured categories");
            }
        } catch (error) {
            console.error("Error fetching featured categories:", error);
            toast.error("Internal server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const moveItem = (index, direction) => {
        const newCategories = [...categories];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < newCategories.length) {
            const temp = newCategories[index];
            newCategories[index] = newCategories[newIndex];
            newCategories[newIndex] = temp;
            setCategories(newCategories);
        }
    };

    const handleSaveOrder = async () => {
        try {
            setSaving(true);
            const reorderedItems = categories.map((cat, index) => ({
                categoryID: cat.categoryID,
                featuredOrder: index + 1
            }));

            const res = await reorderCategories(reorderedItems);
            if (res.success) {
                toast.success("Order updated successfully");
                fetchData();
            } else {
                toast.error(res.error || "Failed to update order");
            }
        } catch (error) {
            console.error("Error saving order:", error);
            toast.error("Internal server error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout active={'admin-category-featured'}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                Featured Categories
                            </h1>
                            <p className="text-secondary-text mt-2 text-lg">
                                Manage and reorder categories shown on the homepage
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={fetchData}
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={loading}
                            >
                                <RiRefreshLine className={loading ? "animate-spin" : ""} />
                                Refresh
                            </Button>
                            <Button
                                onClick={handleSaveOrder}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
                                disabled={saving || categories.length === 0}
                            >
                                <RiSaveLine />
                                {saving ? "Saving..." : "Save Order"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-16 text-center">Order</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead className="text-center">Image</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                                                <p className="text-gray-500">Loading...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center text-gray-500">
                                            No featured categories found. Mark categories as featured from the Category List.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((cat, index) => (
                                        <TableRow key={cat.categoryID} className="hover:bg-gray-50">
                                            <TableCell className="text-center font-bold text-purple-600">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{cat.categoryName}</div>
                                                <div className="text-xs text-gray-400">{cat.categoryID}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    {cat.featuredImage ? (
                                                        <img
                                                            src={cat.featuredImage}
                                                            alt={cat.categoryName}
                                                            className="w-10 h-10 rounded-full object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => moveItem(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                                                    >
                                                        <RiArrowUpLine className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => moveItem(index, 'down')}
                                                        disabled={index === categories.length - 1}
                                                        className="p-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                                                    >
                                                        <RiArrowDownLine className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div className="mt-6 bg-purple-50 border border-purple-100 p-4 rounded-xl text-purple-700 text-sm flex items-start gap-3">
                        <RiDragMove2Fill className="w-5 h-5 mt-0.5" />
                        <p>
                            Use the arrows to reorder the categories. The order here will be reflected on the homepage "Our Latest Collections" section. 
                            Don't forget to click <strong>Save Order</strong> after making changes.
                        </p>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default FeaturedCategories;
