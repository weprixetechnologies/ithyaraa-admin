import React, { useEffect, useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import { Button } from '../../components/ui/button';
import axiosInstance from '../../lib/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete, MdAdd, MdDeleteOutline } from 'react-icons/md';
import { toast } from 'react-toastify';
import { bulkDeletePresaleProducts } from '../../lib/api/presaleProductsApi';

export default function ListPresaleProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/presale-products/all');
      if (data.success) {
        setRows(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching presale products:', error);
      toast.error('Failed to load presale products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (presaleProductID) => {
    if (!window.confirm('Are you sure you want to delete this presale product?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const { data } = await axiosInstance.delete(`/admin/presale-products/${presaleProductID}`);
      if (data.success) {
        toast.success('Presale product deleted successfully');
        loadProducts();
      } else {
        toast.error(data.message || 'Failed to delete presale product');
      }
    } catch (error) {
      console.error('Error deleting presale product:', error);
      toast.error('Failed to delete presale product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === rows.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(rows.map((p) => p.presaleProductID));
    }
  };

  const toggleSelectOne = (presaleProductID) => {
    setSelectedProducts((prev) =>
      prev.includes(presaleProductID) ? prev.filter((id) => id !== presaleProductID) : [...prev, presaleProductID]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select at least one product to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} presale product(s)?`)) {
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const result = await bulkDeletePresaleProducts(selectedProducts);
      if (result.success) {
        toast.success(result.message || `Successfully deleted ${result.deletedCount || selectedProducts.length} product(s)`);
        setSelectedProducts([]);
        loadProducts();
      } else {
        toast.error(result.message || 'Failed to delete presale products');
      }
    } catch (error) {
      console.error('Error bulk deleting presale products:', error);
      toast.error(error.response?.data?.message || 'Failed to bulk delete presale products');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const parseJSONSafe = (value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value || [];
  };

  return (
    <Layout title={'Pre-Sale Products'} active={'admin-presale-list'}>
      <Container containerclass="bg-transparent">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Pre-Sale Products</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your presale product listings</p>
            </div>
            <Button 
              onClick={() => navigate('/presale/products/add')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <MdAdd size={20} />
              Add Product
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 px-5 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <MdDeleteOutline className="text-red-600" size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-gray-500">Choose an action to perform</p>
              </div>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {bulkDeleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <MdDeleteOutline size={18} />
                  Delete Selected
                </>
              )}
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedProducts.length === rows.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[35%]">Product</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%]">Price</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[13%]">Start Date</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[13%]">End Date</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[12%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">Loading products...</p>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <MdAdd className="text-gray-400" size={32} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">No presale products found</p>
                          <p className="text-xs text-gray-500 mt-1">Get started by adding your first presale product</p>
                        </div>
                        <Button 
                          onClick={() => navigate('/presale/products/add')}
                          className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <MdAdd size={18} />
                          Add Product
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : rows.map((product, index) => {
                  const featuredImage = parseJSONSafe(product.featuredImage);
                  const imageUrl = featuredImage[0]?.imgUrl || '';

                  return (
                    <tr 
                      key={product.presaleProductID} 
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.presaleProductID)}
                          onChange={() => toggleSelectOne(product.presaleProductID)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {imageUrl ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-200">
                              <img 
                                src={imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="hidden w-full h-full items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={product.name || '-'}>
                              {product.name || '-'}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5 truncate" title={product.presaleProductID}>{product.presaleProductID}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{Number(product.salePrice || product.regularPrice).toLocaleString('en-IN')}
                          </span>
                          {product.salePrice && product.regularPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{Number(product.regularPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                            : product.status === 'completed' 
                            ? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                            : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                        }`}>
                          {product.status || 'inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {product.preSaleStartDate 
                            ? new Date(product.preSaleStartDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : <span className="text-gray-400">-</span>
                          }
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {product.preSaleEndDate 
                            ? new Date(product.preSaleEndDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : <span className="text-gray-400">-</span>
                          }
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/presale/products/edit/${product.presaleProductID}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/btn"
                            title="Edit"
                          >
                            <MdEdit size={18} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.presaleProductID)}
                            disabled={deleteLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                            title="Delete"
                          >
                            <MdDelete size={18} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </Layout>
  );
}

