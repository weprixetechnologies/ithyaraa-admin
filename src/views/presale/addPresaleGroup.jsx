import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import axiosInstance from '../../lib/axiosInstance'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import Layout from 'src/layout'
import { searchPresaleProducts } from '../../lib/api/presaleProductsApi'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MdSearch, MdCalendarToday, MdImage, MdDiscount, MdSettings, MdShoppingBag, MdCheckCircle } from 'react-icons/md'

const AddPresaleGroup = () => {
    const bannerRef = useRef();
    const featuredRef = useRef();

    const [group, setGroup] = useState({
        status: 'upcoming',
        showOnHomepage: true,
        isFeatured: false,
        displayOrder: 0
    })
    const [presaleProducts, setPresaleProducts] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)

    const searchProducts = useCallback(async (term) => {
        // Don't search if term is empty
        if (!term || term.trim() === '') {
            setPresaleProducts([]);
            return;
        }

        setSearchLoading(true);
        try {
            const result = await searchPresaleProducts(term);
            if (result.success) {
                setPresaleProducts(result.data || []);
            } else {
                console.error('Search failed:', result.message);
                setPresaleProducts([]);
            }
        } catch (error) {
            console.error('Error searching presale products:', error);
            toast.error(error.response?.data?.message || 'Failed to search products');
            setPresaleProducts([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300); // Debounce search by 300ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchProducts]);

    const updateFunction = (data, name) => {
        setGroup(prev => ({
            ...prev,
            [name]: data.target.value
        }));
    };

    const handleUpload = async () => {
        try {
            const bannerImages = await bannerRef.current?.uploadImageFunction();
            const featuredImages = await featuredRef.current?.uploadImageFunction();

            const fullGroupData = {
                ...group,
                bannerImage: bannerImages,
                featuredImage: featuredImages,
                productIDs: selectedProducts
            };

            const { data: result } = await axiosInstance.post(
                '/admin/presale-groups/add',
                fullGroupData
            );

            if (result.success) {
                toast.success('Pre-Sale Group Created Successfully!');
                // Reset form
                setGroup({
                    status: 'upcoming',
                    showOnHomepage: true,
                    isFeatured: false,
                    displayOrder: 0
                });
                setSelectedProducts([]);
            }
        } catch (error) {
            console.error('Error creating presale group:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to create pre-sale group');
        }
    };

    return (
        <Layout active={'admin-presale-group-add'} title={'Create Pre-Sale Group'}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create Pre-Sale Group</h1>
                    <p className="text-gray-600">Set up a new presale group with products, discounts, and display settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side (2 columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MdShoppingBag className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                                    <InputUi
                                        placeholder="Enter group name"
                                        datafunction={(e) => updateFunction(e, 'groupName')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <InputUi
                                        isInput={false}
                                        placeholder="Enter group description"
                                        datafunction={(e) => updateFunction(e, 'description')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pre-Sale Dates Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MdCalendarToday className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Pre-Sale Dates</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <InputUi
                                        type="datetime-local"
                                        datafunction={(e) => updateFunction(e, 'startDate')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <InputUi
                                        type="datetime-local"
                                        datafunction={(e) => updateFunction(e, 'endDate')}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                                    <InputUi
                                        type="date"
                                        datafunction={(e) => updateFunction(e, 'expectedDeliveryDate')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Discount Settings Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MdDiscount className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Discount Settings</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                                    <Select
                                        onValueChange={(value) => setGroup(prev => ({ ...prev, groupDiscountType: value }))}
                                        value={group.groupDiscountType || ''}
                                    >
                                        <SelectTrigger className="w-full h-11 border-gray-300 focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="flat">Flat</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Discount Value</label>
                                    <InputUi
                                        type="number"
                                        placeholder="Enter discount value"
                                        datafunction={(e) => updateFunction(e, 'groupDiscountValue')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird Discount (%)</label>
                                    <InputUi
                                        type="number"
                                        placeholder="Enter early bird discount"
                                        datafunction={(e) => updateFunction(e, 'earlyBirdDiscount')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird End Date</label>
                                    <InputUi
                                        type="datetime-local"
                                        datafunction={(e) => updateFunction(e, 'earlyBirdEndDate')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Display Settings Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <MdSettings className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Display Settings</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <Select
                                        onValueChange={(value) => setGroup(prev => ({ ...prev, status: value }))}
                                        value={group.status}
                                    >
                                        <SelectTrigger className="w-full h-11 border-gray-300 focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                    <InputUi
                                        type="number"
                                        value={group.displayOrder || 0}
                                        placeholder="Display order"
                                        datafunction={(e) => updateFunction(e, 'displayOrder')}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="showOnHomepage"
                                            checked={group.showOnHomepage}
                                            onChange={(e) => setGroup(prev => ({ ...prev, showOnHomepage: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        />
                                        <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                            Show on Homepage
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="isFeatured"
                                            checked={group.isFeatured}
                                            onChange={(e) => setGroup(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        />
                                        <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                            Featured
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Side (1 column) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Images Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                    <MdImage className="w-5 h-5 text-pink-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Banner Image</label>
                                    <UploadImages ref={bannerRef} maxImages={1} setProducts={setGroup} products={group} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Featured Image</label>
                                    <UploadImages ref={featuredRef} maxImages={1} setProducts={setGroup} products={group} />
                                </div>
                            </div>
                        </div>

                        {/* Products Selection Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <MdShoppingBag className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MdSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar" style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#cbd5e1 #f1f5f9'
                                }}>
                                    {searchLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-2 text-sm text-gray-500">Searching...</span>
                                        </div>
                                    ) : presaleProducts.length === 0 && !searchLoading ? (
                                        <div className="text-center py-8 text-sm text-gray-500">
                                            {searchTerm ? (
                                                <div>
                                                    <p className="font-medium">No products found</p>
                                                    <p className="text-xs mt-1">Try a different search term</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <MdSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                    <p className="font-medium">Start typing to search</p>
                                                    <p className="text-xs mt-1">Search by name or ID</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        presaleProducts.map(product => (
                                            <div
                                                key={product.presaleProductID}
                                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${selectedProducts.includes(product.presaleProductID)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => {
                                                    if (selectedProducts.includes(product.presaleProductID)) {
                                                        setSelectedProducts(prev => prev.filter(id => id !== product.presaleProductID));
                                                    } else {
                                                        setSelectedProducts(prev => [...prev, product.presaleProductID]);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.presaleProductID)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        if (e.target.checked) {
                                                            setSelectedProducts(prev => [...prev, product.presaleProductID]);
                                                        } else {
                                                            setSelectedProducts(prev => prev.filter(id => id !== product.presaleProductID));
                                                        }
                                                    }}
                                                    className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-1">{product.presaleProductID}</p>
                                                </div>
                                                {selectedProducts.includes(product.presaleProductID) && (
                                                    <MdCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedProducts.length > 0 && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Selected</span>
                                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleUpload}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <MdCheckCircle className="w-5 h-5" />
                            Create Pre-Sale Group
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddPresaleGroup

