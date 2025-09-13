import React, { useEffect, useState, useCallback } from 'react';
import { getPaginatedProducts, getProductCount } from './../../lib/api/productsApi';
import InputUi from '@/components/ui/inputui';

const SelectProducts = ({ onProductToggle, initialSelected = [] }) => {
    // State management
    const [state, setSelected] = useState({
        filters: {
            name: '',
            productID: '',
            categoryID: '',
            categoryName: '',
        },
        appliedFilters: {},
        productsByPage: {},
        page: 1,
        selectedProductIDs: initialSelected,
        loading: false,
        totalPages: 1,
    });

    const {
        filters,
        appliedFilters,
        productsByPage,
        page,
        selectedProductIDs,
        loading,
        totalPages
    } = state;

    const limit = 10;



    // Memoized filter handler
    const handleFilterChange = useCallback((key, value) => {
        setSelected(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [key]: value
            }
        }));
    }, []);

    // Apply filters with debounce potential
    const applyFilters = useCallback(() => {
        setSelected(prev => ({
            ...prev,
            appliedFilters: { ...prev.filters },
            productsByPage: {},
            page: 1
        }));
    }, []);

    // Fetch products with error handling and caching
    const fetchProducts = useCallback(async (pageToFetch) => {
        const pageKey = `page-${pageToFetch}`;
        if (productsByPage[pageKey]) return;

        setSelected(prev => ({ ...prev, loading: true }));

        try {
            const result = await getPaginatedProducts({
                page: pageToFetch,
                limit,
                filters: {
                    name: appliedFilters.name?.trim() || undefined,
                    productID: appliedFilters.productID?.trim() || undefined,
                    categoryID: appliedFilters.categoryID?.trim() || undefined,
                    categoryName: appliedFilters.categoryName?.trim() || undefined,
                },
            });

            const { totalItems } = await getProductCount(filters);




            const parsedProducts = result.data.map(product => ({
                ...product,
                featuredImage: JSON.parse(product.featuredImage || '[]'),
            }));

            // Calculate total pages more accurately
            const calculatedTotalPages = Math.ceil(totalItems / limit) || 1;

            setSelected(prev => ({
                ...prev,
                productsByPage: {
                    ...prev.productsByPage,
                    [pageKey]: parsedProducts,
                },
                totalPages: calculatedTotalPages,
                loading: false,
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            setSelected(prev => ({ ...prev, loading: false }));
        }
    }, [appliedFilters, productsByPage]);

    // Toggle product selection with callback to parent
    const toggleProductSelection = (productID) => {
        setSelected(prev => {
            const isSelected = prev.selectedProductIDs.includes(productID);
            const newSelected = isSelected
                ? prev.selectedProductIDs.filter(id => id !== productID)
                : [...prev.selectedProductIDs, productID];

            return {
                ...prev,
                selectedProductIDs: newSelected
            };
        });

        // ✅ Safe to call outside setState
        onProductToggle(productID);
    };


    // Effects
    useEffect(() => {
        fetchProducts(page);
    }, [page, appliedFilters, fetchProducts]);


    // Get current page products
    const currentProducts = productsByPage[`page-${page}`] || [];

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Filter Section */}
            <div className="grid grid-cols-2 gap-4">
                <InputUi
                    label="Filter by Name"
                    datafunction={(val) => handleFilterChange('name', val.target.value)}
                />
                <InputUi
                    label="Filter by Product ID"
                    datafunction={(val) => handleFilterChange('productID', val.target.value)}
                />
                <InputUi
                    label="Filter by Category Name"
                    datafunction={(val) => handleFilterChange('categoryName', val.target.value)}
                />
                <InputUi
                    label="Filter by Category ID"
                    type="number"
                    datafunction={(val) => handleFilterChange('categoryID', val.target.value)}
                />
            </div>

            <div className='flex justify-end'>
                <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentProducts.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {Object.keys(appliedFilters).length > 0
                                ? "No products match your filters"
                                : "No products available"}
                        </div>
                    ) : (
                        currentProducts.map((product) => {
                            const isSelected = selectedProductIDs.includes(product.productID);
                            return (
                                <ProductCard
                                    key={product.productID}
                                    product={product}
                                    isSelected={isSelected}
                                    onToggle={toggleProductSelection}
                                />
                            );
                        })
                    )}
                </div>
            )}

            {/* Pagination Controls */}

            <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setSelected(prev => ({ ...prev, page: newPage }))}
            />


            {/* Selected Products Summary */}
            {selectedProductIDs.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                    <strong>Selected Products:</strong> {selectedProductIDs.length} items
                    <div className="mt-1 text-xs text-gray-600 truncate">
                        IDs: {selectedProductIDs.join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
};

// Extracted Product Card Component for better readability
const ProductCard = ({ product, isSelected, onToggle }) => (
    <label
        onClick={() => onToggle(product.productID)}
        className={`relative cursor-pointer flex flex-col p-3 gap-2 border rounded-lg overflow-hidden transition-all duration-200 ${isSelected
            ? 'border-green-500 ring-2 ring-green-200'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
    >
        {isSelected && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 z-10 flex items-center justify-center">
                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Selected
                </div>
            </div>
        )}
        <div className="bg-gray-100 rounded overflow-hidden flex items-center justify-center" style={{height: '96px', width: '100%'}}>
            <img
                src={product.featuredImage?.[0]?.imgUrl || '/placeholder.png'}
                alt={product.name}
                className="max-h-24 w-auto object-contain"
                loading="lazy"
            />
        </div>
        <div className="mt-2">
            <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
            <div className="text-xs text-gray-500">ID: {product.productID}</div>
        </div>
    </label>
);

// Extracted Pagination Controls Component
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => canGoPrev && onPageChange(currentPage - 1)}
                    disabled={!canGoPrev}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${canGoPrev ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                    Previous
                </button>
                <button
                    onClick={() => canGoNext && onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${canGoNext ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => canGoPrev && onPageChange(currentPage - 1)}
                            disabled={!canGoPrev}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!canGoPrev ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {/* Current Page */}
                        <button
                            aria-current="page"
                            className="relative z-10 inline-flex items-center bg-blue-500 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                        >
                            {currentPage}
                        </button>
                        <button
                            onClick={() => canGoNext && onPageChange(currentPage + 1)}
                            disabled={!canGoNext}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!canGoNext ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l4.5 4.25a.75.75 0 01-1.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};


export default React.memo(SelectProducts);