import React, { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Layout from 'src/layout';
import { getAllFeaturedCoupons, createFeaturedCoupon, updateFeaturedCoupon, deleteFeaturedCoupon } from '../../lib/api/featuredCouponsApi';
import { getFilteredCoupons } from '../../lib/api/couponsApi';
import { toast } from 'react-toastify';
import {
    RiStarLine,
    RiAddLine,
    RiDeleteBinLine,
    RiRefreshLine,
    RiCheckLine,
    RiCloseLine,
    RiCouponLine
} from 'react-icons/ri';

const FeaturedCoupons = () => {
    const [featuredCoupons, setFeaturedCoupons] = useState([]);
    const [allCoupons, setAllCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    // Form state
    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [customCouponCode, setCustomCouponCode] = useState('');
    const [popupImage, setPopupImage] = useState('');
    const [iconImage, setIconImage] = useState('');

    const fetchFeatured = async () => {
        setLoading(true);
        try {
            const res = await getAllFeaturedCoupons();
            if (res.success) {
                setFeaturedCoupons(res.data || []);
            } else {
                toast.error(res.error || 'Failed to fetch featured coupons');
            }
        } catch (err) {
            console.error('Error fetching featured coupons:', err);
            toast.error('Failed to load featured coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCoupons = async () => {
        try {
            const res = await getFilteredCoupons({ page: 1, limit: 100 });
            if (res.success) {
                setAllCoupons(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching system coupons:', err);
        }
    };

    useEffect(() => {
        fetchFeatured();
        fetchAllCoupons();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const codeToUse = selectedCouponCode === 'custom' ? customCouponCode.trim() : selectedCouponCode;

        if (!codeToUse) {
            toast.error('Please select or enter a coupon code');
            return;
        }

        setAdding(true);
        try {
            const res = await createFeaturedCoupon({
                couponCode: codeToUse,
                popupImage: popupImage.trim(),
                iconImage: iconImage.trim()
            });

            if (res.success) {
                toast.success('Featured coupon added successfully!');
                setSelectedCouponCode('');
                setCustomCouponCode('');
                setPopupImage('');
                setIconImage('');
                fetchFeatured();
            } else {
                toast.error(res.error || 'Failed to add featured coupon');
            }
        } catch (err) {
            toast.error('Error adding featured coupon');
        } finally {
            setAdding(false);
        }
    };

    const handleToggleActive = async (item) => {
        try {
            const updatedStatus = !item.isActive;
            const res = await updateFeaturedCoupon(item.id, { isActive: updatedStatus });
            if (res.success) {
                toast.success(`Coupon ${item.couponCode} is now ${updatedStatus ? 'Active' : 'Inactive'}`);
                fetchFeatured();
            } else {
                toast.error(res.error || 'Failed to update status');
            }
        } catch (err) {
            toast.error('Error updating coupon status');
        }
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`Are you sure you want to remove "${code}" from floating coupons?`)) return;

        try {
            const res = await deleteFeaturedCoupon(id);
            if (res.success) {
                toast.success('Featured coupon deleted');
                fetchFeatured();
            } else {
                toast.error(res.error || 'Failed to delete featured coupon');
            }
        } catch (err) {
            toast.error('Error deleting featured coupon');
        }
    };

    return (
        <Layout>
            <Container className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] border border-[#262626] p-6 rounded-xl">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <RiStarLine className="text-yellow-400" /> Floating & Featured Homepage Coupons
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage coupons displayed in the floating popup modal on the homepage bottom-right.
                        </p>
                    </div>
                    <Button
                        onClick={fetchFeatured}
                        disabled={loading}
                        className="bg-[#262626] hover:bg-[#333] text-white flex items-center gap-2"
                    >
                        <RiRefreshLine className={loading ? 'animate-spin' : ''} /> Refresh
                    </Button>
                </div>

                {/* Add Featured Coupon Form */}
                <div className="bg-[#141414] border border-[#262626] p-6 rounded-xl space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <RiAddLine className="text-primary" /> Add Coupon to Floating Modal
                    </h2>

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Select Coupon Code</label>
                            <select
                                value={selectedCouponCode}
                                onChange={(e) => setSelectedCouponCode(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg p-2.5 focus:border-primary focus:outline-none"
                            >
                                <option value="">-- Choose Existing Coupon --</option>
                                {allCoupons.map((c) => (
                                    <option key={c.couponID || c.couponCode} value={c.couponCode}>
                                        {c.couponCode} ({c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                                    </option>
                                ))}
                                <option value="custom">+ Type Custom Code</option>
                            </select>
                        </div>

                        {selectedCouponCode === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Custom Coupon Code</label>
                                <InputUi
                                    type="text"
                                    placeholder="e.g. WELCOME50"
                                    value={customCouponCode}
                                    onChange={(e) => setCustomCouponCode(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Banner / Popup Image (Optional)</label>
                            <InputUi
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                value={popupImage}
                                onChange={(e) => setPopupImage(e.target.value)}
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={adding || !selectedCouponCode}
                                className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                            >
                                <RiAddLine /> {adding ? 'Adding...' : 'Add Featured Coupon'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Coupons Table */}
                <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#1a1a1a]">
                            <TableRow className="border-b border-[#262626]">
                                <TableHead className="text-gray-400">Coupon Code</TableHead>
                                <TableHead className="text-gray-400">Discount</TableHead>
                                <TableHead className="text-gray-400">Min. Spend</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                                        Loading featured coupons...
                                    </TableCell>
                                </TableRow>
                            ) : featuredCoupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                                        No featured coupons found. Add one above to display on homepage modal!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                featuredCoupons.map((item) => (
                                    <TableRow key={item.id} className="border-b border-[#262626] hover:bg-[#1a1a1a]/50">
                                        <TableCell className="font-semibold text-white flex items-center gap-2">
                                            <RiCouponLine className="text-primary" /> {item.couponCode}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {item.discountValue ? (
                                                <span className="bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    {item.discountType === 'percent' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {item.minOrderValue ? `₹${item.minOrderValue}` : 'No Min'}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleToggleActive(item)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                                                    item.isActive
                                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                                                }`}
                                            >
                                                {item.isActive ? <RiCheckLine /> : <RiCloseLine />}
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                onClick={() => handleDelete(item.id, item.couponCode)}
                                                className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 p-2 text-sm rounded-lg"
                                            >
                                                <RiDeleteBinLine />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Container>
        </Layout>
    );
};

export default FeaturedCoupons;
