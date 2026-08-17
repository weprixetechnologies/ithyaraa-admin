import React, { useEffect, useState, useMemo } from 'react';
import { getAllPresaleProducts } from './../../lib/api/presaleProductsApi';
import InputUi from '@/components/ui/inputui';

const SelectPresaleProducts = ({ onProductToggle, initialSelected = [] }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProductIDs, setSelectedProductIDs] = useState(initialSelected);
    const [filters, setFilters] = useState({ name: '', presaleProductID: '' });

    // Sync selectedProductIDs when initialSelected changes
    useEffect(() => {
        if (initialSelected && Array.isArray(initialSelected)) {
            setSelectedProductIDs(initialSelected);
        }
    }, [initialSelected]);

    // Fetch all presale products
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const res = await getAllPresaleProducts();
                if (res.success && Array.isArray(res.data)) {
                    const parsed = res.data.map(product => {
                        let parsedImage = [];
                        try {
                            if (typeof product.featuredImage === 'string' && product.featuredImage.trim().length > 0) {
                                parsedImage = JSON.parse(product.featuredImage);
                            } else if (Array.isArray(product.featuredImage)) {
                                parsedImage = product.featuredImage;
                            }
                        } catch (e) {
                            parsedImage = [];
                        }
                        return { ...product, parsedImage };
                    });
                    setAllProducts(parsed);
                }
            } catch (err) {
                console.error('Error fetching presale products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Memoized filtered products
    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const matchName = filters.name.trim() === '' || 
                (p.name && p.name.toLowerCase().includes(filters.name.toLowerCase()));
            const matchID = filters.presaleProductID.trim() === '' || 
                (p.presaleProductID && p.presaleProductID.toLowerCase().includes(filters.presaleProductID.toLowerCase()));
            return matchName && matchID;
        });
    }, [allProducts, filters]);

    // Toggle product selection with callback to parent
    const toggleProductSelection = (productID) => {
        setSelectedProductIDs(prev => {
            const isSelected = prev.includes(productID);
            const newSelected = isSelected
                ? prev.filter(id => id !== productID)
                : [...prev, productID];
            return newSelected;
        });
        onProductToggle(productID);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Filter Section */}
            <div className="grid grid-cols-2 gap-4">
                <InputUi
                    label="Filter by Name"
                    datafunction={(val) => handleFilterChange('name', val.target.value)}
                />
                <InputUi
                    label="Filter by Presale Product ID"
                    datafunction={(val) => handleFilterChange('presaleProductID', val.target.value)}
                />
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1 border rounded">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No presale products match your filters
                        </div>
                    ) : (
                        filteredProducts.map((product) => {
                            const isSelected = selectedProductIDs.includes(product.presaleProductID);
                            return (
                                <ProductCard
                                    key={product.presaleProductID}
                                    product={product}
                                    isSelected={isSelected}
                                    onToggle={toggleProductSelection}
                                />
                            );
                        })
                    )}
                </div>
            )}

            {/* Selected Products Summary */}
            {selectedProductIDs.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 border rounded text-sm">
                    <strong>Selected Presale Products:</strong> {selectedProductIDs.length} items
                    <div className="mt-1 text-xs text-gray-500 truncate">
                        IDs: {selectedProductIDs.join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductCard = ({ product, isSelected, onToggle }) => (
    <label
        onClick={() => onToggle(product.presaleProductID)}
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
        <div className="bg-gray-100 rounded overflow-hidden flex items-center justify-center" style={{ height: '96px', width: '100%' }}>
            <img
                src={product.parsedImage?.[0]?.imgUrl || '/placeholder.png'}
                alt={product.name}
                className="max-h-24 w-auto object-contain"
                loading="lazy"
            />
        </div>
        <div className="mt-2">
            <div className="font-medium text-foreground line-clamp-1">{product.name}</div>
            <div className="text-xs text-gray-500">ID: {product.presaleProductID}</div>
            <div className="text-xs text-purple-600 font-semibold mt-1">
                Price: ₹{product.salePrice || product.regularPrice}
            </div>
        </div>
    </label>
);

export default React.memo(SelectPresaleProducts);
