import React, { useRef, useState, useEffect } from 'react';
import Layout from 'src/layout';
import InputUi from '@/components/ui/inputui';
import Container from '@/components/ui/container';
import UploadImages from '@/components/ui/uploadImages';
import { createHomepageSection, searchCategories, searchOffers } from './../../lib/api/homepageSectionsApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddHomepageSection = () => {
    const imageRef = useRef();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [sectionData, setSectionData] = useState({
        title: '',
        image: '',
        link: '/shop',
        routeTo: 'shop',
        position: 1,
        isActive: true,
        filters: {}
    });

    const [filterKey, setFilterKey] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searching, setSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Route options (without slash)
    const routeToOptions = [
        { value: 'shop', label: 'Shop' },
        { value: 'category', label: 'Category' },
        { value: 'categories', label: 'Categories' },
        { value: 'products', label: 'Products' },
        { value: 'offers', label: 'Offers' },
        { value: 'combo', label: 'Combo' },
        { value: 'presale', label: 'Pre-Sale' },
    ];

    // Link options (with slash)
    const linkOptions = [
        { value: '/shop', label: '/shop' },
        { value: '/category', label: '/category' },
        { value: '/categories', label: '/categories' },
        { value: '/products', label: '/products' },
        { value: '/offers', label: '/offers' },
        { value: '/combo', label: '/combo' },
        { value: '/presale', label: '/presale' },
    ];

    // Filter key options
    const filterKeyOptions = [
        { value: 'type', label: 'Type' },
        { value: 'categoryID', label: 'Category ID' },
        { value: 'offerID', label: 'Offer ID' },
        { value: 'minPrice', label: 'Min Price' },
        { value: 'maxPrice', label: 'Max Price' },
        { value: 'sortBy', label: 'Sort By' },
        { value: 'brandID', label: 'Brand ID' },
        { value: 'search', label: 'Search' },
    ];

    // Filter value options based on selected key
    const getFilterValueOptions = () => {
        switch (filterKey) {
            case 'type':
                return [
                    { value: 'variable', label: 'Variable' },
                    { value: 'combo', label: 'Combo' },
                    { value: 'make_combo', label: 'Make Combo' },
                    { value: 'customproduct', label: 'Custom Product' },
                ];
            case 'sortBy':
                return [
                    { value: 'price_low_to_high', label: 'Price: Low to High' },
                    { value: 'price_high_to_low', label: 'Price: High to Low' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'popular', label: 'Popular' },
                ];
            default:
                return [];
        }
    };

    // Debounced search for categories and offers
    useEffect(() => {
        if (!showSearch || !searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const searchTimeout = setTimeout(async () => {
            setSearching(true);
            try {
                if (filterKey === 'categoryID') {
                    const response = await searchCategories(searchQuery);
                    if (response.success) {
                        setSearchResults(response.data || []);
                    } else {
                        setSearchResults([]);
                    }
                } else if (filterKey === 'offerID') {
                    const response = await searchOffers(searchQuery);
                    if (response.result) {
                        setSearchResults(response.result || []);
                    } else {
                        setSearchResults([]);
                    }
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [searchQuery, filterKey, showSearch]);

    const handleChange = (e, name) => {
        const value = e.target.value;
        if (name === 'position') {
            setSectionData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else if (name === 'isActive') {
            setSectionData(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
            setSectionData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFilterKeyChange = (e) => {
        const newKey = e.target.value;
        setFilterKey(newKey);
        setFilterValue('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedItem(null);
        setShowSearch(false);
    };

    const handleAddFilterClick = () => {
        if (!filterKey.trim()) {
            toast.error('Please select a filter type');
            return;
        }

        // Show search for categoryID and offerID
        if (filterKey === 'categoryID' || filterKey === 'offerID') {
            setShowSearch(true);
            return;
        }

        // For filters with dropdown options (type, sortBy), show the value selection
        const valueOptions = getFilterValueOptions();
        if (valueOptions.length > 0) {
            // Don't call handleAddFilter yet, just show the value selection
            return;
        }

        // For other filters (minPrice, maxPrice, etc.), proceed with normal flow
        // But only if value is already provided
        if (filterValue) {
            handleAddFilter();
        }
    };

    const handleSelectSearchResult = (item) => {
        let selectedValue;
        if (filterKey === 'categoryID') {
            selectedValue = item.categoryID;
            setSelectedItem({ id: item.categoryID, name: item.categoryName });
        } else if (filterKey === 'offerID') {
            selectedValue = item.offerID;
            setSelectedItem({ id: item.offerID, name: item.offerName });
        }

        setFilterValue(selectedValue);
        // Keep search visible, just clear the search query
        setSearchQuery('');
        // Don't clear results or hide search - keep it visible
    };

    const handleAddFilter = () => {
        if (!filterKey.trim()) {
            toast.error('Filter key is required');
            return;
        }

        if (!filterValue && filterKey !== 'minPrice' && filterKey !== 'maxPrice') {
            toast.error('Filter value is required');
            return;
        }

        const newFilters = { ...sectionData.filters };

        // Parse value based on filter key type
        let parsedValue = filterValue;
        if (filterKey === 'minPrice' || filterKey === 'maxPrice') {
            parsedValue = filterValue ? Number(filterValue) : null;
        } else if (filterKey === 'type' || filterKey === 'sortBy') {
            parsedValue = filterValue; // Keep as string
        } else {
            // Try to parse as number if it's numeric, otherwise keep as string
            if (!isNaN(filterValue) && filterValue !== '') {
                parsedValue = Number(filterValue);
            }
        }

        newFilters[filterKey] = parsedValue;
        setSectionData(prev => ({ ...prev, filters: newFilters }));
        setFilterKey('');
        setFilterValue('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedItem(null);
        setShowSearch(false); // Hide search only after filter is added
        toast.success('Filter added');
    };

    const handleRemoveFilter = (key) => {
        const newFilters = { ...sectionData.filters };
        delete newFilters[key];
        setSectionData(prev => ({ ...prev, filters: newFilters }));
        toast.success('Filter removed');
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Upload image
            const imageUpload = await imageRef?.current?.uploadImageFunction();

            if (!imageUpload || !imageUpload.length) {
                toast.error('Image is required');
                setLoading(false);
                return;
            }

            if (!sectionData.routeTo) {
                toast.error('Route To is required');
                setLoading(false);
                return;
            }

            // Ensure routeTo doesn't have leading slash
            const routeTo = sectionData.routeTo.startsWith('/')
                ? sectionData.routeTo.slice(1)
                : sectionData.routeTo;

            // Ensure link has leading slash
            const link = sectionData.link && !sectionData.link.startsWith('/')
                ? `/${sectionData.link}`
                : sectionData.link;

            const payload = {
                title: sectionData.title || null,
                image: imageUpload[0].imgUrl,
                link: link || null,
                routeTo: routeTo,
                filters: Object.keys(sectionData.filters).length > 0 ? sectionData.filters : null,
                position: sectionData.position || 1,
                isActive: sectionData.isActive
            };

            const res = await createHomepageSection(payload);

            if (res.success) {
                toast.success('Homepage section created successfully');
                navigate('/homepage-sections/list');
            } else {
                toast.error(res.error || res.message || 'Failed to create section');
            }
        } catch (error) {
            console.error('Error creating section:', error);
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const filterValueOptions = getFilterValueOptions();
    const hasValueOptions = filterValueOptions.length > 0;
    const showFilterValueInput = filterKey && !hasValueOptions && filterKey !== 'categoryID' && filterKey !== 'offerID';
    const showFilterValueSelect = filterKey && hasValueOptions && filterKey !== 'categoryID' && filterKey !== 'offerID';
    const needsSearch = filterKey === 'categoryID' || filterKey === 'offerID';

    return (
        <Layout active={'admin-homepage-sections-add'} title={'Add Homepage Section'}>
            <div className="grid grid-cols-6 gap-5">
                <div className="col-span-4">
                    <div className="flex flex-col gap-3">
                        <Container label={'Section Information'} gap={3}>
                            <InputUi
                                label="Title (Optional)"
                                value={sectionData.title}
                                datafunction={(e) => handleChange(e, 'title')}
                                placeholder="e.g., Top Deals, New Arrivals"
                            />

                            <div>
                                <label className="block text-sm font-medium text-secondary-text mb-1">
                                    Route To <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={sectionData.routeTo}
                                    onChange={(e) => handleChange(e, 'routeTo')}
                                    className="w-full p-2 rounded-[10px] my-1 border border-grey text-xs tracking-wideset h-[35px]"
                                >
                                    {routeToOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-text mb-1">
                                    Link (Optional - Fallback)
                                </label>
                                <select
                                    value={sectionData.link}
                                    onChange={(e) => handleChange(e, 'link')}
                                    className="w-full p-2 rounded-[10px] my-1 border border-grey text-xs tracking-wideset h-[35px]"
                                >
                                    {linkOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <InputUi
                                label="Position"
                                type="number"
                                value={sectionData.position}
                                datafunction={(e) => handleChange(e, 'position')}
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={sectionData.isActive}
                                    onChange={(e) => handleChange(e, 'isActive')}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-secondary-text">
                                    Active (Show on homepage)
                                </label>
                            </div>
                        </Container>

                        <Container label={'Shop Filters (Optional)'} gap={3}>
                            <div className="space-y-4">
                                {/* Filter Type Selection */}
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-secondary-text mb-1">
                                            Filter Type
                                        </label>
                                        <select
                                            value={filterKey}
                                            onChange={handleFilterKeyChange}
                                            className="w-full p-2 rounded-[10px] my-1 border border-grey text-xs tracking-wideset h-[35px]"
                                        >
                                            <option value="">Select Filter Type</option>
                                            {filterKeyOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleAddFilterClick}
                                            disabled={!filterKey}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded h-[35px] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Search Section for Category/Offer */}
                                {showSearch && needsSearch && (
                                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-secondary-text mb-1">
                                                Search {filterKey === 'categoryID' ? 'Category' : 'Offer'} by Name
                                            </label>
                                            <InputUi
                                                label=""
                                                value={searchQuery}
                                                datafunction={(e) => setSearchQuery(e.target.value)}
                                                placeholder={`Type to search ${filterKey === 'categoryID' ? 'category' : 'offer'} name...`}
                                            />
                                        </div>

                                        {searching && (
                                            <div className="text-center py-2">
                                                <p className="text-sm text-gray-500">Searching...</p>
                                            </div>
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded bg-white mb-3">
                                                {searchResults.map((item) => {
                                                    const itemId = filterKey === 'categoryID' ? item.categoryID : item.offerID;
                                                    const itemName = filterKey === 'categoryID' ? item.categoryName : item.offerName;
                                                    const isSelected = selectedItem && selectedItem.id === itemId;

                                                    return (
                                                        <div
                                                            key={itemId}
                                                            onClick={() => handleSelectSearchResult(item)}
                                                            className={`p-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${isSelected
                                                                ? 'bg-green-100 border-green-300'
                                                                : 'hover:bg-purple-100'
                                                                }`}
                                                        >
                                                            <p className={`text-sm font-semibold ${isSelected ? 'text-green-800' : 'text-foreground'}`}>
                                                                {itemName}
                                                            </p>
                                                            <p className={`text-xs ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
                                                                ID: {itemId}
                                                            </p>
                                                            {isSelected && (
                                                                <p className="text-xs text-green-700 font-medium mt-1">✓ Selected</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                                            <div className="text-center py-2 mb-3">
                                                <p className="text-sm text-gray-500">No results found</p>
                                            </div>
                                        )}

                                        {/* Selected Item Display (as disabled/selected in list format) */}
                                        {selectedItem && (
                                            <div className="border border-gray-200 rounded-lg p-3 bg-background">
                                                <p className="text-sm font-medium text-secondary-text mb-2">Selected {filterKey === 'categoryID' ? 'Category' : 'Offer'}:</p>
                                                <div className="bg-white p-2 rounded border border-green-300">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">
                                                            <span className="font-semibold text-purple-600">{filterKey}:</span>{' '}
                                                            <span className="text-secondary-text">
                                                                {selectedItem.name} (ID: {selectedItem.id})
                                                            </span>
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedItem(null);
                                                                setFilterValue('');
                                                            }}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleAddFilter}
                                                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                                >
                                                    Add Filter
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Filter Value Select (for type, sortBy, etc.) */}
                                {!showSearch && showFilterValueSelect && (
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-secondary-text mb-1">
                                                Filter Value
                                            </label>
                                            <select
                                                value={filterValue}
                                                onChange={(e) => setFilterValue(e.target.value)}
                                                className="w-full p-2 rounded-[10px] my-1 border border-grey text-xs tracking-wideset h-[35px]"
                                            >
                                                <option value="">Select Filter Value</option>
                                                {filterValueOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleAddFilter}
                                                disabled={!filterValue}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded h-[35px] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Add Filter
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Regular Filter Value Input (for minPrice, maxPrice, etc.) */}
                                {!showSearch && showFilterValueInput && (
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <InputUi
                                                label="Filter Value"
                                                value={filterValue}
                                                datafunction={(e) => setFilterValue(e.target.value)}
                                                placeholder={filterKey === 'minPrice' || filterKey === 'maxPrice' ? 'Enter number' : 'Enter value'}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleAddFilter}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded h-[35px] mt-6"
                                            >
                                                Add Filter
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Current Filters Display */}
                                {Object.keys(sectionData.filters).length > 0 && (
                                    <div className="border border-gray-200 rounded-lg p-4 bg-background">
                                        <p className="text-sm font-medium text-secondary-text mb-2">Current Filters:</p>
                                        <div className="space-y-2">
                                            {Object.entries(sectionData.filters).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                                    <span className="text-sm">
                                                        <span className="font-semibold text-purple-600">{key}:</span>{' '}
                                                        <span className="text-secondary-text">
                                                            {value === null || value === undefined ? 'N/A' : String(value)}
                                                        </span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveFilter(key)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
                                    <p className="font-semibold mb-1">Filter Notes:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Category ID / Offer ID:</strong> Select type, click Add, then search and select</li>
                                        <li><strong>type:</strong> Select from dropdown (variable, combo, make_combo, customproduct)</li>
                                        <li><strong>minPrice/maxPrice:</strong> Enter numeric values</li>
                                        <li><strong>sortBy:</strong> Select from dropdown</li>
                                    </ul>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex flex-col gap-3">
                        <Container label={'Section Image'} gap={3}>
                            <UploadImages ref={imageRef} maxImages={1} />
                        </Container>

                        <div className="flex justify-end">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-fit"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Create Section'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AddHomepageSection;
