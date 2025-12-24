import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
    getPaginatedProducts,
    getProductCount,
    deleteProduct,
    bulkDeleteProducts,
    bulkSaleUpdate,
    bulkAssignSection,
    bulkRemoveSection
} from './../../lib/api/productsApi';
import InputUi from '@/components/ui/inputui';
import { toast } from 'react-toastify';

const ListProducts = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [openActionFor, setOpenActionFor] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        discountType: '',
        discountValue: '',
        updateSalePrice: false,
        sectionid: ''
    });

    const [filters, setFilters] = useState({
        name: '',
        productID: '',
        type: '',
        categoryID: '',
        categoryName: ''
    });

    const limit = 10;

    const handleChange = (e, name) => {
        setFilters({ ...filters, [name]: e.target.value });
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map((p) => p.productID));
        }
    };

    const toggleSelectOne = (productID) => {
        setSelectedProducts((prev) =>
            prev.includes(productID) ? prev.filter((id) => id !== productID) : [...prev, productID]
        );
    };

    const openBulkDialog = (action) => {
        if (!selectedProducts.length) {
            toast.warning('Select at least one product');
            return;
        }
        setBulkAction(action);
        setBulkForm({
            discountType: '',
            discountValue: '',
            updateSalePrice: false,
            sectionid: ''
        });
        setBulkDialogOpen(true);
    };

    const closeBulkDialog = () => {
        setBulkDialogOpen(false);
        setBulkAction('');
    };

    const handleBulkSubmit = async () => {
        try {
            if (!selectedProducts.length) {
                toast.warning('Select at least one product');
                return;
            }

            if (bulkAction === 'delete') {
                const res = await bulkDeleteProducts(selectedProducts);
                if (res.success) toast.success('Selected products deleted');
                else toast.error(res.message || 'Bulk delete failed');
            } else if (bulkAction === 'sale') {
                const { discountType, discountValue, updateSalePrice } = bulkForm;
                if (!discountType || discountValue === '') {
                    toast.error('Discount type and value are required');
                    return;
                }
                const res = await bulkSaleUpdate({
                    productIDs: selectedProducts,
                    discountType,
                    discountValue: Number(discountValue),
                    updateSalePrice
                });
                if (res.success) toast.success('Bulk sale updated');
                else toast.error(res.message || 'Bulk sale update failed');
            } else if (bulkAction === 'assign-section') {
                const { sectionid } = bulkForm;
                if (!sectionid) {
                    toast.error('Section ID is required');
                    return;
                }
                const res = await bulkAssignSection({
                    productIDs: selectedProducts,
                    sectionid
                });
                if (res.success) toast.success('Section assigned to selected products');
                else toast.error(res.message || 'Bulk assign section failed');
            } else if (bulkAction === 'remove-section') {
                const res = await bulkRemoveSection({
                    productIDs: selectedProducts
                });
                if (res.success) toast.success('Section removed from selected products');
                else toast.error(res.message || 'Bulk remove section failed');
            }

            await fetchProductCount();
            await fetchProducts();
            setSelectedProducts([]);
            closeBulkDialog();
        } catch (err) {
            console.error('Bulk action error:', err);
            toast.error('Bulk action failed');
        }
    };

    const fetchProductCount = async () => {
        try {
            const { totalItems } = await getProductCount(filters);
            console.log(totalItems);

            setTotalPages(Math.ceil(totalItems / limit));
        } catch (error) {
            console.error('Error counting products:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getPaginatedProducts({
                page,
                limit,
                filters
            });
            console.log(response.data);

            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setPage(1);
        await fetchProductCount();
        await fetchProducts();
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Handle delete product
    const handleDeleteProduct = async (productID) => {
        try {
            setDeleteLoading(true);
            const response = await deleteProduct(productID);

            if (response.success) {
                // toast.success('Product deleted successfully');
                // Refresh the product list
                await fetchProductCount();
                await fetchProducts();
            } else {
                toast.error(response.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error deleting product');
        } finally {
            setDeleteLoading(false);
            setProductToDelete(null);
        }
    };

    // Show delete confirmation
    const confirmDelete = (product) => {
        setProductToDelete(product);
    };

    // Cancel delete
    const cancelDelete = () => {
        setProductToDelete(null);
    };

    // Get navigation route based on product type
    const getProductRoute = (product) => {
        if (product.type === 'customproduct') {
            return `/custom-product/edit/${product.productID}`;
        } else if (product.type == 'Make_combo') {
            return `/make-combo/detail/${product.productID}`;
        } else if (product.type === 'combo') {
            return `/combo/detail/${product.productID}`;
        } else {
            return `/products/details/${product.productID}`;
        }
    };

    // Initial load and when filters/page change
    useEffect(() => {
        const loadData = async () => {
            await fetchProductCount();
            await fetchProducts();
        };
        loadData();
    }, [page, filters]); // Add filters to dependency array if you want real-time filtering

    return (
        <Layout title="Product List" active="admin-products-list">
            <Container containerclass="bg-transparent">
                {/* 🔍 Filters */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex gap-4 items-center">
                        <InputUi placeholder={'Enter Product Name'} datafunction={(e) => handleChange(e, 'name')} />
                        <InputUi placeholder={'Enter Product ID'} datafunction={(e) => handleChange(e, 'productID')} />
                        <InputUi placeholder={'Enter Product Type'} datafunction={(e) => handleChange(e, 'type')} />
                        <InputUi placeholder={'Enter Category ID'} datafunction={(e) => handleChange(e, 'categoryID')} />
                        <InputUi placeholder={'Enter Category Name'} datafunction={(e) => handleChange(e, 'categoryName')} />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-4 py-1 rounded"
                        >
                            Search
                        </button>
                    </div>

                    {/* ✨ Bulk actions bar */}
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium">Bulk Actions</span>
                            <span className="text-gray-400">|</span>
                            <span>
                                Selected:{' '}
                                <span className="font-semibold text-gray-900">
                                    {selectedProducts.length}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => openBulkDialog('delete')}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                                BULK DELETE
                            </button>
                            <button
                                onClick={() => openBulkDialog('sale')}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                            >
                                BULK SALE UPDATE
                            </button>
                            <button
                                onClick={() => openBulkDialog('assign-section')}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            >
                                BULK ASSIGN SECTION
                            </button>
                            <button
                                onClick={() => openBulkDialog('remove-section')}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            >
                                BULK REMOVE SECTION
                            </button>
                        </div>
                    </div>
                </div>

                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] capitalize">
                            <TableHead className="pl-5">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.length === products.length && products.length > 0}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Product Data</TableHead>
                            <TableHead className="text-center">Price</TableHead>
                            <TableHead className="text-center">Type</TableHead>
                            <TableHead className="text-center">Discount Type</TableHead>
                            <TableHead className="text-center">Section ID</TableHead>
                            <TableHead className="text-center">Created On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((product) => {
                            let imgUrl = '';
                            try {
                                const images = JSON.parse(product.featuredImage || '[]');
                                imgUrl = images?.[0]?.imgUrl || '';
                            } catch (e) {
                                imgUrl = '';
                            }

                            return (
                                <TableRow className="bg-white" key={product.productID}>
                                    <TableCell className="rounded-l-lg pl-5">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.productID)}
                                            onChange={() => toggleSelectOne(product.productID)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </TableCell>
                                    <TableCell>{product.productID}</TableCell>
                                    <TableCell className="text-center py-5 min-w-[200px]">
                                        <div className="flex gap-2 justify-start items-center">
                                            <img
                                                src={imgUrl}
                                                alt=""
                                                className="h-[35px] w-[35px] rounded-full border object-cover"
                                            />
                                            <div className="flex flex-col justify-start items-start text-right">
                                                <p className="text-left font-medium max-w-[200px] hover:text-dark-secondary-text cursor-pointer">
                                                    {product.name}
                                                </p>
                                                {/* <p className="font-light text-secondary-text max-w-[350px] truncate hover:text-dark-secondary-text cursor-pointer">
                                                    {product.productID}
                                                </p> */}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {product.salePrice}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                {product.regularPrice}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center capitalize">
                                        {(() => {
                                            const t = String(product.type || '').toLowerCase();
                                            if (t === 'customproduct') return 'Custom';
                                            if (t === 'make_combo') return 'MC';
                                            if (t === 'combo') return 'combo';
                                            if (t === 'variable') return 'variable';
                                            return product.type || '-';
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {product.discountType && product.discountValue ? (
                                            <>
                                                {String(product.discountType).toLowerCase() === 'percentage'
                                                    ? `${product.discountValue}%`
                                                    : `${product.discountValue}/-`}
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {product.sectionid || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5 relative">
                                        <div className="inline-flex items-center justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenActionFor(
                                                        openActionFor === product.productID
                                                            ? null
                                                            : product.productID
                                                    )
                                                }
                                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 transition"
                                            >
                                                Actions
                                            </button>
                                            {openActionFor === product.productID && (
                                                <div className="absolute right-5 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-left z-20">
                                                    <button
                                                        type="button"
                                                        className="w-full px-3 py-2 text-xs text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                                                        onClick={() => {
                                                            setOpenActionFor(null);
                                                            navigate(getProductRoute(product));
                                                        }}
                                                    >
                                                        <MdEdit size={14} />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        onClick={() => {
                                                            setOpenActionFor(null);
                                                            confirmDelete(product);
                                                        }}
                                                        disabled={deleteLoading}
                                                    >
                                                        <MdDelete size={14} />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {/* 🔄 Pagination */}
                <div className="flex justify-center mt-6 gap-4">
                    <button
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || loading}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </Container>

            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the product "{productToDelete.name}"?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(productToDelete.productID)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Modal */}
            {bulkDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {bulkAction === 'delete' && 'Bulk Delete Products'}
                            {bulkAction === 'sale' && 'Bulk Sale Update'}
                            {bulkAction === 'assign-section' && 'Bulk Assign Section'}
                            {bulkAction === 'remove-section' && 'Bulk Remove Section'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedProducts.length} product(s) selected.
                        </p>

                        {bulkAction === 'sale' && (
                            <div className="space-y-3 mb-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Discount Type
                                    </label>
                                    <select
                                        className="border rounded-lg px-3 py-2 text-sm"
                                        value={bulkForm.discountType}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                discountType: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="">Select type</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Discount Value
                                    </label>
                                    <input
                                        type="number"
                                        className="border rounded-lg px-3 py-2 text-sm"
                                        value={bulkForm.discountValue}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                discountValue: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={bulkForm.updateSalePrice}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                updateSalePrice: e.target.checked
                                            }))
                                        }
                                    />
                                    <span>Also recalculate sale price from regular price</span>
                                </label>
                            </div>
                        )}

                        {bulkAction === 'assign-section' && (
                            <div className="space-y-3 mb-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Section ID
                                    </label>
                                    <input
                                        type="text"
                                        className="border rounded-lg px-3 py-2 text-sm"
                                        value={bulkForm.sectionid}
                                        onChange={(e) =>
                                            setBulkForm((prev) => ({
                                                ...prev,
                                                sectionid: e.target.value
                                            }))
                                        }
                                        placeholder="e.g. HOME_HERO, BEST_SELLERS"
                                    />
                                </div>
                            </div>
                        )}

                        {(bulkAction === 'delete' || bulkAction === 'remove-section') && (
                            <p className="text-sm text-red-600 mb-4">
                                This action cannot be easily undone. Proceed with caution.
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={closeBulkDialog}
                                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkSubmit}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ListProducts;